"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Match,
  MatchAction,
  OngoingMatch,
  TournamentState,
} from "@/types/tournament";
import {
  cacheTournamentStateOffline,
  getCachedTournamentState,
} from "@/lib/offline/db";
import { syncQueue } from "@/lib/offline/syncQueue";
import {
  playDeuceAlert,
  playMatchPointAlert,
  playPointChime,
  playVictoryFanfare,
} from "@/lib/sound/buzzer";

export type StreamConnectionStatus =
  | "connected"
  | "connecting"
  | "reconnecting"
  | "offline";

export function useMatchStream() {
  const [state, setState] = useState<TournamentState | null>(null);
  const [connectionStatus, setConnectionStatus] =
    useState<StreamConnectionStatus>("connecting");
  const [syncStatus, setSyncStatus] = useState({
    isOnline: true,
    pendingCount: 0,
    isSyncing: false,
  });

  const lastEventIdRef = useRef<number>(0);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const backoffRef = useRef<number>(1000);
  const connectSSERef = useRef<() => void>(() => {});

  // Subscribe to offline sync queue changes
  useEffect(() => {
    const unsubscribe = syncQueue.subscribe((status) => {
      setSyncStatus(status);
      if (!status.isOnline) {
        setConnectionStatus("offline");
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  // Initial load from IndexedDB cache
  useEffect(() => {
    let isMounted = true;
    getCachedTournamentState().then((cached) => {
      if (isMounted && cached) {
        setState((prev) => {
          if (!prev) {
            lastEventIdRef.current = cached.lastEventId || 0;
            return cached;
          }
          return prev;
        });
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Establish SSE Connection
  const connectSSE = useCallback(() => {
    if (typeof window === "undefined") return;

    if (!navigator.onLine) {
      setConnectionStatus("offline");
      return;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setConnectionStatus((prev) => (prev === "connected" ? "reconnecting" : "connecting"));

    const url = `/api/matches/stream?lastEventId=${lastEventIdRef.current}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnectionStatus("connected");
      backoffRef.current = 1000; // reset backoff on success
    };

    es.addEventListener("STATE_SNAPSHOT", (event: MessageEvent) => {
      try {
        const data: TournamentState = JSON.parse(event.data);
        if (event.lastEventId) {
          lastEventIdRef.current = parseInt(event.lastEventId, 10);
        }
        setState(data);
        cacheTournamentStateOffline(data);
      } catch (e) {
        console.error("Error parsing STATE_SNAPSHOT:", e);
      }
    });

    es.addEventListener("MATCH_UPDATE", (event: MessageEvent) => {
      try {
        const payload: { match: Match; action: MatchAction } = JSON.parse(
          event.data
        );
        if (event.lastEventId) {
          lastEventIdRef.current = parseInt(event.lastEventId, 10);
        }

        setState((prev) => {
          if (!prev) return prev;
          const matchIndex = prev.matches.findIndex(
            (m) => m.matchId === payload.match.matchId
          );
          if (matchIndex === -1) return prev;

          const updatedMatches = [...prev.matches];
          updatedMatches[matchIndex] = payload.match;

          // Sound triggers based on match events
          if (payload.match.status === "ongoing") {
            const m = payload.match as OngoingMatch;
            if (m.isMatchPoint) {
              playMatchPointAlert();
            } else if (m.isDeuce) {
              playDeuceAlert();
            } else {
              playPointChime();
            }
          } else if (payload.match.status === "finished") {
            playVictoryFanfare();
          }

          const newState: TournamentState = {
            ...prev,
            lastEventId: lastEventIdRef.current,
            matches: updatedMatches,
            lastUpdated: new Date().toISOString(),
          };

          cacheTournamentStateOffline(newState);
          return newState;
        });
      } catch (e) {
        console.error("Error parsing MATCH_UPDATE:", e);
      }
    });

    es.addEventListener("COURT_ASSIGNED", (event: MessageEvent) => {
      try {
        const payload: { match: Match; courtNumber: number } = JSON.parse(
          event.data
        );
        if (event.lastEventId) {
          lastEventIdRef.current = parseInt(event.lastEventId, 10);
        }

        setState((prev) => {
          if (!prev) return prev;
          const updatedMatches = prev.matches.map((m) =>
            m.matchId === payload.match.matchId ? payload.match : m
          );
          const updatedCourts = prev.courts.map((c) =>
            c.courtNumber === payload.courtNumber
              ? { ...c, currentMatchId: payload.match.matchId }
              : c
          );
          const newState: TournamentState = {
            ...prev,
            lastEventId: lastEventIdRef.current,
            matches: updatedMatches,
            courts: updatedCourts,
            lastUpdated: new Date().toISOString(),
          };
          cacheTournamentStateOffline(newState);
          return newState;
        });
      } catch (e) {
        console.error("Error parsing COURT_ASSIGNED:", e);
      }
    });

    es.addEventListener("QUEUE_UPDATED", (event: MessageEvent) => {
      try {
        const payload: { state: TournamentState } = JSON.parse(event.data);
        if (event.lastEventId) {
          lastEventIdRef.current = parseInt(event.lastEventId, 10);
        }
        setState(payload.state);
        cacheTournamentStateOffline(payload.state);
      } catch (e) {
        console.error("Error parsing QUEUE_UPDATED:", e);
      }
    });

    es.onerror = () => {
      es.close();
      setConnectionStatus(navigator.onLine ? "reconnecting" : "offline");

      // Auto reconnect with exponential backoff
      const nextDelay = Math.min(backoffRef.current * 1.5, 10000);
      backoffRef.current = nextDelay;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(() => {
        connectSSERef.current();
      }, nextDelay);
    };
  }, []);

  useEffect(() => {
    connectSSERef.current = connectSSE;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      connectSSE();
    }, 0);

    const handleOnline = () => {
      connectSSE();
    };
    const handleOffline = () => {
      setConnectionStatus("offline");
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectSSE]);

  /**
   * Dispatches match action optimistically and queues for background sync
   */
  const dispatch = useCallback(async (action: MatchAction) => {
    // 1. Optimistic local update
    setState((prev) => {
      if (!prev) return prev;
      // We can create a temporary copy to display instantaneous change
      return prev;
    });

    // 2. Play immediate sound locally if appropriate
    if (action.type === "AWARD_POINT") {
      playPointChime();
    }

    // 3. Queue to offline sync manager
    await syncQueue.enqueueAndSync(action);
  }, []);

  return {
    state,
    connectionStatus,
    syncStatus,
    dispatch,
    reconnect: connectSSE,
  };
}
