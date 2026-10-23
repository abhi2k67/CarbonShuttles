"use client";

import React, { useState, useEffect, useRef } from "react";
import { useMatchStream } from "@/hooks/useMatchStream";
import { Header, ActiveTab } from "@/components/Header";
import { ArenaView } from "@/components/ArenaView";
import { UmpireConsole } from "@/components/UmpireConsole";
import { StandingsTable } from "@/components/StandingsTable";
import { BracketsViewer } from "@/components/BracketsViewer";
import { HallOfFame } from "@/components/HallOfFame";
import { OrganizerConsole } from "@/components/OrganizerConsole";
import { TournamentSetupWizard } from "@/components/TournamentSetupWizard";
import confetti from "canvas-confetti";
import { OngoingMatch, TournamentCategory } from "@/types/tournament";
import { Radio, Trophy, Flame, Crown, Zap } from "lucide-react";

export default function Home() {
  const { state, connectionStatus, syncStatus, dispatch } =
    useMatchStream();

  const [activeTab, setActiveTab] = useState<ActiveTab>("arena");
  const [selectedCourt, setSelectedCourt] = useState<number>(1);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const savedSpeed = localStorage.getItem("carbon_sim_speed");
      if (savedSpeed) return Number(savedSpeed);
    }
    return 2500;
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("carbon_is_admin") === "true";
    }
    return false;
  });
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("carbon_theme") as "dark" | "light") || "dark";
    }
    return "dark";
  });
  const simTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize document theme class
  useEffect(() => {
    if (typeof window === "undefined") return;
    document.documentElement.classList.toggle("light", theme === "light");
  }, [theme]);

  // Auto-persist snapshot to localStorage for disaster recovery
  useEffect(() => {
    if (state && state.matches && state.matches.length > 0) {
      try {
        localStorage.setItem("carbon_auto_save_state", JSON.stringify(state));
      } catch (e) {
        console.warn("Local storage quota limit reached for auto-save:", e);
      }
    }
  }, [state]);

  const handleToggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("carbon_theme", nextTheme);
    document.documentElement.classList.toggle("light", nextTheme === "light");
  };

  const handleAdminLogin = (status: boolean) => {
    setIsAdmin(status);
    localStorage.setItem("carbon_is_admin", status ? "true" : "false");
  };

  const handleSpeedChange = (speed: number) => {
    setSimSpeed(speed);
    localStorage.setItem("carbon_sim_speed", String(speed));
  };

  // Trigger celebration confetti when a match completes
  const prevFinishedMatchesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!state) return;
    const currentFinishedIds = new Set(
      state.matches.filter((m) => m.status === "finished").map((m) => m.matchId)
    );

    // If there is a new finished match that was not finished previously
    if (prevFinishedMatchesRef.current.size > 0) {
      for (const id of currentFinishedIds) {
        if (!prevFinishedMatchesRef.current.has(id)) {
          confetti({
            particleCount: 75,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#10b981", "#f59e0b", "#00e5ff", "#e2e8f0"],
          });
          break;
        }
      }
    }
    prevFinishedMatchesRef.current = currentFinishedIds;
  }, [state]);

  // Demo Live Simulation Loop: Automatically simulates active rallies with adjustable speed
  useEffect(() => {
    if (!isSimulating || !state || !state.isConfigured) {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
      return;
    }

    simTimerRef.current = setInterval(() => {
      const ongoing = state.matches.filter(
        (m): m is OngoingMatch => m.status === "ongoing"
      );
      if (ongoing.length === 0) {
        setIsSimulating(false);
        return;
      }

      // Pick a random ongoing court match
      const targetMatch = ongoing[Math.floor(Math.random() * ongoing.length)];
      // Randomly award to team A or B (weighted slightly towards trailing team to trigger deuces)
      const team: "teamA" | "teamB" =
        targetMatch.currentScore.teamA < targetMatch.currentScore.teamB
          ? Math.random() < 0.65
            ? "teamA"
            : "teamB"
          : targetMatch.currentScore.teamB < targetMatch.currentScore.teamA
          ? Math.random() < 0.65
            ? "teamB"
            : "teamA"
          : Math.random() < 0.5
          ? "teamA"
          : "teamB";

      dispatch({
        type: "AWARD_POINT",
        matchId: targetMatch.matchId,
        team,
      });
    }, simSpeed);

    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, [isSimulating, state, dispatch, simSpeed]);

  const handleOpenUmpire = (courtNumber: number) => {
    setSelectedCourt(courtNumber);
    setActiveTab("umpire");
  };

  const handleReassign = (_matchId: string) => {
    setActiveTab("organizer");
  };

  const handleFastFinishAll = () => {
    if (!state) return;
    const ongoing = state.matches.filter((m) => m.status === "ongoing");
    for (const m of ongoing) {
      dispatch({ type: "FAST_FINISH_MATCH", matchId: m.matchId });
    }
  };

  const handleStartConfiguredTournament = (
    categoryTeams: Record<TournamentCategory, string[]>
  ) => {
    dispatch({
      type: "CONFIGURE_AND_START_TOURNAMENT",
      categoryTeams,
    });
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
      colors: ["#10b981", "#f59e0b", "#00e5ff", "#e2e8f0"],
    });
    setActiveTab("arena");
  };

  if (!state) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-slate-100">
        <div className="relative w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shadow-md animate-pulse mb-4">
          <svg className="w-7 h-7 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15 8H9L12 2Z" />
            <path d="M8 9H16L18 16H6L8 9Z" opacity="0.8" />
            <circle cx="12" cy="19" r="3" />
          </svg>
        </div>
        <div className="text-base font-bold font-mono tracking-widest text-emerald-400">
          INITIALIZING CARBON SHUTTLES
        </div>
        <div className="text-xs text-slate-400 font-mono mt-1">
          Synchronizing 6-Court Realtime Engine...
        </div>
      </div>
    );
  }

  // Pre-Tournament Setup Wizard screen (shown if tournament is not yet configured or if organizer is on Setup tab)
  const isSetupMode = (!state.isConfigured || activeTab === "setup") && isAdmin;

  return (
    <div className="min-h-screen flex flex-col pb-16 sm:pb-0">
      {/* Global Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        connectionStatus={connectionStatus}
        pendingSyncCount={syncStatus.pendingCount}
        isAdmin={isAdmin}
        onLogin={handleAdminLogin}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-6">
        {isSetupMode ? (
          <TournamentSetupWizard
            onStartTournament={handleStartConfiguredTournament}
            initialTeams={state.categoryTeams}
          />
        ) : (
          <>
            {activeTab === "arena" && (
              <ArenaView
                matches={state.matches}
                onOpenUmpire={handleOpenUmpire}
                onReassign={handleReassign}
                isAdmin={isAdmin}
              />
            )}

            {activeTab === "umpire" && isAdmin && (
              <UmpireConsole
                currentCourt={selectedCourt}
                onCourtChange={setSelectedCourt}
                matches={state.matches}
                onDispatch={dispatch}
                syncStatus={syncStatus}
              />
            )}

            {activeTab === "standings" && (
              <StandingsTable matches={state.matches} />
            )}

            {activeTab === "brackets" && (
              <BracketsViewer matches={state.matches} />
            )}

            {activeTab === "hall_of_fame" && <HallOfFame />}

            {activeTab === "organizer" && isAdmin && (
              <OrganizerConsole
                state={state}
                onDispatch={dispatch}
                isSimulating={isSimulating}
                onToggleSimulation={() => setIsSimulating((prev) => !prev)}
                simSpeed={simSpeed}
                onSpeedChange={handleSpeedChange}
                onFastFinishAll={handleFastFinishAll}
              />
            )}
          </>
        )}
      </main>

      {/* Global Broadcast Footer */}
      <footer className="border-t border-black/5 dark:border-white/5 py-4 px-4 sm:px-6 lg:px-8 text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto w-full">
        <div>
          <span className="font-bold text-slate-700 dark:text-slate-400">Carbon Shuttles Championship</span>
          <span className="mx-2">•</span>
          <span>BWF Statutory Rules</span>
          <span className="mx-2">•</span>
          <span>Courts 1–6 Live</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500">
            {syncStatus.isOnline ? "Network: Online" : "Network: Offline (Queued)"}
          </span>
          {isAdmin && (
            <>
              <span className="text-slate-400">|</span>
              <button
                onClick={() => {
                  setIsSimulating((prev) => !prev);
                }}
                className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer font-bold"
              >
                {isSimulating ? "Pause Simulation" : "Simulate Demo Rallies"}
              </button>
            </>
          )}
        </div>
      </footer>

      {/* Mobile Sticky Bottom Navigation Bar (Optimized for Spectators on Smartphones) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-white/10 backdrop-blur-md px-2 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab("arena")}
          className={`flex flex-col items-center gap-1 text-[10px] font-mono font-bold ${
            activeTab === "arena" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500"
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Arena</span>
        </button>

        <button
          onClick={() => setActiveTab("standings")}
          className={`flex flex-col items-center gap-1 text-[10px] font-mono font-bold ${
            activeTab === "standings" ? "text-amber-500" : "text-slate-500"
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Standings</span>
        </button>

        <button
          onClick={() => setActiveTab("brackets")}
          className={`flex flex-col items-center gap-1 text-[10px] font-mono font-bold ${
            activeTab === "brackets" ? "text-indigo-500" : "text-slate-500"
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Brackets</span>
        </button>

        <button
          onClick={() => setActiveTab("hall_of_fame")}
          className={`flex flex-col items-center gap-1 text-[10px] font-mono font-bold ${
            activeTab === "hall_of_fame" ? "text-amber-500" : "text-slate-500"
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>Honours</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveTab("umpire")}
            className={`flex flex-col items-center gap-1 text-[10px] font-mono font-bold ${
              activeTab === "umpire" ? "text-red-500" : "text-slate-500"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Umpire</span>
          </button>
        )}
      </div>
    </div>
  );
}
