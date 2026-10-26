"use client";

import React, { useState } from "react";
import { Match, TournamentCategory, CATEGORY_LABELS } from "@/types/tournament";
import { computeStandings } from "@/lib/engine/tiebreaker";
import { Trophy, HelpCircle, ShieldAlert, Award } from "lucide-react";

interface StandingsTableProps {
  matches: Match[];
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ matches }) => {
  const [selectedCategory, setSelectedCategory] =
    useState<TournamentCategory>("MD_B");
  const [selectedGroup, setSelectedGroup] = useState<string>("Group A");

  // Filter round-robin groups available in this category
  const categoryMatches = matches.filter((m) => m.category === selectedCategory);
  const groups = Array.from(
    new Set(
      categoryMatches
        .filter((m) => m.stage === "round_robin" && m.groupName)
        .map((m) => m.groupName as string)
    )
  );

  const activeGroup = groups.includes(selectedGroup)
    ? selectedGroup
    : groups[0] || undefined;

  const standings = computeStandings(matches, selectedCategory, activeGroup);

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-6">
      {/* Table Header & Category Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">
              Official Standings & Tiebreakers
            </h2>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Ranked by Match Wins & Total Points Scored with BWF standard differentials
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 bg-slate-200/80 dark:bg-[#1a1a1a] p-1.5 rounded-xl border border-slate-300 dark:border-white/10">
          {(["MD_A", "MD_B", "XD_A", "XD_B", "WD_OPEN"] as TournamentCategory[]).map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#3574F0] text-white dark:bg-[#E50914] dark:text-white font-bold shadow-sm"
                    : "text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {cat.replace("_", " ")}
              </button>
            )
          )}
        </div>
      </div>

      {/* Group selector if multiple groups exist */}
      {groups.length > 0 && (
        <div className="flex items-center gap-2 border-b border-[#D5D7DA] dark:border-white/10 pb-3">
          <span className="text-xs font-mono text-slate-700 dark:text-slate-400 font-bold">Pool:</span>
          {groups.map((grp) => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`px-3 py-1 rounded-md text-xs font-mono transition cursor-pointer ${
                activeGroup === grp
                  ? "bg-[#3574F0] text-white dark:bg-[#E50914] dark:text-white font-bold"
                  : "text-slate-700 hover:text-black dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {grp}
            </button>
          ))}
        </div>
      )}

      {/* Standings Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm font-mono">
          <thead>
            <tr className="border-b border-[#D5D7DA] dark:border-white/10 text-xs text-[#494E5B] dark:text-slate-400 uppercase tracking-wider font-bold">
              <th className="py-3 px-3 text-center w-12">Rank</th>
              <th className="py-3 px-3 font-sans">Team Name</th>
              <th className="py-3 px-3 text-center">P</th>
              <th className="py-3 px-3 text-center text-emerald-700 dark:text-[#46d369] font-bold">W</th>
              <th className="py-3 px-3 text-center text-rose-700 dark:text-rose-400 font-bold">L</th>
              <th className="py-3 px-3 text-center text-amber-700 dark:text-amber-400 font-bold" title="Total Points Scored (Primary Tiebreaker)">
                PTS Scored
              </th>
              <th className="py-3 px-3 text-center hidden sm:table-cell">Sets</th>
              <th className="py-3 px-3 text-center">SD</th>
              <th className="py-3 px-3 text-center hidden md:table-cell">Points Ratio</th>
              <th className="py-3 px-3 text-center">PD</th>
              <th className="py-3 px-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB] dark:divide-white/5 text-[#1E1F22] dark:text-slate-200">
            {standings.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-500 text-xs">
                  No round-robin matches recorded for this division yet.
                </td>
              </tr>
            ) : (
              standings.map((team, idx) => {
                const isAdvancing = idx < 2; // Top 2 advance to knockouts
                return (
                  <tr
                    key={team.team}
                    className={`transition hover:bg-black/[0.02] dark:hover:bg-white/5 ${
                      isAdvancing ? "bg-emerald-500/[0.04]" : ""
                    }`}
                  >
                    <td className="py-3 px-3 text-center font-bold">
                      {idx === 0 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 text-xs font-bold">
                          1
                        </span>
                      ) : idx === 1 ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-300/30 text-slate-800 dark:text-slate-200 border border-slate-400/40 text-xs font-bold">
                          2
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">{idx + 1}</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-sans font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{team.team}</span>
                        {isAdvancing && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                            Q
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center text-slate-500 dark:text-slate-400">{team.played}</td>
                    <td className="py-3 px-3 text-center font-bold text-emerald-600 dark:text-emerald-400">
                      {team.won}
                    </td>
                    <td className="py-3 px-3 text-center text-rose-600 dark:text-rose-400 font-bold">{team.lost}</td>
                    <td className="py-3 px-3 text-center font-bold text-amber-600 dark:text-amber-400">
                      {team.pointsWon}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                      {team.setsWon}-{team.setsLost}
                    </td>
                    <td
                      className={`py-3 px-3 text-center font-bold ${
                        team.setDifferential > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : team.setDifferential < 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {team.setDifferential > 0 ? `+${team.setDifferential}` : team.setDifferential}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-500 dark:text-slate-400 hidden md:table-cell">
                      {team.pointsWon}:{team.pointsLost}
                    </td>
                    <td
                      className={`py-3 px-3 text-center font-bold ${
                        team.pointDifferential > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : team.pointDifferential < 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      {team.pointDifferential > 0 ? `+${team.pointDifferential}` : team.pointDifferential}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isAdvancing ? (
                        <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                          Advancing
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">In Pool</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Statutory Rules Reference Card */}
      <div className="bg-slate-100 dark:bg-black/30 rounded-xl p-3 border border-black/5 dark:border-white/5 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-400">
        <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800 dark:text-slate-300">Tournament Tie-Breaker Resolution Sequence:</span>
          <span className="ml-1 text-slate-600 dark:text-slate-400">
            1. Total Match Wins → 2. Total Points Scored (PTS) → 3. Point Differential (PD) → 4. Set Differential (SD) → 5. Head-to-Head.
          </span>
        </div>
      </div>
    </div>
  );
};
