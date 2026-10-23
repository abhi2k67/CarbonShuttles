import { generateSeedTournament } from "@/lib/data/seedData";
import { generateFixturesFromTeams } from "@/lib/data/teamPools";
import {
  awardPoint,
  subtractPoint,
  switchServer,
  recordWalkoverOrRetirement,
  fastFinishMatch,
} from "@/lib/engine/scoring";
import {
  assignNextMatchesToFreeCourts,
  manualCourtReassignment,
} from "@/lib/engine/scheduler";
import {
  MatchAction,
  OngoingMatch,
  TournamentState,
} from "@/types/tournament";

export interface SSEEvent {
  id: number;
  type: "STATE_SNAPSHOT" | "MATCH_UPDATE" | "COURT_ASSIGNED" | "QUEUE_UPDATED" | "HEARTBEAT";
  data: unknown;
  timestamp: number;
}

// Global in-memory singleton to persist state in Next.js development and runtime
declare global {
  var __carbonTournamentState: TournamentState | undefined;
  var __carbonEventLog: SSEEvent[] | undefined;
  var __carbonSubscribers: Set<ReadableStreamDefaultController> | undefined;
}

if (!globalThis.__carbonTournamentState) {
  globalThis.__carbonTournamentState = generateSeedTournament();
}
if (!globalThis.__carbonEventLog) {
  globalThis.__carbonEventLog = [];
}
if (!globalThis.__carbonSubscribers) {
  globalThis.__carbonSubscribers = new Set();
}

const state = globalThis.__carbonTournamentState!;
const eventLog = globalThis.__carbonEventLog!;
const subscribers = globalThis.__carbonSubscribers!;

export function getTournamentState(): TournamentState {
  return state;
}

export function subscribeClient(controller: ReadableStreamDefaultController) {
  subscribers.add(controller);
}

export function unsubscribeClient(controller: ReadableStreamDefaultController) {
  subscribers.delete(controller);
}

