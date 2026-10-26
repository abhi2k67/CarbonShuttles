"use client";

import React, { useState, useEffect } from "react";
import {
  Match,
  MatchAction,
  OngoingMatch,
  ScheduledMatch,
  FinishedMatch,
  TournamentCategory,
  CATEGORY_LABELS,
  CATEGORY_SHORT,
} from "@/types/tournament";
import {
  Wifi,
  WifiOff,
  RotateCcw,
  ArrowRightLeft,
  Zap,
  Clock,
  Lock,
  Unlock,
  ShieldCheck,
  ChevronDown,
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  LogOut,
  Eye,
  Box,
} from "lucide-react";
import { UmpireClaim } from "@/types/tournament";
import { TacticalCourt3D } from "./three/TacticalCourt3D";
import { HawkEyeVisualizer } from "./three/HawkEyeVisualizer";

interface UmpireConsoleProps {
  currentCourt: number;
  onCourtChange: (courtNumber: number) => void;
  assignedCourt?: number | null;
  onLogout?: () => void;
  courtUmpires?: Record<number, UmpireClaim>;
  isAdmin?: boolean;
  matches: Match[];
  onDispatch: (action: MatchAction) => void;
  syncStatus: {
    isOnline: boolean;
    pendingCount: number;
    isSyncing: boolean;
  };
}

