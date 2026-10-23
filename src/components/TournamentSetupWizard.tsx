"use client";

import React, { useState } from "react";
import {
  TournamentCategory,
  CATEGORY_LABELS,
  MatchAction,
} from "@/types/tournament";
import {
  EVEN_TEAM_OPTIONS,
  generateRandomTeamNames,
} from "@/lib/data/teamPools";
import {
  Shuffle,
  Play,
  Edit3,
  Layers,
  Check,
  ShieldCheck,
  Users,
  Trophy,
  Sparkles,
} from "lucide-react";

interface TournamentSetupWizardProps {
  onStartTournament: (categoryTeams: Record<TournamentCategory, string[]>) => void;
  initialTeams?: Record<TournamentCategory, string[]>;
}

export const TournamentSetupWizard: React.FC<TournamentSetupWizardProps> = ({
  onStartTournament,
  initialTeams,
}) => {
  const categories: TournamentCategory[] = [
    "MD_A",
    "MD_B",
    "XD_A",
    "XD_B",
    "WD_OPEN",
  ];

  // Default team counts
  const [teamCounts, setTeamCounts] = useState<Record<TournamentCategory, number>>({
    MD_A: initialTeams?.MD_A?.length || 16,
    MD_B: initialTeams?.MD_B?.length || 12,
    XD_A: initialTeams?.XD_A?.length || 8,
    XD_B: initialTeams?.XD_B?.length || 8,
    WD_OPEN: initialTeams?.WD_OPEN?.length || 8,
  });

  // Team names mapping per category
  const [teamsMap, setTeamsMap] = useState<Record<TournamentCategory, string[]>>(() => {
    if (initialTeams) return initialTeams;
    return {
      MD_A: generateRandomTeamNames("MD_A", 16),
      MD_B: generateRandomTeamNames("MD_B", 12),
      XD_A: generateRandomTeamNames("XD_A", 8),
      XD_B: generateRandomTeamNames("XD_B", 8),
      WD_OPEN: generateRandomTeamNames("WD_OPEN", 8),
    };
  });

  // Toggle for manual name customization per category
  const [manualModeMap, setManualModeMap] = useState<Record<TournamentCategory, boolean>>({
    MD_A: false,
    MD_B: false,
    XD_A: false,
    XD_B: false,
    WD_OPEN: false,
  });

  const [activeCategory, setActiveCategory] = useState<TournamentCategory>("MD_A");

  // Handler when organizer changes team count for a category
  const handleCountChange = (cat: TournamentCategory, newCount: number) => {
    setTeamCounts((prev) => ({ ...prev, [cat]: newCount }));
    // Automatically regenerate unique names for the new count
    const freshNames = generateRandomTeamNames(cat, newCount);
    setTeamsMap((prev) => ({ ...prev, [cat]: freshNames }));
  };

  // Handler to shuffle/regenerate names for the active category
  const handleRegenerateCategory = (cat: TournamentCategory) => {
    const count = teamCounts[cat];
    const freshNames = generateRandomTeamNames(cat, count);
    setTeamsMap((prev) => ({ ...prev, [cat]: freshNames }));
  };

  // Handler for individual team name edit
  const handleTeamNameEdit = (
    cat: TournamentCategory,
    index: number,
    newName: string
  ) => {
    setTeamsMap((prev) => {
      const updated = [...prev[cat]];
      updated[index] = newName;
      return { ...prev, [cat]: updated };
    });
  };

  // Handler to toggle manual editing for a category
  const handleToggleManual = (cat: TournamentCategory) => {
    setManualModeMap((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Total teams across tournament
  const totalTeams = Object.values(teamCounts).reduce((a, b) => a + b, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartTournament(teamsMap);
  };

  return (
    <div className="max-w-5xl mx-auto w-full p-4 md:p-8 space-y-6">
      {/* Wizard Header Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              PRE-TOURNAMENT SETUP WIZARD
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              TOURNAMENT FIXTURE CONFIGURATION
            </h1>
            <p className="text-slate-400 text-sm mt-1.5 max-w-2xl leading-relaxed">
              Select the number of competitor teams for each category. Team names are auto-populated with unique category-matched identities, or you can toggle manual editing to enter custom team rosters.
            </p>
          </div>

          <div className="bg-black/50 border border-white/10 p-4 rounded-2xl text-center min-w-[140px]">
            <div className="text-3xl font-black font-mono text-emerald-400">{totalTeams}</div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">
              Total Teams
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-black/40 glass-panel rounded-2xl border border-white/5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs font-mono font-bold transition cursor-pointer flex flex-col items-center gap-1 ${
              activeCategory === cat
                ? "bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="truncate w-full text-center">{CATEGORY_LABELS[cat]}</span>
            <span className="text-[10px] font-normal text-slate-500">
              {teamCounts[cat]} Teams • {teamCounts[cat] > 10 ? "Round-Robin" : "Knockout"}
            </span>
          </button>
        ))}
      </div>

      {/* Active Category Configuration Panel */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-emerald-400" />
              {CATEGORY_LABELS[activeCategory]}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {teamCounts[activeCategory] > 10
                ? "Category has >10 teams: Round-Robin group stages activated (BWF Article 16 tiebreakers)."
                : "Category has <=10 teams: Direct elimination knockout bracket generated."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Team Count Dropdown Selector (Acceptable Even Numbers) */}
            <div className="flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-xl border border-white/10">
              <label htmlFor="team-count-select" className="text-xs font-mono text-slate-400">
                Number of Teams:
              </label>
              <select
                id="team-count-select"
                value={teamCounts[activeCategory]}
                onChange={(e) =>
                  handleCountChange(activeCategory, parseInt(e.target.value, 10))
                }
                className="bg-transparent text-emerald-400 font-mono font-bold text-sm focus:outline-none cursor-pointer"
              >
                {EVEN_TEAM_OPTIONS.map((num) => (
                  <option key={num} value={num} className="bg-slate-900 text-slate-200">
                    {num} Teams
                  </option>
                ))}
              </select>
            </div>

            {/* Random Name Shuffle Button */}
            <button
              onClick={() => handleRegenerateCategory(activeCategory)}
              className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
              title="Shuffle unique category-themed names"
            >
              <Shuffle className="w-3.5 h-3.5" />
              Shuffle Names
            </button>
          </div>
        </div>

        {/* Manual Customization Toggle Checkbox */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-black/30 border border-white/5">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id={`manual-toggle-${activeCategory}`}
              checked={manualModeMap[activeCategory]}
              onChange={() => handleToggleManual(activeCategory)}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-900 border-slate-700 cursor-pointer"
            />
            <label
              htmlFor={`manual-toggle-${activeCategory}`}
              className="text-sm font-semibold text-slate-200 cursor-pointer flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4 text-emerald-400" />
              Customize Team Names Manually
            </label>
          </div>
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            {manualModeMap[activeCategory]
              ? "Manual typing mode enabled"
              : "Auto-generated unique names active"}
          </span>
        </div>

        {/* Teams List (Display or Editable Inputs) */}
        <div className="space-y-3">
          <div className="text-xs font-mono uppercase text-slate-400 tracking-wider flex items-center justify-between">
            <span>Competitor Teams ({teamsMap[activeCategory].length})</span>
            <span className="text-[11px] text-slate-500">
              {manualModeMap[activeCategory]
                ? "Click any input to rename"
                : "Generated from authentic category pool"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {teamsMap[activeCategory].map((teamName, index) => (
              <div
                key={index}
                className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center gap-3"
              >
                <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-mono text-slate-400 font-bold shrink-0">
                  #{index + 1}
                </span>

                {manualModeMap[activeCategory] ? (
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) =>
                      handleTeamNameEdit(activeCategory, index, e.target.value)
                    }
                    className="flex-1 bg-transparent border-b border-emerald-500/40 text-sm font-semibold text-white focus:outline-none focus:border-emerald-400 py-0.5"
                    placeholder={`Team ${index + 1}`}
                  />
                ) : (
                  <span className="text-sm font-semibold text-slate-200 truncate">
                    {teamName}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Start Tournament Action Footer */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400 font-mono">
          Ready to seed fixtures across <strong className="text-white">6 Physical Courts</strong> with BWF statutory rules.
        </div>

        <button
          onClick={handleSubmit}
          className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.99] text-slate-950 font-black font-mono text-base tracking-wide uppercase transition shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2.5 cursor-pointer border border-emerald-300"
        >
          <Play className="w-5 h-5 fill-current" />
          Generate Fixtures & Start Tournament
        </button>
      </div>
    </div>
  );
};
