import {
  CourtAssignment,
  FinishedMatch,
  Match,
  MatchRound,
  OngoingMatch,
  ScheduledMatch,
  TournamentCategory,
} from "@/types/tournament";

export const TOTAL_COURTS = 6;

/**
 * Checks if a round is considered a Semi-Final or Final for crowd retention logic.
 */
export function isClimaxRound(round: MatchRound): boolean {
  return round === "Semi-Final" || round === "Final";
}

/**
 * Checks if all preliminary (non-Semi/Final) matches across all categories are completed.
 */
export function arePreliminariesComplete(matches: Match[]): boolean {
  return !matches.some(
    (m) =>
      !m.isSemiOrFinal &&
      (m.status === "scheduled" || m.status === "ongoing")
  );
}

/**
 * Smart Court Scheduling Engine:
 * 1. Identifies free courts among Court 1 through Court 6.
 * 2. Implements Crowd Retention Logic: Holds back Semi-Finals and Finals
 *    until preliminary matches conclude or organizer manually unfreezes the queue.
 * 3. Assigns the highest priority queued match to the free court.
 */
/**
 * Returns prioritized scheduled matches respecting crowd retention gates.
 */
export function getProposedNextMatches(
  currentMatches: Match[],
  retentionQueueHeld: boolean = true
): ScheduledMatch[] {
  const preliminariesFinished = arePreliminariesComplete(currentMatches);
  const scheduledMatches = currentMatches.filter(
    (m): m is ScheduledMatch => m.status === "scheduled"
  );
  const regularQueued = scheduledMatches.filter((m) => !m.isSemiOrFinal);
  const climaxQueued = scheduledMatches.filter((m) => m.isSemiOrFinal);
  const allowClimax = !retentionQueueHeld || preliminariesFinished;
  return allowClimax ? [...regularQueued, ...climaxQueued] : [...regularQueued];
}

/**
 * Smart Court Scheduling Engine:
 * 1. Identifies free courts among Court 1 through Court 6.
 * 2. Implements Crowd Retention Logic: Holds back Semi-Finals and Finals
 *    until preliminary matches conclude or organizer manually unfreezes the queue.
 * 3. Immediately proposes the next queued match to the vacant court so the umpire
 *    can call teams and commence the match when ready.
 */
export function assignNextMatchesToFreeCourts(
  currentMatches: Match[],
  retentionQueueHeld: boolean = true
): {
  updatedMatches: Match[];
  updatedCourts: CourtAssignment[];
  assignedCount: number;
} {
  const matches = [...currentMatches];

  // Initialize court occupancy map
  const courtOccupancy: Record<number, string | null> = {};
  for (let c = 1; c <= TOTAL_COURTS; c++) {
    courtOccupancy[c] = null;
  }

  // Find currently occupied courts (ongoing matches take precedence)
  matches.forEach((m) => {
    if (m.status === "ongoing" && m.courtNumber && m.courtNumber <= TOTAL_COURTS) {
      courtOccupancy[m.courtNumber] = m.matchId;
    }
  });

  // Also retain court designation for scheduled matches already assigned to a court
  matches.forEach((m) => {
    if (
      m.status === "scheduled" &&
      m.courtNumber &&
      m.courtNumber <= TOTAL_COURTS &&
      !courtOccupancy[m.courtNumber]
    ) {
      courtOccupancy[m.courtNumber] = m.matchId;
    }
  });

  const freeCourts: number[] = [];
  for (let c = 1; c <= TOTAL_COURTS; c++) {
    if (!courtOccupancy[c]) {
      freeCourts.push(c);
    }
  }

  if (freeCourts.length === 0) {
    const courtsList: CourtAssignment[] = Object.entries(courtOccupancy).map(
      ([c, matchId]) => ({
        courtNumber: Number(c),
        currentMatchId: matchId,
      })
    );
    return { updatedMatches: matches, updatedCourts: courtsList, assignedCount: 0 };
  }

  // Get eligible queued matches that haven't been assigned to another court
  const eligibleQueue = getProposedNextMatches(matches, retentionQueueHeld).filter(
    (m) => !m.courtNumber
  );

  let assignedCount = 0;

  for (const courtNum of freeCourts) {
    if (eligibleQueue.length === 0) break;

    const nextMatch = eligibleQueue.shift()!;
    const matchIdx = matches.findIndex((m) => m.matchId === nextMatch.matchId);

    if (matchIdx !== -1) {
      // Propose match to this court (remains scheduled until Umpire taps "Commence Match")
      matches[matchIdx] = {
        ...nextMatch,
        courtNumber: courtNum,
      };
      courtOccupancy[courtNum] = nextMatch.matchId;
      assignedCount++;
    }
  }

  const updatedCourts: CourtAssignment[] = Object.entries(courtOccupancy).map(
    ([c, matchId]) => ({
      courtNumber: Number(c),
      currentMatchId: matchId,
    })
  );

  return {
    updatedMatches: matches,
    updatedCourts,
    assignedCount,
  };
}

/**
 * Manually reassigns an ongoing or scheduled match to a specific court.
 */
export function manualCourtReassignment(
  matches: Match[],
  matchId: string,
  targetCourtNumber: number
): Match[] {
  return matches.map((m) => {
    if (m.matchId === matchId) {
      if (m.status === "ongoing") {
        return { ...m, courtNumber: targetCourtNumber, lastUpdated: new Date().toISOString() };
      }
      if (m.status === "scheduled") {
        return { ...m, courtNumber: targetCourtNumber };
      }
    }
    // If another ongoing match was on that target court, unseat it or swap
    if (
      m.matchId !== matchId &&
      m.status === "ongoing" &&
      m.courtNumber === targetCourtNumber
    ) {
      return { ...m, courtNumber: null as unknown as number, lastUpdated: new Date().toISOString() };
    }
    return m;
  });
}
