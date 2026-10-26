"use client";

import React, { useState } from "react";
import {
  Match,
  OngoingMatch,
  ScheduledMatch,
  TournamentCategory,
  CATEGORY_LABELS,
  UmpireClaim,
} from "@/types/tournament";
import { CourtCard } from "./CourtCard";
import { VirtualArena3D } from "./three/VirtualArena3D";
import { HawkEyeVisualizer } from "./three/HawkEyeVisualizer";
import { WebXRTabletop } from "./three/WebXRTabletop";
import {
  Radio,
  Zap,
  Clock,
  Trophy,
  Filter,
  Glasses,
  Eye,
  Grid3X3,
  Box,
  Sparkles,
} from "lucide-react";

interface ArenaViewProps {
  matches: Match[];
  onOpenUmpire: (courtNumber: number) => void;
  onReassign: (matchId: string) => void;
  isAdmin?: boolean;
  umpireCourt?: number | null;
  courtUmpires?: Record<number, UmpireClaim>;
}

export const ArenaView: React.FC<ArenaViewProps> = ({
  matches,
  onOpenUmpire,
  onReassign,
  isAdmin = false,
  umpireCourt = null,
  courtUmpires = {},
}) => {
  const [viewMode, setViewMode] = useState<"2d" | "3d">("3d");
  const [categoryFilter, setCategoryFilter] = useState<TournamentCategory | "ALL">("ALL");
  const [hawkEyeMatch, setHawkEyeMatch] = useState<Match | null>(null);
  const [showWebXRModal, setShowWebXRModal] = useState<boolean>(false);

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

  // Active match for default Hawk-Eye demo if none selected
  const activeSampleMatch = matches.find((m) => m.status === "ongoing") || matches[0] || null;

  return (
    <div className="space-y-6">
      {/* Broadcast Hero Bar */}
      <div className="relative rounded-3xl glass-panel p-6 overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-[#E50914]/15 border border-emerald-300 dark:border-[#E50914]/40 text-emerald-800 dark:text-[#E50914] text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-[#E50914] animate-ping"></span>
                6-COURT BROADCAST ARENA
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-white/10 border border-blue-300 dark:border-white/15 text-blue-800 dark:text-white text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-[#E50914]" />
                WEBGL / WEBGPU ACCELERATED
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              LIVE TOURNAMENT DASHBOARD
            </h1>
            <p className="text-slate-600 dark:text-[#b3b3b3] text-sm mt-1 max-w-xl">
              Real-time 3D stadium telemetry, BWF statutory service radar, aerodynamic Hawk-Eye point replays, and synchronized court rotation.
            </p>
          </div>

          {/* Quick Stats telemetry */}
          <div className="flex items-center gap-3 font-mono">
            <div className="bg-slate-100 dark:bg-[#1a1a1a] border border-emerald-500/30 dark:border-white/10 p-3 rounded-xl min-w-[90px] text-center shadow-sm">
              <div className="text-2xl font-black text-emerald-700 dark:text-[#46d369]">{ongoingCount}</div>
              <div className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-0.5 font-bold">
                Live Courts
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-[#1a1a1a] border border-slate-300 dark:border-white/10 p-3 rounded-xl min-w-[90px] text-center shadow-sm">
              <div className="text-2xl font-black text-slate-800 dark:text-white">{scheduledCount}</div>
              <div className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-0.5 font-bold">
                In Queue
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-[#1a1a1a] border border-amber-500/30 dark:border-white/10 p-3 rounded-xl min-w-[90px] text-center shadow-sm">
              <div className="text-2xl font-black text-amber-700 dark:text-[#f5a623]">{finishedCount}</div>
              <div className="text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-widest mt-0.5 font-bold">
                Finished
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Switcher & Category Filter Pills */}
        <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
          {/* 2D / 3D Virtual Stadium Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex p-1 rounded-2xl bg-slate-200/80 dark:bg-[#1a1a1a] border border-slate-300 dark:border-white/10 font-mono text-xs">
              <button
                onClick={() => setViewMode("3d")}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "3d"
                    ? "bg-[#3574F0] text-white dark:bg-[#E50914] dark:text-white shadow-md font-bold"
                    : "text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                3D Virtual Arena
              </button>

              <button
                onClick={() => setViewMode("2d")}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "2d"
                    ? "bg-[#3574F0] text-white dark:bg-[#E50914] dark:text-white shadow-md font-bold"
                    : "text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white"
                }`}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                2D Score Grid
              </button>
            </div>

            {/* Quick Hawk-Eye & WebXR Triggers */}
            <button
              onClick={() => setHawkEyeMatch(activeSampleMatch)}
              className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-[#E50914]/15 hover:bg-blue-100 dark:hover:bg-[#E50914]/25 border border-blue-300 dark:border-[#E50914]/40 text-blue-800 dark:text-[#ff4d5a] font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Launch 3D Hawk-Eye trajectory and line-call review"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hawk-Eye</span> 3D Replay
            </button>

            <button
              onClick={() => setShowWebXRModal(!showWebXRModal)}
              className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-500/15 hover:bg-purple-100 dark:hover:bg-purple-500/25 border border-purple-300 dark:border-purple-400/40 text-purple-800 dark:text-purple-300 font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Launch WebXR AR Tabletop Court"
            >
              <Glasses className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WebXR</span> Tabletop AR
            </button>
          </div>

          {/* Division filters */}
          <div className="flex flex-wrap gap-1.5 bg-slate-200/80 dark:bg-[#1a1a1a] p-1 rounded-xl border border-slate-300 dark:border-white/10">
            <button
              onClick={() => setCategoryFilter("ALL")}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                categoryFilter === "ALL"
                  ? "bg-[#3574F0] text-white dark:bg-[#E50914] dark:text-white font-bold shadow-sm"
                  : "text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white"
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
                      ? "bg-[#3574F0] text-white dark:bg-[#E50914] dark:text-white font-bold shadow-sm"
                      : "text-slate-700 dark:text-slate-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {cat.replace("_", " ")}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* WebXR Tabletop Modal / Drawer */}
      {showWebXRModal && (
        <div className="relative">
          <WebXRTabletop onClose={() => setShowWebXRModal(false)} />
        </div>
      )}

      {/* MAIN VIEW: 3D Virtual Stadium Arena OR 2D Grid Cards */}
      {viewMode === "3d" ? (
        <div className="space-y-4">
          <VirtualArena3D
            matches={filteredMatches}
            onOpenUmpire={onOpenUmpire}
            onOpenHawkEye={(match) => setHawkEyeMatch(match)}
            isAdmin={isAdmin}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courtMatches.map(({ courtNum, match }) => {
            const shouldShowMatch =
              !match || categoryFilter === "ALL" || match.category === categoryFilter;

            const isCourtOccupied = !!courtUmpires[courtNum];

            return (
              <CourtCard
                key={courtNum}
                courtNumber={courtNum}
                match={shouldShowMatch ? match : null}
                onOpenUmpire={onOpenUmpire}
                onReassign={onReassign}
                isAdmin={isAdmin}
                umpireCourt={umpireCourt}
                isCourtOccupied={isCourtOccupied}
              />
            );
          })}
        </div>
      )}

      {/* Hawk-Eye 3D Review Modal */}
      {hawkEyeMatch && (
        <HawkEyeVisualizer
          isOpen={!!hawkEyeMatch}
          onClose={() => setHawkEyeMatch(null)}
          teamA={hawkEyeMatch.teamA}
          teamB={hawkEyeMatch.teamB}
          scoringTeam="teamA"
          initialShotType="smash"
        />
      )}
    </div>
  );
};
