"use client";

import React, { useState, useRef } from "react";
import {
  Match,
  MatchAction,
  OngoingMatch,
  ScheduledMatch,
  TournamentState,
  CATEGORY_SHORT,
} from "@/types/tournament";
import {
  ShieldAlert,
  Flame,
  ArrowRightLeft,
  RotateCcw,
  Play,
  Pause,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle,
  Clock,
  Layers,
  Download,
  Upload,
  Zap,
  Gauge,
} from "lucide-react";

interface OrganizerConsoleProps {
  state: TournamentState;
  onDispatch: (action: MatchAction) => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  simSpeed: number;
  onSpeedChange: (speed: number) => void;
  onFastFinishAll?: () => void;
}

export const OrganizerConsole: React.FC<OrganizerConsoleProps> = ({
  state,
  onDispatch,
  isSimulating,
  onToggleSimulation,
  simSpeed,
  onSpeedChange,
  onFastFinishAll,
}) => {
  const [selectedMatchToReassign, setSelectedMatchToReassign] =
    useState<string | null>(null);
  const [targetCourt, setTargetCourt] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const ongoingMatches = state.matches.filter(
    (m): m is OngoingMatch => m.status === "ongoing"
  );
  const scheduledMatches = state.matches.filter(
    (m): m is ScheduledMatch => m.status === "scheduled"
  );

  const heldClimaxMatches = scheduledMatches.filter((m) => m.isSemiOrFinal);
  const regularQueuedMatches = scheduledMatches.filter((m) => !m.isSemiOrFinal);

  const handleReassignSubmit = () => {
    if (!selectedMatchToReassign) return;
    onDispatch({
      type: "REASSIGN_COURT",
      matchId: selectedMatchToReassign,
      newCourtNumber: targetCourt,
    });
    setSelectedMatchToReassign(null);
  };

  const handleToggleRetention = () => {
    onDispatch({
      type: "TOGGLE_RETENTION_QUEUE",
      held: !state.retentionQueueHeld,
    });
  };

  const handleResetTournament = () => {
    if (confirm("Reset tournament state to clean seeded tournament data?")) {
      onDispatch({ type: "RESET_TOURNAMENT" });
    }
  };

  // Disaster Recovery: Export JSON Backup
  const handleExportBackup = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    a.href = url;
    a.download = `carbonshuttles-tournament-backup-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Disaster Recovery: Import JSON Backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.matches) && Array.isArray(parsed.courts)) {
          if (
            confirm(
              `Restore tournament backup from "${file.name}"?\nTotal Matches: ${parsed.matches.length}\nThis will replace the current state.`
            )
          ) {
            onDispatch({
              type: "RESTORE_STATE",
              state: parsed,
            });
            alert("Tournament backup restored successfully!");
          }
        } else {
          alert("Invalid backup file format. Expected matches and courts arrays.");
        }
      } catch (err) {
        alert("Failed to parse backup JSON file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Master Controls & Simulation Bar */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">
              Organizer Master Flight Deck
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time court routing, crowd-retention climax gates, and disaster recovery backup
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Reconfigure Teams & Fixtures */}
          <button
            onClick={() => {
              if (confirm("Open Setup Wizard to reconfigure teams and regenerate fixtures?")) {
                onDispatch({ type: "RESET_TO_SETUP" });
              }
            }}
            className="px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            Reconfigure Teams
          </button>

          {/* Reset Tournament */}
          <button
            onClick={handleResetTournament}
            className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white border border-slate-300 dark:border-slate-700 text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Seed Data
          </button>
        </div>
      </div>

      {/* DISASTER RECOVERY & SIMULATION SUITE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Disaster Recovery Box */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                Disaster Recovery & State Backup
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
              FAILSAFE
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Protect against venue power cuts or accidental browser resets. Download a full JSON snapshot of scores, courts, and matches, or restore from a previous backup in 1 second.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleExportBackup}
              className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              Download Backup (.json)
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white font-bold font-mono text-xs transition flex items-center gap-2 cursor-pointer border border-slate-300 dark:border-white/15"
            >
              <Upload className="w-4 h-4" />
              Upload & Restore (.json)
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportBackup}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* Rapid Simulation Speed Suite */}
        <div className="glass-panel p-6 rounded-2xl space-y-4 border border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white font-mono uppercase tracking-wider">
                Testing Simulation Controls
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30">
              FAST TEST
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Speed up match simulation to test knockouts, tiebreakers, and champion screens in seconds rather than waiting minutes.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {/* Speed Multipliers */}
            <div className="flex items-center gap-1.5 bg-slate-200 dark:bg-black/40 p-1 rounded-xl border border-slate-300 dark:border-white/10">
              {[
                { label: "1x (Normal)", speed: 2500 },
                { label: "5x (Fast)", speed: 500 },
                { label: "20x (Turbo)", speed: 125 },
              ].map((s) => (
                <button
                  key={s.speed}
                  onClick={() => onSpeedChange(s.speed)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                    simSpeed === s.speed
                      ? "bg-amber-400 text-slate-950 shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Toggle Simulate */}
            <button
              onClick={onToggleSimulation}
              className={`py-2 px-4 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer ${
                isSimulating
                  ? "bg-amber-500 text-black shadow-md animate-pulse"
                  : "bg-slate-800 text-white dark:bg-white/10 hover:bg-slate-700 text-slate-200"
              }`}
            >
              {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              {isSimulating ? "Stop Simulation" : "Start Live Simulation"}
            </button>
          </div>

          {onFastFinishAll && ongoingMatches.length > 0 && (
            <div className="pt-2">
              <button
                onClick={onFastFinishAll}
                className="w-full py-2 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-emerald-500" />
                ⚡ Fast-Finish All {ongoingMatches.length} Ongoing Matches (Instant Test)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 6 Physical Courts Master Grid */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-mono uppercase text-slate-500 dark:text-slate-400 tracking-wider font-bold">
          Physical Court Allocation Matrix (6 Courts)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((courtNum) => {
            const match = state.matches.find(
              (m): m is OngoingMatch => m.status === "ongoing" && m.courtNumber === courtNum
            );
            return (
              <div
                key={courtNum}
                className={`p-4 rounded-xl border transition ${
                  match
                    ? "bg-slate-100 dark:bg-black/40 border-emerald-500/40"
                    : "bg-slate-50 dark:bg-white/[0.02] border-slate-300 dark:border-white/5 opacity-80"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                    Court {courtNum}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      match
                        ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                    }`}
                  >
                    {match ? "ACTIVE LIVE" : "IDLE"}
                  </span>
                </div>

                {match ? (
                  <div className="space-y-1 text-xs">
                    <div className="font-semibold text-slate-900 dark:text-white truncate">
                      {match.teamA} vs {match.teamB}
                    </div>
                    <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                      Score: {match.currentScore.teamA} - {match.currentScore.teamB} (Set {match.currentSet})
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {CATEGORY_SHORT[match.category]} • {match.round}
                      </span>
                      <button
                        onClick={() => setSelectedMatchToReassign(match.matchId)}
                        className="py-1 px-2 rounded bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-[10px] font-mono text-slate-700 dark:text-slate-300 transition cursor-pointer"
                      >
                        Reassign
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-3 text-center text-xs text-slate-400 font-mono">
                    Ready for incoming match
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Climax Hold Gatekeeper */}
      <div className="glass-panel p-6 rounded-2xl space-y-4 border border-amber-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Crowd Climax Gate (Semi-Finals & Finals Retention)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Hold high-stakes knockout finals until group stages complete so all spectator focus is on center courts.
            </p>
          </div>

          <button
            onClick={handleToggleRetention}
            className={`py-2.5 px-4 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 cursor-pointer shadow-sm ${
              state.retentionQueueHeld
                ? "bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/20"
                : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20"
            }`}
          >
            {state.retentionQueueHeld ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            {state.retentionQueueHeld ? "Gate Status: HELD (Locked)" : "Gate Status: AUTO-DISPATCH (Open)"}
          </button>
        </div>

        {heldClimaxMatches.length > 0 && (
          <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 space-y-2">
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 block font-bold">
              Held Fixtures Awaiting Release ({heldClimaxMatches.length} Matches):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {heldClimaxMatches.map((m) => (
                <div
                  key={m.matchId}
                  className="p-2.5 rounded-lg bg-slate-100 dark:bg-black/30 border border-black/5 dark:border-white/5 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                      {m.category} • {m.round}
                    </span>
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      {m.teamA} vs {m.teamB}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMatchToReassign(m.matchId)}
                    className="py-1 px-2 rounded bg-amber-500/15 hover:bg-amber-500/25 text-[10px] font-mono text-amber-700 dark:text-amber-300 transition cursor-pointer"
                  >
                    Force Assign
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Manual Court Reassignment Modal */}
      {selectedMatchToReassign && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/40 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Manual Court Reassignment</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Override scheduling logic and immediately relocate match <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{selectedMatchToReassign}</span> to a court:
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((c) => (
                <button
                  key={c}
                  onClick={() => setTargetCourt(c)}
                  className={`p-3 rounded-xl text-center font-mono font-bold text-sm transition cursor-pointer border ${
                    targetCourt === c
                      ? "bg-emerald-500 text-black border-emerald-400 shadow-md"
                      : "bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10"
                  }`}
                >
                  Court {c}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedMatchToReassign(null)}
                className="py-2 px-4 rounded-xl text-xs font-mono text-slate-500 hover:text-black dark:hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReassignSubmit}
                className="py-2 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-xs transition cursor-pointer shadow-sm"
              >
                Confirm Reassignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