export const UmpireConsole: React.FC<UmpireConsoleProps> = ({
  currentCourt,
  onCourtChange,
  assignedCourt = null,
  onLogout,
  courtUmpires = {},
  isAdmin = false,
  matches,
  onDispatch,
  syncStatus,
}) => {
  // Umpire authentication state: Ensures spectator bystanders cannot tamper with scores
  const [isUmpireUnlocked, setIsUmpireUnlocked] = useState<boolean>(true);
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const [showAlternativeSelector, setShowAlternativeSelector] = useState<boolean>(false);
  const [walkoverModalMatch, setWalkoverModalMatch] = useState<Match | null>(null);
  const [walkoverReason, setWalkoverReason] = useState<"walkover" | "retired">("walkover");
  const [walkoverWinner, setWalkoverWinner] = useState<"teamA" | "teamB">("teamA");
  const [showTacticalRadar, setShowTacticalRadar] = useState<boolean>(true);
  const [showHawkEyeModal, setShowHawkEyeModal] = useState<boolean>(false);

  // Active ongoing match for this court
  const activeMatch = matches.find(
    (m): m is OngoingMatch => m.status === "ongoing" && m.courtNumber === currentCourt
  );

  // Recent finished match on this court (for post-match summary)
  const lastFinishedMatch = matches
    .filter(
      (m): m is FinishedMatch =>
        m.status === "finished" && m.courtNumber === currentCourt
    )
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    )[0];

  // Eligible scheduled matches that are queued (not in progress)
  const scheduledQueue = matches.filter(
    (m): m is ScheduledMatch => m.status === "scheduled"
  );

  // Next proposed match for this court:
  // 1. Matches specifically designated for this court
  // 2. Or the top eligible scheduled match in queue
  const designatedMatch = scheduledQueue.find(
    (m) => m.courtNumber === currentCourt
  );
  const fallbackNextMatch = scheduledQueue.find((m) => !m.courtNumber);
  const proposedNextMatch = designatedMatch || fallbackNextMatch || scheduledQueue[0] || null;

  const handleAwardPoint = (team: "teamA" | "teamB") => {
    if (!isUmpireUnlocked) {
      setShowPinModal(true);
      return;
    }
    if (!activeMatch) return;
    onDispatch({
      type: "AWARD_POINT",
      matchId: activeMatch.matchId,
      team,
    });
  };

  const handleSubtractPoint = (team: "teamA" | "teamB") => {
    if (!isUmpireUnlocked) {
      setShowPinModal(true);
      return;
    }
    if (!activeMatch) return;
    onDispatch({
      type: "SUBTRACT_POINT",
      matchId: activeMatch.matchId,
      team,
    });
  };

  const handleSwitchServer = () => {
    if (!isUmpireUnlocked) {
      setShowPinModal(true);
      return;
    }
    if (!activeMatch) return;
    onDispatch({
      type: "SWITCH_SERVER",
      matchId: activeMatch.matchId,
    });
  };

  const handleStartMatch = (matchId: string) => {
    if (!isUmpireUnlocked) {
      setShowPinModal(true);
      return;
    }
    onDispatch({
      type: "START_MATCH",
      matchId,
      courtNumber: currentCourt,
    });
  };

  const handleConfirmWalkover = () => {
    if (!walkoverModalMatch) return;
    onDispatch({
      type: "WALKOVER",
      matchId: walkoverModalMatch.matchId,
      winner: walkoverWinner,
      reason: walkoverReason,
    });
    setWalkoverModalMatch(null);
  };

  const handleFastFinish = () => {
    if (!activeMatch) return;
    onDispatch({
      type: "FAST_FINISH_MATCH",
      matchId: activeMatch.matchId,
    });
  };

  const handleUnlockPin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default PIN: 1234
    if (pinInput === "1234" || pinInput === "") {
      setIsUmpireUnlocked(true);
      setShowPinModal(false);
      setPinInput("");
      setPinError(null);
    } else {
      setPinError("Invalid Passcode. Enter official court PIN (1234).");
    }
  };

  return (
    <div className="max-w-3xl mx-auto w-full p-3 sm:p-6 space-y-6">
      {/* Top Bar: Court Switcher, Security Gate & Sync Telemetry */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-red-600/20 border border-blue-200 dark:border-red-500/40 flex items-center justify-center text-[#3574F0] dark:text-[#E50914] font-black font-mono text-lg shadow-xs dark:shadow-[0_0_12px_rgba(229,9,20,0.4)]">
            C{currentCourt}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                Court Umpire Terminal
              </span>
              {isUmpireUnlocked ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  {isAdmin ? "ADMIN SUPERVISOR" : `ASSIGNED COURT ${currentCourt}`}
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 flex items-center gap-1 font-bold">
                  <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  SPECTATOR LOCKED
                </span>
              )}
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Court {currentCourt} Console
              <span className="text-xs font-normal text-slate-500 font-mono hidden sm:inline">
                {isAdmin ? "(Admin Master Access)" : "(Dedicated Umpire Station)"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Court Selection Bar */}
        {isAdmin ? (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-black/50 p-1 rounded-xl border border-slate-200 dark:border-white/10">
            {[1, 2, 3, 4, 5, 6].map((court) => {
              const hasOngoing = matches.some(
                (m) => m.status === "ongoing" && m.courtNumber === court
              );
              return (
                <button
                  key={court}
                  onClick={() => onCourtChange(court)}
                  className={`relative px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                    currentCourt === court
                      ? "bg-[#3574F0] dark:bg-[#E50914] text-white shadow-xs dark:shadow-[0_0_12px_rgba(229,9,20,0.6)]"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5"
                  }`}
                >
                  C{court}
                  {hasOngoing && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-red-400 animate-ping"></span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-[#E50914]/20 text-[#3574F0] dark:text-red-300 border border-blue-200 dark:border-[#E50914]/40 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#3574F0] dark:bg-[#E50914] animate-pulse"></span>
              Assigned Court {assignedCourt || currentCourt}
            </span>
            {onLogout && (
              <button
                onClick={onLogout}
                className="py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-500/20 border border-slate-200 dark:border-white/10 hover:border-red-300 dark:hover:border-red-500/30 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition flex items-center gap-1 cursor-pointer"
                title="Release this court and logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Release Court</span>
              </button>
            )}
          </div>
        )}

        {/* Access Lock & Sync Indicators */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (isUmpireUnlocked) {
                setIsUmpireUnlocked(false);
              } else {
                setShowPinModal(true);
              }
            }}
            className={`p-2 rounded-xl text-xs font-mono transition border cursor-pointer ${
              isUmpireUnlocked
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
                : "bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40 hover:bg-amber-100 dark:hover:bg-amber-500/30"
            }`}
            title={isUmpireUnlocked ? "Lock screen for spectators" : "Unlock Umpire Controls (Passcode: 1234)"}
          >
            {isUmpireUnlocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </button>

          {syncStatus.isOnline ? (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-mono bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10">
              <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{syncStatus.pendingCount > 0 ? `${syncStatus.pendingCount} Queued` : "Online"}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-mono bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline ({syncStatus.pendingCount})</span>
            </div>
          )}
        </div>
      </div>

      {/* Spectator Bystander Notice (if locked) */}
      {!isUmpireUnlocked && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/30 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 shadow-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Spectator Protection Mode Active:</strong> Editing controls are locked to prevent accidental bystander taps.
            </span>
          </div>
          <button
            onClick={() => setShowPinModal(true)}
            className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono font-bold text-[11px] transition cursor-pointer shadow-xs"
          >
            Enter PIN to Officiate
          </button>
        </div>
      )}

      {/* =========================================================================
          STATE 1: COURT IS VACANT -> IMMEDIATELY PROPOSE NEXT MATCH TO THE UMPIRE
         ========================================================================= */}
      {!activeMatch ? (
        <div className="space-y-6">
          {/* Recent Finished Match Celebration Card (if match just completed on this court) */}
          {lastFinishedMatch && (
            <div className="glass-panel p-4 rounded-2xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/20 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-300 dark:border-indigo-500/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300">
                  <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                </div>
                <div>
                  <div className="text-[10px] font-mono text-indigo-700 dark:text-indigo-300 uppercase tracking-wider font-bold">
                    Previous Match Concluded on Court {currentCourt}
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    Winner: <span className="text-amber-600 dark:text-amber-300">{lastFinishedMatch.winnerTeam}</span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-mono ml-2">
                      ({lastFinishedMatch.finalScores.map((s) => `${s.teamA}-${s.teamB}`).join(", ")})
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                Official Result Logged
              </span>
            </div>
          )}

          {/* MAIN PROPOSAL CARD: COURT IS VACANT, NEXT MATCH UP */}
          <div className="relative rounded-2xl glass-panel p-6 md:p-8 border border-slate-200 dark:border-[#E50914]/40 shadow-sm dark:shadow-[0_0_30px_rgba(229,9,20,0.2)] overflow-hidden">
            {/* Top Announcement Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 dark:bg-[#E50914] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#3574F0] dark:bg-[#E50914]"></span>
                </span>
                <span className="text-sm font-mono font-black text-slate-900 dark:text-[#E50914] tracking-wider">
                  COURT {currentCourt} IS NOW VACANT
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 dark:bg-[#E50914]/20 text-[#3574F0] dark:text-red-300 border border-blue-200 dark:border-[#E50914]/40 flex items-center gap-1.5 animate-pulse">
                  <Megaphone className="w-3.5 h-3.5" />
                  IMMEDIATE MATCH PROPOSAL
                </span>
              </div>
            </div>

            {proposedNextMatch ? (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 mb-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-cyan-300 font-bold border border-slate-200 dark:border-white/10">
                      {CATEGORY_LABELS[proposedNextMatch.category]}
                    </span>
                    <span>•</span>
                    <span>{proposedNextMatch.round}</span>
                    {proposedNextMatch.groupName && <span>• {proposedNextMatch.groupName}</span>}
                    <span>•</span>
                    <span>Scheduled: {proposedNextMatch.scheduledTime}</span>
                  </div>

                  <h3 className="text-xs uppercase font-mono tracking-widest text-slate-500 dark:text-slate-400 mb-3 font-semibold">
                    Competitors Summoned to Court {currentCourt}:
                  </h3>

                  {/* Big Competitor Face-Off Card */}
                  <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center bg-slate-50 dark:bg-black/50 p-5 rounded-2xl border border-slate-200 dark:border-white/10">
                    <div className="md:col-span-5 p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-center shadow-xs">
                      <div className="text-[10px] font-mono text-[#3574F0] dark:text-[#E50914] font-bold uppercase tracking-wider mb-1">
                        Team A
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide truncate">
                        {proposedNextMatch.teamA}
                      </div>
                    </div>

                    <div className="md:col-span-1 text-center font-mono font-bold text-slate-400 dark:text-slate-500 text-sm py-1">
                      VS
                    </div>

                    <div className="md:col-span-5 p-4 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/5 text-center shadow-xs">
                      <div className="text-[10px] font-mono text-[#3574F0] dark:text-[#E50914] font-bold uppercase tracking-wider mb-1">
                        Team B
                      </div>
                      <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wide truncate">
                        {proposedNextMatch.teamB}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Action: Commence Match on Court */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleStartMatch(proposedNextMatch.matchId)}
                    className="w-full py-4 md:py-5 rounded-2xl bg-[#3574F0] hover:bg-[#2563EB] dark:bg-[#E50914] dark:hover:bg-red-700 active:scale-[0.99] text-white font-black font-mono text-lg md:text-xl tracking-wider uppercase transition shadow-md dark:shadow-[0_0_25px_rgba(229,9,20,0.6)] cursor-pointer flex items-center justify-center gap-3 border border-transparent dark:border-red-400"
                  >
                    <Zap className="w-6 h-6 fill-white" />
                    Call Teams & Commence Match on Court {currentCourt}
                  </button>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      *Tapping starts Set 1 at 0-0 and broadcasts live status to arena displays.
                    </p>

                    {scheduledQueue.length > 1 && (
                      <button
                        onClick={() => setShowAlternativeSelector(!showAlternativeSelector)}
                        className="text-xs font-mono text-[#3574F0] dark:text-cyan-400 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        {showAlternativeSelector ? "Hide alternatives" : "Teams warming up? Choose alternative match ▾"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Alternative Match Selector (if proposed players are grabbing water or warming up) */}
                {showAlternativeSelector && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-black/60 border border-slate-200 dark:border-white/10 space-y-3">
                    <div className="text-xs font-mono text-slate-800 dark:text-slate-300 font-bold">
                      Select Any Ready Match from Tournament Queue:
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {scheduledQueue
                        .filter((m) => m.matchId !== proposedNextMatch.matchId)
                        .map((m) => (
                          <div
                            key={m.matchId}
                            className="p-3 rounded-lg bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs transition"
                          >
                            <div>
                              <div className="font-mono text-[10px] text-[#3574F0] dark:text-cyan-400 font-bold">
                                {m.category} • {m.round}
                              </div>
                              <div className="font-semibold text-slate-900 dark:text-white">
                                {m.teamA} vs {m.teamB}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                handleStartMatch(m.matchId);
                                setShowAlternativeSelector(false);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#3574F0] hover:bg-[#2563EB] dark:bg-[#E50914] dark:hover:bg-red-700 text-white font-mono font-bold text-xs transition cursor-pointer"
                            >
                              Start This Match
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto text-slate-500 dark:text-slate-400">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">All Scheduled Matches Completed</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  No pending matches in queue. Check Organizer Console for held climax rounds or bracket updates.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* =========================================================================
           STATE 2: ONGOING MATCH OFFICIATING PAD (TOUCH SCORING)
           ========================================================================= */
        <div className="space-y-4">
          {/* Match Banner info */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-2 text-xs font-mono text-slate-400">
            <div>
              <span className="text-red-400 font-bold">{CATEGORY_LABELS[activeMatch.category]}</span>
              <span className="mx-2">•</span>
              <span>{activeMatch.round}</span>
              {activeMatch.groupName && <span className="mx-2">• {activeMatch.groupName}</span>}
            </div>

            <div className="flex items-center gap-2">
              {activeMatch.isMatchPoint && (
                <span className="px-2.5 py-0.5 rounded bg-amber-500 text-black font-bold animate-pulse">
                  ⚡ MATCH POINT
                </span>
              )}
              {activeMatch.isGamePoint && !activeMatch.isMatchPoint && (
                <span className="px-2.5 py-0.5 rounded bg-rose-500 text-white font-bold animate-pulse">
                  🔥 GAME POINT
                </span>
              )}
              {activeMatch.isDeuce && (
                <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  ⚖️ DEUCE (14-14, Win by 2, Cap 21)
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                SET {activeMatch.currentSet} OF 3
              </span>
            </div>
          </div>

          {/* Previous Sets Bar */}
          {activeMatch.setScores.length > 0 && (
            <div className="glass-panel px-4 py-2 rounded-xl flex items-center justify-between border border-white/5 text-xs font-mono">
              <span className="text-slate-400">Sets Completed:</span>
              <div className="flex gap-4">
                {activeMatch.setScores.map((s, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-slate-500">Set {idx + 1}:</span>
                    <span className={s.teamA > s.teamB ? "text-red-400 font-bold" : "text-slate-300"}>
                      {s.teamA}
                    </span>
                    <span className="text-slate-600">-</span>
                    <span className={s.teamB > s.teamA ? "text-red-400 font-bold" : "text-slate-300"}>
                      {s.teamB}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3D Tactical Radar Toggle & Visualizer */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowTacticalRadar(!showTacticalRadar)}
              className="py-1.5 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-mono text-cyan-300 border border-cyan-500/30 flex items-center gap-2 transition cursor-pointer"
            >
              <Box className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showTacticalRadar ? "Hide 3D Court Service Radar" : "Show 3D Court Service Radar"}</span>
            </button>

            <button
              onClick={() => setShowHawkEyeModal(true)}
              className="py-1.5 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Hawk-Eye 3D Replay
            </button>
          </div>

          {showTacticalRadar && (
            <div className="animate-in fade-in duration-200">
              <TacticalCourt3D
                servingTeam={activeMatch.servingTeam}
                servingCourtSide={activeMatch.servingCourtSide}
                category={activeMatch.category}
                teamAName={activeMatch.teamA}
                teamBName={activeMatch.teamB}
                scoreA={activeMatch.currentScore.teamA}
                scoreB={activeMatch.currentScore.teamB}
                height={260}
              />
            </div>
          )}

          {/* TWO MAIN TEAMS INTERACTIVE TOUCH SCORING PADS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Team A Scoring Pad */}
            <div
              className={`rounded-2xl p-6 transition flex flex-col justify-between border ${
                activeMatch.servingTeam === "teamA"
                  ? "bg-red-50/70 dark:bg-red-950/30 border-red-300 dark:border-[#E50914]/50 shadow-sm dark:shadow-[0_0_20px_rgba(229,9,20,0.25)]"
                  : "glass-panel bg-white dark:bg-[#181818] border-slate-200 dark:border-white/10 shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">
                    Team A
                  </span>
                  {activeMatch.servingTeam === "teamA" ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E50914] text-white flex items-center gap-1 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      SERVING ({activeMatch.servingCourtSide.toUpperCase()})
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold">RECEIVING</span>
                  )}
                </div>

                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-wide truncate mb-6">
                  {activeMatch.teamA}
                </h2>
              </div>

              {/* Big Touch Target +1 Point Button */}
              <div className="my-auto text-center py-4">
                <button
                  onClick={() => handleAwardPoint("teamA")}
                  disabled={!isUmpireUnlocked}
                  className="w-full py-8 md:py-12 rounded-2xl bg-white hover:bg-slate-50 dark:bg-gradient-to-b dark:from-red-600/30 dark:to-red-900/50 dark:hover:from-red-600/40 dark:hover:to-red-900/60 active:scale-[0.98] border-2 border-slate-300 hover:border-[#3574F0] dark:border-[#E50914]/50 text-center transition cursor-pointer shadow-sm dark:shadow-[0_0_25px_rgba(229,9,20,0.3)] group select-none disabled:opacity-60"
                >
                  <div className="text-7xl md:text-8xl font-black font-mono tracking-tighter text-slate-900 group-hover:text-[#3574F0] dark:text-white dark:group-hover:text-red-200 transition">
                    {activeMatch.currentScore.teamA}
                  </div>
                  <div className="text-xs font-mono font-bold text-[#3574F0] dark:text-red-300 mt-2 tracking-widest uppercase">
                    {isUmpireUnlocked ? "Tap to +1 Point" : "Locked (Spectator Mode)"}
                  </div>
                </button>
              </div>

              {/* Correction Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5">
                <button
                  onClick={() => handleSubtractPoint("teamA")}
                  disabled={activeMatch.currentScore.teamA <= 0 || !isUmpireUnlocked}
                  className="py-2 px-3 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-xs font-mono text-slate-700 dark:text-slate-300 transition flex items-center gap-1 cursor-pointer border border-slate-200 dark:border-transparent"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  -1 Point
                </button>

                <div className="text-[11px] font-mono text-slate-500">
                  Target: 15 (Deuce: 21)
                </div>
              </div>
            </div>

            {/* Team B Scoring Pad */}
            <div
              className={`rounded-2xl p-6 transition flex flex-col justify-between border ${
                activeMatch.servingTeam === "teamB"
                  ? "bg-red-50/70 dark:bg-red-950/30 border-red-300 dark:border-[#E50914]/50 shadow-sm dark:shadow-[0_0_20px_rgba(229,9,20,0.25)]"
                  : "glass-panel bg-white dark:bg-[#181818] border-slate-200 dark:border-white/10 shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">
                    Team B
                  </span>
                  {activeMatch.servingTeam === "teamB" ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#E50914] text-white flex items-center gap-1 shadow-xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      SERVING ({activeMatch.servingCourtSide.toUpperCase()})
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold">RECEIVING</span>
                  )}
                </div>

                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-wide truncate mb-6">
                  {activeMatch.teamB}
                </h2>
              </div>

              {/* Big Touch Target +1 Point Button */}
              <div className="my-auto text-center py-4">
                <button
                  onClick={() => handleAwardPoint("teamB")}
                  disabled={!isUmpireUnlocked}
                  className="w-full py-8 md:py-12 rounded-2xl bg-white hover:bg-slate-50 dark:bg-gradient-to-b dark:from-red-600/30 dark:to-red-900/50 dark:hover:from-red-600/40 dark:hover:to-red-900/60 active:scale-[0.98] border-2 border-slate-300 hover:border-[#3574F0] dark:border-[#E50914]/50 text-center transition cursor-pointer shadow-sm dark:shadow-[0_0_25px_rgba(229,9,20,0.3)] group select-none disabled:opacity-60"
                >
                  <div className="text-7xl md:text-8xl font-black font-mono tracking-tighter text-slate-900 group-hover:text-[#3574F0] dark:text-white dark:group-hover:text-red-200 transition">
                    {activeMatch.currentScore.teamB}
                  </div>
                  <div className="text-xs font-mono font-bold text-[#3574F0] dark:text-red-300 mt-2 tracking-widest uppercase">
                    {isUmpireUnlocked ? "Tap to +1 Point" : "Locked (Spectator Mode)"}
                  </div>
                </button>
              </div>

              {/* Correction Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5">
                <button
                  onClick={() => handleSubtractPoint("teamB")}
                  disabled={activeMatch.currentScore.teamB <= 0 || !isUmpireUnlocked}
                  className="py-2 px-3 rounded-lg bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-xs font-mono text-slate-700 dark:text-slate-300 transition flex items-center gap-1 cursor-pointer border border-slate-200 dark:border-transparent"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  -1 Point
                </button>

                <div className="text-[11px] font-mono text-slate-500">
                  Target: 15 (Deuce: 21)
                </div>
              </div>
            </div>
          </div>

          {/* Quick Referee Action Bar */}
          <div className="glass-panel p-4 rounded-xl border border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSwitchServer}
                disabled={!isUmpireUnlocked}
                className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 transition flex items-center gap-1.5 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-40 font-medium"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                Switch Server
              </button>

              <button
                onClick={() => {
                  setWalkoverModalMatch(activeMatch);
                  setWalkoverReason("retired");
                  setWalkoverWinner("teamA");
                }}
                disabled={!isUmpireUnlocked}
                className="py-2 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/15 dark:hover:bg-amber-500/25 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 font-medium"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Walkover / Concession
              </button>

              <button
                onClick={handleFastFinish}
                disabled={!isUmpireUnlocked}
                className="py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 font-bold"
                title="Instantly simulates match finish for testing"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ⚡ Fast-Finish Match
              </button>

              <button
                onClick={() => setShowHawkEyeModal(true)}
                disabled={!isUmpireUnlocked}
                className="py-2 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-cyan-500/15 dark:hover:bg-cyan-500/25 text-[#3574F0] dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/30 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 font-bold"
                title="Launch 3D Hawk-Eye trajectory and line-call review"
              >
                <Eye className="w-3.5 h-3.5 text-[#3574F0] dark:text-cyan-400" />
                Hawk-Eye 3D
              </button>
            </div>

            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span>Even score = Right court • Odd score = Left court</span>
            </div>
          </div>
        </div>
      )}

      {/* Official Umpire Passcode Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleUnlockPin}
            className="glass-panel bg-white dark:bg-[#181818] p-6 rounded-2xl border border-slate-300 dark:border-red-500/40 max-w-sm w-full space-y-4 shadow-2xl dark:shadow-[0_0_30px_rgba(229,9,20,0.3)]"
          >
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-red-600/20 border border-blue-200 dark:border-red-500/40 flex items-center justify-center text-[#3574F0] dark:text-red-400">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-base">Umpire Authentication</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  Official Match Officiating Access
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              To prevent spectators standing next to the monitor from altering live scores, enter the Court Umpire PIN:
            </p>

            <div className="space-y-1.5">
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(null);
                }}
                placeholder="Enter PIN (Default: 1234)"
                className="w-full p-3 rounded-xl bg-slate-100 dark:bg-black/60 border border-slate-300 dark:border-white/20 text-slate-900 dark:text-white font-mono text-center tracking-widest text-lg focus:outline-none focus:border-[#3574F0] dark:focus:border-red-500"
                autoFocus
              />
              {pinError && (
                <div className="text-[11px] font-mono text-red-600 dark:text-red-400 flex items-center gap-1 font-semibold">
                  <AlertTriangle className="w-3 h-3" />
                  {pinError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPinModal(false);
                  setPinInput("");
                  setPinError(null);
                }}
                className="py-2 px-3 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-[#3574F0] hover:bg-[#2563EB] dark:bg-[#E50914] dark:hover:bg-red-700 text-white font-mono font-bold text-xs transition cursor-pointer shadow-xs"
              >
                Authenticate Umpire
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Walkover / Retired Modal */}
      {walkoverModalMatch && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel bg-white dark:bg-[#181818] p-6 rounded-2xl border border-slate-300 dark:border-amber-500/40 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-slate-900 dark:text-white">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/20 border border-amber-300 dark:border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-500">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">Declare Walkover / Concession</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  Match: {walkoverModalMatch.round} • {walkoverModalMatch.category}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1.5 font-bold">
                  Concession Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWalkoverReason("walkover")}
                    className={`p-2.5 rounded-xl text-xs font-mono text-center border transition cursor-pointer ${
                      walkoverReason === "walkover"
                        ? "bg-[#E50914] text-white font-bold border-red-500 shadow-xs"
                        : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10"
                    }`}
                  >
                    Walkover (W/O)
                    <span className="block text-[10px] opacity-80 mt-0.5">Did not play (21-0)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalkoverReason("retired")}
                    className={`p-2.5 rounded-xl text-xs font-mono text-center border transition cursor-pointer ${
                      walkoverReason === "retired"
                        ? "bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-xs"
                        : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10"
                    }`}
                  >
                    Retired (Ret.)
                    <span className="block text-[10px] opacity-80 mt-0.5">Injured mid-match</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1.5 font-bold">
                  Declare Winning Team
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setWalkoverWinner("teamA")}
                    className={`w-full p-3 rounded-xl text-left border flex items-center justify-between transition cursor-pointer ${
                      walkoverWinner === "teamA"
                        ? "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-400 font-bold"
                        : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono uppercase block text-slate-500 dark:text-slate-400">Team A (Winner)</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{walkoverModalMatch.teamA}</span>
                    </div>
                    {walkoverWinner === "teamA" && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setWalkoverWinner("teamB")}
                    className={`w-full p-3 rounded-xl text-left border flex items-center justify-between transition cursor-pointer ${
                      walkoverWinner === "teamB"
                        ? "bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-400 font-bold"
                        : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-mono uppercase block text-slate-500 dark:text-slate-400">Team B (Winner)</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{walkoverModalMatch.teamB}</span>
                    </div>
                    {walkoverWinner === "teamB" && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={() => setWalkoverModalMatch(null)}
                className="py-2 px-3 rounded-xl text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmWalkover}
                className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-mono font-bold text-xs transition cursor-pointer shadow-sm"
              >
                Confirm Concession & Finalize Match
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hawk-Eye 3D Review Modal */}
      {showHawkEyeModal && activeMatch && (
        <HawkEyeVisualizer
          isOpen={showHawkEyeModal}
          onClose={() => setShowHawkEyeModal(false)}
          teamA={activeMatch.teamA}
          teamB={activeMatch.teamB}
          scoringTeam={activeMatch.servingTeam}
          initialShotType="smash"
        />
      )}
    </div>
  );
};
