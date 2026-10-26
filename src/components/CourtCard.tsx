"use client";

import React, { useState } from "react";
import { Match, OngoingMatch, FinishedMatch, ScheduledMatch, CATEGORY_SHORT } from "@/types/tournament";
import { Clock, Trophy, ChevronRight, Zap, AlertTriangle, Box } from "lucide-react";
import { TacticalCourt3D } from "./three/TacticalCourt3D";

interface CourtCardProps {
  courtNumber: number;
  match: Match | null;
  onOpenUmpire?: (courtNumber: number) => void;
  onReassign?: (matchId: string) => void;
  isAdmin?: boolean;
  umpireCourt?: number | null;
  isCourtOccupied?: boolean;
}

export const CourtCard: React.FC<CourtCardProps> = ({
  courtNumber,
  match,
  onOpenUmpire,
  onReassign,
  isAdmin = false,
  umpireCourt = null,
  isCourtOccupied = false,
}) => {
  const [show3DCourt, setShow3DCourt] = useState<boolean>(false);

  // VACANT COURT (No match assigned)
  if (!match) {
    return (
      <div className="relative rounded-2xl glass-panel p-5 flex flex-col justify-between min-h-[280px] transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
              Court {courtNumber}
            </span>
          </div>
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700/50">
            VACANT
          </span>
        </div>

        <div className="my-auto text-center py-6">
          <div className="w-10 h-10 rounded-full border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center mx-auto mb-2.5 text-slate-400 dark:text-slate-500">
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-slate-800 dark:text-slate-300 text-xs font-semibold">Awaiting Next Fixture</p>
          <p className="text-slate-500 dark:text-slate-500 text-[11px] mt-0.5">Scheduler standing by</p>
        </div>

        {isAdmin && onOpenUmpire ? (
          <button
            onClick={() => onOpenUmpire(courtNumber)}
            className="w-full py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-300 hover:text-black dark:hover:text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Open Umpire Terminal
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : umpireCourt === courtNumber && onOpenUmpire ? (
          <button
            onClick={() => onOpenUmpire(courtNumber)}
            className="w-full py-2 px-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-xs font-mono text-red-600 dark:text-red-400 font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            My Umpire Terminal
          </button>
        ) : onOpenUmpire ? (
          <button
            disabled={isCourtOccupied}
            onClick={() => onOpenUmpire(courtNumber)}
            className={`w-full py-2 px-3 rounded-xl border text-xs font-mono transition flex items-center justify-center gap-1.5 ${
              isCourtOccupied
                ? "bg-slate-100 dark:bg-black/20 text-slate-400 border-slate-300 dark:border-white/5 cursor-not-allowed"
                : "bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30 cursor-pointer font-bold"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            {isCourtOccupied ? "Umpire Stationed" : `Umpire Login (C${courtNumber})`}
          </button>
        ) : (
          <div className="text-[10px] font-mono text-slate-400 text-center py-1">
            Court Idle
          </div>
        )}
      </div>
    );
  }

  // 1. ONGOING / LIVE MATCH (PROFESSIONAL EMERALD GREEN)
  if (match.status === "ongoing") {
    const ongoing = match as OngoingMatch;
    const isGamePoint = !!ongoing.isGamePoint;
    const isMatchPoint = !!ongoing.isMatchPoint;
    const isDeuce = ongoing.isDeuce;

    return (
      <div className="relative rounded-2xl glass-panel p-5 transition-all duration-200 border-2 border-emerald-600/40 dark:border-[#E50914]/50 shadow-md">
        {/* Top Court Header */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 dark:bg-[#E50914] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600 dark:bg-[#E50914]"></span>
            </span>
            <span className="text-xs font-mono font-bold tracking-wider text-emerald-700 dark:text-[#E50914]">
              COURT {courtNumber}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-300 font-mono font-bold">
              {CATEGORY_SHORT[ongoing.category]}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isMatchPoint && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#E50914] text-white animate-pulse">
                MATCH POINT
              </span>
            )}
            {isGamePoint && !isMatchPoint && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950 animate-pulse">
                GAME POINT
              </span>
            )}
            {isDeuce && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40">
                DEUCE
              </span>
            )}
            {!isMatchPoint && !isGamePoint && !isDeuce && (
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-white/10 text-emerald-800 dark:text-white border border-emerald-300 dark:border-white/15">
                SET {ongoing.currentSet}
              </span>
            )}
            <button
              onClick={() => setShow3DCourt(!show3DCourt)}
              className={`p-1 rounded-md border text-[10px] font-mono transition flex items-center gap-1 cursor-pointer ${
                show3DCourt
                  ? "bg-blue-50 dark:bg-cyan-500/20 text-blue-800 dark:text-cyan-300 border-blue-300 dark:border-cyan-400/50 shadow-sm"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-white/10 hover:text-blue-600 dark:hover:text-cyan-400"
              }`}
              title="Toggle 3D Tactical Court"
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D</span>
            </button>
          </div>
        </div>

        {/* Round metadata */}
        <div className="text-xs text-slate-600 dark:text-slate-400 mb-2 font-medium flex items-center justify-between">
          <span className="font-semibold">{ongoing.round}</span>
          <span className="font-mono text-slate-500 dark:text-slate-500">{ongoing.scheduledTime}</span>
        </div>

        {/* Live Score Board Display */}
        <div className="bg-[#F2F3F5] dark:bg-[#181818] rounded-xl p-3 border border-[#D5D7DA] dark:border-white/10 space-y-2.5 mb-3.5">
          {/* Team A */}
          <div className={`flex items-center justify-between p-2 rounded-lg transition ${
            ongoing.servingTeam === "teamA"
              ? "bg-emerald-500/10 dark:bg-[#E50914]/15 border-l-3 border-emerald-600 dark:border-[#E50914]"
              : ""
          }`}>
            <div className="flex items-center gap-2">
              {ongoing.servingTeam === "teamA" ? (
                <span className="px-1.5 py-0.5 rounded bg-emerald-600 dark:bg-[#E50914] text-white font-mono text-[9px] font-bold tracking-tight">
                  SRV ({ongoing.servingCourtSide.toUpperCase()})
                </span>
              ) : (
                <span className="w-2 h-2"></span>
              )}
              <span className="text-sm font-bold text-[#1E1F22] dark:text-white tracking-wide truncate max-w-[150px] sm:max-w-[180px]">
                {ongoing.teamA}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Previous Sets */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono">
                {ongoing.setScores.map((s, idx) => (
                  <span
                    key={idx}
                    className={`w-5 text-center ${s.teamA > s.teamB ? "text-slate-900 dark:text-white font-bold" : "text-slate-400 dark:text-slate-600"}`}
                  >
                    {s.teamA}
                  </span>
                ))}
              </div>
              {/* Current Live Set Score */}
              <span className="text-2xl font-black font-mono tracking-tight text-emerald-700 dark:text-[#46d369] w-8 text-right">
                {ongoing.currentScore.teamA}
              </span>
            </div>
          </div>

          {/* Team B */}
          <div className={`flex items-center justify-between p-2 rounded-lg transition ${
            ongoing.servingTeam === "teamB"
              ? "bg-emerald-500/10 dark:bg-[#E50914]/15 border-l-3 border-emerald-600 dark:border-[#E50914]"
              : ""
          }`}>
            <div className="flex items-center gap-2">
              {ongoing.servingTeam === "teamB" ? (
                <span className="px-1.5 py-0.5 rounded bg-emerald-600 dark:bg-[#E50914] text-white font-mono text-[9px] font-bold tracking-tight">
                  SRV ({ongoing.servingCourtSide.toUpperCase()})
                </span>
              ) : (
                <span className="w-2 h-2"></span>
              )}
              <span className="text-sm font-bold text-[#1E1F22] dark:text-white tracking-wide truncate max-w-[150px] sm:max-w-[180px]">
                {ongoing.teamB}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Previous Sets */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono">
                {ongoing.setScores.map((s, idx) => (
                  <span
                    key={idx}
                    className={`w-5 text-center ${s.teamB > s.teamA ? "text-slate-900 dark:text-white font-bold" : "text-slate-400 dark:text-slate-600"}`}
                  >
                    {s.teamB}
                  </span>
                ))}
              </div>
              {/* Current Live Set Score */}
              <span className="text-2xl font-black font-mono tracking-tight text-emerald-700 dark:text-[#46d369] w-8 text-right">
                {ongoing.currentScore.teamB}
              </span>
            </div>
          </div>
        </div>

        {/* Expandable 3D Tactical Radar */}
        {show3DCourt && (
          <div className="mb-3.5 animate-in fade-in duration-200">
            <TacticalCourt3D
              servingTeam={ongoing.servingTeam}
              servingCourtSide={ongoing.servingCourtSide}
              category={ongoing.category}
              teamAName={ongoing.teamA}
              teamBName={ongoing.teamB}
              scoreA={ongoing.currentScore.teamA}
              scoreB={ongoing.currentScore.teamB}
              height={190}
            />
          </div>
        )}

        {/* Footer controls */}
        {isAdmin ? (
          <div className="flex items-center gap-2 pt-1">
            {onOpenUmpire && (
              <button
                onClick={() => onOpenUmpire(courtNumber)}
                className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                Umpire Console
              </button>
            )}
            {onReassign && (
              <button
                onClick={() => onReassign(ongoing.matchId)}
                className="py-1.5 px-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-xs font-mono text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition cursor-pointer"
                title="Reassign Court"
              >
                Move
              </button>
            )}
          </div>
        ) : umpireCourt === courtNumber && onOpenUmpire ? (
          <div className="pt-1">
            <button
              onClick={() => onOpenUmpire(courtNumber)}
              className="w-full py-1.5 px-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs font-mono transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              Enter Scoring Terminal (Court {courtNumber})
            </button>
          </div>
        ) : onOpenUmpire ? (
          <div className="pt-1">
            <button
              disabled={isCourtOccupied}
              onClick={() => onOpenUmpire(courtNumber)}
              className={`w-full py-1.5 px-3 rounded-xl border text-xs font-mono transition flex items-center justify-center gap-1.5 ${
                isCourtOccupied
                  ? "bg-slate-100 dark:bg-black/20 text-slate-400 border-slate-300 dark:border-white/5 cursor-not-allowed"
                  : "bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30 cursor-pointer font-bold"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              {isCourtOccupied ? "Umpire Stationed" : `Umpire Login (C${courtNumber})`}
            </button>
          </div>
        ) : (
          <div className="text-[10px] font-mono text-slate-400 text-center py-1">
            Live Court Broadcast • Spectator Mode
          </div>
        )}
      </div>
    );
  }

  // 2. SCHEDULED / PROPOSED MATCH ON VACANT COURT
  if (match.status === "scheduled") {
    const scheduled = match as ScheduledMatch;
    return (
      <div className="relative rounded-2xl glass-panel p-5 transition-all duration-200 border border-[#D5D7DA] dark:border-white/10 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-300">
              COURT {courtNumber}
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-300 font-mono font-bold">
              {CATEGORY_SHORT[scheduled.category]}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-white/10 flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            NEXT UP
          </span>
        </div>

        <div className="text-xs text-slate-600 dark:text-slate-400 mb-2 font-medium flex items-center justify-between">
          <span className="font-semibold">{scheduled.round}</span>
          <span className="font-mono text-slate-500 dark:text-slate-500">{scheduled.scheduledTime}</span>
        </div>

        <div className="bg-[#F2F3F5] dark:bg-[#181818] rounded-xl p-3 border border-[#D5D7DA] dark:border-white/10 space-y-2 mb-4">
          <div className="text-sm font-bold text-[#1E1F22] dark:text-slate-200 truncate">
            {scheduled.teamA}
          </div>
          <div className="text-[10px] font-mono text-slate-500 dark:text-slate-500 text-center tracking-widest font-bold">
            VS
          </div>
          <div className="text-sm font-bold text-[#1E1F22] dark:text-slate-200 truncate">
            {scheduled.teamB}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {isAdmin && onOpenUmpire ? (
            <button
              onClick={() => onOpenUmpire(courtNumber)}
              className="w-full py-2 px-3 rounded-xl bg-[#3574F0] hover:bg-[#2563EB] dark:bg-[#E50914] dark:hover:bg-[#b80710] text-xs font-mono font-semibold text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              Call Teams & Score Match
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : umpireCourt === courtNumber && onOpenUmpire ? (
            <button
              onClick={() => onOpenUmpire(courtNumber)}
              className="w-full py-2 px-3 rounded-xl bg-[#E50914] hover:bg-red-700 text-white font-bold text-xs font-mono transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Zap className="w-3.5 h-3.5" />
              Call Teams & Score Match (Court {courtNumber})
            </button>
          ) : onOpenUmpire ? (
            <button
              disabled={isCourtOccupied}
              onClick={() => onOpenUmpire(courtNumber)}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-mono transition flex items-center justify-center gap-1.5 ${
                isCourtOccupied
                  ? "bg-slate-100 dark:bg-black/20 text-slate-400 border-slate-300 dark:border-white/5 cursor-not-allowed"
                  : "bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30 cursor-pointer font-bold"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              {isCourtOccupied ? "Umpire Stationed" : `Umpire Login (C${courtNumber})`}
            </button>
          ) : (
            <div className="text-[10px] font-mono text-slate-500 text-center py-1 font-medium">
              Teams to be called shortly
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. FINISHED MATCH
  const finished = match as FinishedMatch;
  return (
    <div className="relative rounded-2xl glass-panel p-5 transition-all duration-200 border border-amber-500/40 shadow-sm">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-300">
            COURT {courtNumber}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-400 font-mono font-bold">
            {CATEGORY_SHORT[finished.category]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {finished.finishReason === "walkover" && (
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-600 dark:text-red-300 border border-red-500/30">
              W/O
            </span>
          )}
          {finished.finishReason === "retired" && (
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30">
              RETIRED
            </span>
          )}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30 font-bold">
            FINISHED
          </span>
        </div>
      </div>

      <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">
        {finished.round} • Winner: <span className="text-amber-700 dark:text-amber-400 font-bold">{finished.winnerTeam}</span>
      </div>

      <div className="bg-[#F2F3F5] dark:bg-[#181818] rounded-xl p-3 border border-[#D5D7DA] dark:border-white/10 space-y-2 mb-3 text-xs">
        <div className={`flex justify-between ${finished.winnerTeam === finished.teamA ? "text-amber-800 dark:text-amber-300 font-bold" : "text-slate-700 dark:text-slate-400 font-medium"}`}>
          <span className="truncate max-w-[150px]">{finished.teamA}</span>
          <span className="font-mono">
            {finished.finalScores.map((s) => s.teamA).join(" - ")}
          </span>
        </div>
        <div className={`flex justify-between ${finished.winnerTeam === finished.teamB ? "text-amber-800 dark:text-amber-300 font-bold" : "text-slate-700 dark:text-slate-400 font-medium"}`}>
          <span className="truncate max-w-[150px]">{finished.teamB}</span>
          <span className="font-mono">
            {finished.finalScores.map((s) => s.teamB).join(" - ")}
          </span>
        </div>
      </div>

      {isAdmin && onOpenUmpire ? (
        <button
          onClick={() => onOpenUmpire(courtNumber)}
          className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-mono text-amber-800 dark:text-amber-300 transition flex items-center justify-center gap-1 cursor-pointer font-bold"
        >
          Court Details
          <ChevronRight className="w-3 h-3" />
        </button>
      ) : umpireCourt === courtNumber && onOpenUmpire ? (
        <button
          onClick={() => onOpenUmpire(courtNumber)}
          className="w-full py-2 px-3 rounded-xl bg-[#E50914] hover:bg-red-700 text-white font-bold text-xs font-mono transition flex items-center justify-center gap-1 cursor-pointer shadow-sm"
        >
          <Zap className="w-3.5 h-3.5" />
          My Court Terminal (C{courtNumber})
        </button>
      ) : (
        <div className="text-[10px] font-mono text-slate-500 text-center py-1 font-medium">
          Match Concluded
        </div>
      )}
    </div>
  );
};