export function broadcastEvent(type: SSEEvent["type"], data: unknown): SSEEvent {
  state.lastEventId += 1;
  const event: SSEEvent = {
    id: state.lastEventId,
    type,
    data,
    timestamp: Date.now(),
  };

  eventLog.push(event);
  if (eventLog.length > 200) {
    eventLog.shift(); // keep last 200 events in memory journal
  }

  const encoder = new TextEncoder();
  const rawPayload = `id: ${event.id}\nevent: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
  const encoded = encoder.encode(rawPayload);

  for (const controller of subscribers) {
    try {
      controller.enqueue(encoded);
    } catch {
      subscribers.delete(controller);
    }
  }

  return event;
}

export function getEventsSince(lastEventId: number): SSEEvent[] {
  return eventLog.filter((e) => e.id > lastEventId);
}

export function handleMatchAction(action: MatchAction): TournamentState {
  state.version += 1;
  state.lastUpdated = new Date().toISOString();

  switch (action.type) {
    case "AWARD_POINT": {
      const matchIdx = state.matches.findIndex((m) => m.matchId === action.matchId);
      if (matchIdx !== -1) {
        const currentMatch = state.matches[matchIdx];
        if (currentMatch.status === "ongoing") {
          const updated = awardPoint(currentMatch, action.team);
          state.matches[matchIdx] = updated;

          // If match just finished, auto-schedule and propose next match for that freed court
          if (updated.status === "finished") {
            const { updatedMatches, updatedCourts } = assignNextMatchesToFreeCourts(
              state.matches,
              state.retentionQueueHeld
            );
            state.matches = updatedMatches;
            state.courts = updatedCourts;
            broadcastEvent("QUEUE_UPDATED", { state });
          } else {
            broadcastEvent("MATCH_UPDATE", { match: updated, action });
          }
        }
      }
      break;
    }

    case "SUBTRACT_POINT": {
      const matchIdx = state.matches.findIndex((m) => m.matchId === action.matchId);
      if (matchIdx !== -1) {
        const currentMatch = state.matches[matchIdx];
        if (currentMatch.status === "ongoing") {
          const updated = subtractPoint(currentMatch, action.team);
          state.matches[matchIdx] = updated;
          broadcastEvent("MATCH_UPDATE", { match: updated, action });
        }
      }
      break;
    }

    case "SWITCH_SERVER": {
      const matchIdx = state.matches.findIndex((m) => m.matchId === action.matchId);
      if (matchIdx !== -1) {
        const currentMatch = state.matches[matchIdx];
        if (currentMatch.status === "ongoing") {
          const updated = switchServer(currentMatch);
          state.matches[matchIdx] = updated;
          broadcastEvent("MATCH_UPDATE", { match: updated, action });
        }
      }
      break;
    }

    case "START_MATCH": {
      const matchIdx = state.matches.findIndex((m) => m.matchId === action.matchId);
      if (matchIdx !== -1) {
        const scheduled = state.matches[matchIdx];
        if (scheduled.status === "scheduled") {
          const now = new Date().toISOString();
          const ongoing: OngoingMatch = {
            ...scheduled,
            status: "ongoing",
            courtNumber: action.courtNumber,
            currentSet: 1,
            setScores: [],
            currentScore: { teamA: 0, teamB: 0 },
            servingTeam: "teamA",
            servingCourtSide: "right",
            startTime: now,
            lastUpdated: now,
            isDeuce: false,
            isGamePoint: null,
            isMatchPoint: null,
          };
          state.matches[matchIdx] = ongoing;

          // Update court
          const courtEntry = state.courts.find((c) => c.courtNumber === action.courtNumber);
          if (courtEntry) {
            courtEntry.currentMatchId = ongoing.matchId;
          }

          broadcastEvent("QUEUE_UPDATED", { state });
        }
      }
      break;
    }

    case "REASSIGN_COURT": {
      state.matches = manualCourtReassignment(
        state.matches,
        action.matchId,
        action.newCourtNumber
      );
      // Re-map courts
      state.courts = state.courts.map((c) => {
        const match = state.matches.find(
          (m) => m.status === "ongoing" && m.courtNumber === c.courtNumber
        );
        return {
          courtNumber: c.courtNumber,
          currentMatchId: match ? match.matchId : null,
        };
      });
      broadcastEvent("QUEUE_UPDATED", { state });
      break;
    }

    case "TOGGLE_RETENTION_QUEUE": {
      state.retentionQueueHeld = action.held;
      // If unheld, auto assign any eligible pending matches
      if (!action.held) {
        const { updatedMatches, updatedCourts } = assignNextMatchesToFreeCourts(
          state.matches,
          false
        );
        state.matches = updatedMatches;
        state.courts = updatedCourts;
      }
      broadcastEvent("QUEUE_UPDATED", { state });
      break;
    }

    case "CONFIGURE_AND_START_TOURNAMENT": {
      const generated = generateFixturesFromTeams(action.categoryTeams);
      state.matches = generated.matches;
      state.courts = generated.courts;
      state.categoryTeams = action.categoryTeams;
      state.isConfigured = true;
      state.retentionQueueHeld = true;
      state.lastUpdated = new Date().toISOString();
      broadcastEvent("STATE_SNAPSHOT", state);
      break;
    }

    case "RESET_TO_SETUP": {
      state.isConfigured = false;
      state.lastUpdated = new Date().toISOString();
      broadcastEvent("STATE_SNAPSHOT", state);
      break;
    }

    case "WALKOVER": {
      const matchIdx = state.matches.findIndex((m) => m.matchId === action.matchId);
      if (matchIdx !== -1) {
        const currentMatch = state.matches[matchIdx];
        const updated = recordWalkoverOrRetirement(currentMatch, action.winner, action.reason);
        state.matches[matchIdx] = updated;

        const { updatedMatches, updatedCourts } = assignNextMatchesToFreeCourts(
          state.matches,
          state.retentionQueueHeld
        );
        state.matches = updatedMatches;
        state.courts = updatedCourts;
        broadcastEvent("QUEUE_UPDATED", { state });
      }
      break;
    }

    case "FAST_FINISH_MATCH": {
      const matchIdx = state.matches.findIndex((m) => m.matchId === action.matchId);
      if (matchIdx !== -1) {
        const currentMatch = state.matches[matchIdx];
        if (currentMatch.status === "ongoing") {
          const updated = fastFinishMatch(currentMatch);
          state.matches[matchIdx] = updated;

          const { updatedMatches, updatedCourts } = assignNextMatchesToFreeCourts(
            state.matches,
            state.retentionQueueHeld
          );
          state.matches = updatedMatches;
          state.courts = updatedCourts;
          broadcastEvent("QUEUE_UPDATED", { state });
        }
      }
      break;
    }

    case "RESTORE_STATE": {
      if (action.state && Array.isArray(action.state.matches)) {
        state.matches = action.state.matches;
        state.courts = action.state.courts || state.courts;
        state.isConfigured = action.state.isConfigured ?? true;
        state.categoryTeams = action.state.categoryTeams ?? state.categoryTeams;
        state.retentionQueueHeld = action.state.retentionQueueHeld ?? false;
        state.lastUpdated = new Date().toISOString();
        broadcastEvent("STATE_SNAPSHOT", state);
      }
      break;
    }

    case "RESET_TOURNAMENT": {
      const fresh = generateSeedTournament();
      state.matches = fresh.matches;
      state.courts = fresh.courts;
      state.categoryTeams = fresh.categoryTeams;
      state.isConfigured = true;
      state.retentionQueueHeld = fresh.retentionQueueHeld;
      state.lastUpdated = new Date().toISOString();
      broadcastEvent("STATE_SNAPSHOT", state);
      break;
    }
  }

  return state;
}
