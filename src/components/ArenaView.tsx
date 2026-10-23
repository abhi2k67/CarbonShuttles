"use client";

import React, { useState } from "react";
import {
  Match,
  OngoingMatch,
  ScheduledMatch,
  TournamentCategory,
  CATEGORY_LABELS,
} from "@/types/tournament";
import { CourtCard } from "./CourtCard";
import { Radio, Zap, Clock, Trophy, Filter } from "lucide-react";

interface ArenaViewProps {
  matches: Match[];
  onOpenUmpire: (courtNumber: number) => void;
  onReassign: (matchId: string) => void;
  isAdmin?: boolean;
}

export const ArenaView: React.FC<ArenaViewProps> = ({
  matches,
  onOpenUmpire,
  onReassign,
  isAdmin = false,
}) => {
  const [categoryFilter, setCategoryFilter] = useState<
    TournamentCategory | "ALL"
  >("ALL");

  // Filter matches if category selected
  const filteredMatches =
    categoryFilter === "ALL"
      ? matches
      : matches.filter((m) => m.category === categoryFilter);

  // Group courts 1 through 6
  const courtMatches: Array<{ courtNum: number; match: Match | null }> = [
    1, 2, 3, 4, 5, 6,
  ].map((courtNum) => {
    // Priority: Live ongoing match on this court
    const ongoing = matches.find(
      (m): m is OngoingMatch => m.status === "ongoing" && m.courtNumber === courtNum
    );
    if (ongoing) return { courtNum, match: ongoing };

    // Next scheduled match explicitly designated for this court
    const scheduled = matches.find(
      (m): m is ScheduledMatch =>
        m.status === "scheduled" && m.courtNumber === courtNum
    );
    if (scheduled) return { courtNum, match: scheduled };

    return { courtNum, match: null };
  });

  const ongoingCount = matches.filter((m) => m.status === "ongoing").length;
  const finishedCount = matches.filter((m) => m.status === "finished").length;
  const scheduledCount = matches.filter((m) => m.status === "scheduled").length;

  return (
    <div className="space-y-6">
      {/* Broadcast Hero Bar */}
      <div className="relative rounded-2xl glass-panel p-6 overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              6-COURT BROADCAST ARENA
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              LIVE TOURNAMENT DASHBOARD
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 max-w-xl">
              Live court telemetry synchronized with BWF statutory rules, instant score streaming, and smart court rotation.
            </p>
          </div>

          {/* Quick Stats telemetry */}
          <div className="flex items-center gap-3 font-mono">
            <div className="bg-slate-100 dark:bg-black/50 border border-emerald-500/30 p-3 rounded-xl min-w-[90px] text-center shadow-sm">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{ongoingCount}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5 font-bold">
                Live Courts
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-slate-700/60 p-3 rounded-xl min-w-[90px] text-center shadow-sm">
              <div className="text-2xl font-black text-slate-700 dark:text-slate-300">{scheduledCount}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5 font-bold">
                In Queue
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-black/50 border border-amber-500/30 p-3 rounded-xl min-w-[90px] text-center shadow-sm">
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{finishedCount}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5 font-bold">
                Finished
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-400 font-semibold">
            <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Category Division:</span>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-slate-200/60 dark:bg-black/40 p-1 rounded-xl border border-black/5 dark:border-white/5">
            <button
              onClick={() => setCategoryFilter("ALL")}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                categoryFilter === "ALL"
                  ? "bg-slate-900 text-white dark:bg-white/20 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
              }`}
            >
              All Courts
            </button>
            {(["MD_A", "MD_B", "XD_A", "XD_B", "WD_OPEN"] as TournamentCategory[]).map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                    categoryFilter === cat
                      ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {cat.replace("_", " ")}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* 6-Court Multi-Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courtMatches.map(({ courtNum, match }) => {
          const shouldShowMatch =
            !match || categoryFilter === "ALL" || match.category === categoryFilter;

          return (
            <CourtCard
              key={courtNum}
              courtNumber={courtNum}
              match={shouldShowMatch ? match : null}
              onOpenUmpire={onOpenUmpire}
              onReassign={onReassign}
              isAdmin={isAdmin}
            />
          );
        })}
      </div>
    </div>
  );
};
