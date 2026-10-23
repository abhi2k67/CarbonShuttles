"use client";

import React, { useState } from "react";
import {
  Match,
  MatchRound,
  TournamentCategory,
  OngoingMatch,
  FinishedMatch,
} from "@/types/tournament";
import { Trophy } from "lucide-react";

interface BracketsViewerProps {
  matches: Match[];
}

export const BracketsViewer: React.FC<BracketsViewerProps> = ({ matches }) => {
  const [selectedCategory, setSelectedCategory] =
    useState<TournamentCategory>("MD_A");

  const categoryMatches = matches.filter(
    (m) => m.category === selectedCategory && m.stage === "knockout"
  );

  const roundsOrder: MatchRound[] = [
    "Round of 16",
    "Quarter-Final",
    "Semi-Final",
    "Final",
  ];

  // Group matches by round
  const byRound: Record<string, Match[]> = {};
  roundsOrder.forEach((r) => {
    byRound[r] = categoryMatches.filter((m) => m.round === r);
  });

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">
              Elimination Bracket Progression
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Championship knockout tree progression through to Gold Medal Finals.
          </p>
        </div>

        {/* Category Selector */}
        <div className="flex flex-wrap gap-1.5 bg-slate-200/70 dark:bg-black/40 p-1.5 rounded-xl border border-slate-300 dark:border-white/5">
          {(["MD_A", "MD_B", "XD_A", "XD_B", "WD_OPEN"] as TournamentCategory[]).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-indigo-600 text-white font-bold shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {cat.replace("_", " ")}
              </button>
            )
          )}
        </div>
      </div>

      {/* Bracket Tree Layout */}
      <div className="overflow-x-auto pb-4">
        <div className="flex items-start gap-8 min-w-[850px]">
          {roundsOrder.map((roundName) => {
            const roundMatches = byRound[roundName] || [];
            if (roundMatches.length === 0) return null;

            return (
              <div key={roundName} className="flex-1 space-y-4">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 pb-2 border-b border-black/10 dark:border-white/10 flex items-center justify-between">
                  <span>{roundName}</span>
                  <span className="text-[10px] text-slate-500">{roundMatches.length} Matches</span>
                </div>

                <div className="space-y-4">
                  {roundMatches.map((m) => {
                    const isLive = m.status === "ongoing";
                    const isFinished = m.status === "finished";

                    return (
                      <div
                        key={m.matchId}
                        className={`rounded-xl p-3 border transition ${
                          isLive
                            ? "bg-red-500/10 border-red-500/50 shadow-sm"
                            : isFinished
                            ? "bg-slate-100 dark:bg-black/40 border-slate-200 dark:border-white/10"
                            : "bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/5"
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-2">
                          <span>{m.matchId}</span>
                          {isLive ? (
                            <span className="text-red-500 font-bold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                              COURT {m.courtNumber}
                            </span>
                          ) : isFinished ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">COMPLETED</span>
                          ) : (
                            <span>{m.scheduledTime}</span>
                          )}
                        </div>

                        <div className="space-y-1.5 text-xs">
                          {/* Team A */}
                          <div
                            className={`flex items-center justify-between p-1.5 rounded ${
                              isFinished && m.winnerTeam === m.teamA
                                ? "bg-amber-500/15 font-bold text-amber-700 dark:text-amber-300 border border-amber-500/30"
                                : "text-slate-800 dark:text-slate-300"
                            }`}
                          >
                            <span className="truncate max-w-[130px]">{m.teamA}</span>
                            <span className="font-mono text-[11px] font-bold">
                              {isLive
                                ? (m as OngoingMatch).currentScore?.teamA ?? "-"
                                : isFinished
                                ? (m as FinishedMatch).finalScores
                                    ?.map((s) => s.teamA)
                                    .join(" ") ?? "-"
                                : "-"}
                            </span>
                          </div>

                          {/* Team B */}
                          <div
                            className={`flex items-center justify-between p-1.5 rounded ${
                              isFinished && m.winnerTeam === m.teamB
                                ? "bg-amber-500/15 font-bold text-amber-700 dark:text-amber-300 border border-amber-500/30"
                                : "text-slate-800 dark:text-slate-300"
                            }`}
                          >
                            <span className="truncate max-w-[130px]">{m.teamB}</span>
                            <span className="font-mono text-[11px] font-bold">
                              {isLive
                                ? (m as OngoingMatch).currentScore?.teamB ?? "-"
                                : isFinished
                                ? (m as FinishedMatch).finalScores
                                    ?.map((s) => s.teamB)
                                    .join(" ") ?? "-"
                                : "-"}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
