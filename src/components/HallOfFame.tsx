"use client";

import React, { useState } from "react";
import {
  Trophy,
  Award,
  Medal,
  Calendar,
  Sparkles,
  Flame,
  Crown,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface SeasonRecord {
  seasonNumber: number;
  year: number;
  title: string;
  theme: string;
  venue: string;
  mvp: string;
  totalParticipants: number;
  categories: {
    category: string;
    champion: string;
    runnerUp: string;
    finalScore: string;
  }[];
  highlight: string;
}

const HISTORICAL_SEASONS: SeasonRecord[] = [
  {
    seasonNumber: 5,
    year: 2025,
    title: "Carbon Shuttles Season V: Champions Clash",
    theme: "The Gold Standard",
    venue: "Elite Arena Badminton Hub - Court Complex",
    mvp: "Arun V. & Rajesh K. (11 match streak)",
    totalParticipants: 48,
    highlight: "Thrilling 24-22 deuce final in Men's Doubles Class A deciding set.",
    categories: [
      {
        category: "Men's Doubles - Class A",
        champion: "Arun V. / Rajesh K.",
        runnerUp: "Vikram S. / Rohan M.",
        finalScore: "21-19, 18-21, 24-22",
      },
      {
        category: "Men's Doubles - Class B",
        champion: "Karthik N. / Sanjay D.",
        runnerUp: "Praveen T. / Naveen R.",
        finalScore: "21-16, 21-18",
      },
      {
        category: "Mixed Doubles - Class A",
        champion: "Deepak S. / Pooja M.",
        runnerUp: "Aditya C. / Sneha P.",
        finalScore: "21-15, 22-20",
      },
      {
        category: "Women's Doubles - Open",
        champion: "Ananya R. / Meera K.",
        runnerUp: "Swati G. / Divya B.",
        finalScore: "21-17, 21-14",
      },
    ],
  },
  {
    seasonNumber: 4,
    year: 2024,
    title: "Carbon Shuttles Season IV: High Octane",
    theme: "Speed & Precision",
    venue: "Metro Smash Indoor Stadium",
    mvp: "Pooja M. & Deepak S.",
    totalParticipants: 44,
    highlight: "First season introducing electronic live scoreboards and 6-court rotation.",
    categories: [
      {
        category: "Men's Doubles - Class A",
        champion: "Vikram S. / Manish J.",
        runnerUp: "Siddharth R. / Gaurav B.",
        finalScore: "21-14, 21-19",
      },
      {
        category: "Men's Doubles - Class B",
        champion: "Sanjay D. / Harish L.",
        runnerUp: "Amitabh K. / Rahul S.",
        finalScore: "21-19, 19-21, 21-17",
      },
      {
        category: "Mixed Doubles - Class A",
        champion: "Deepak S. / Pooja M.",
        runnerUp: "Kunal T. / Ritu N.",
        finalScore: "21-13, 21-18",
      },
    ],
  },
  {
    seasonNumber: 3,
    year: 2023,
    title: "Carbon Shuttles Season III: The Smash Fest",
    theme: "Relentless Rallies",
    venue: "Smash Zone Arena",
    mvp: "Vikram S. (Top smasher - 310 km/h)",
    totalParticipants: 40,
    highlight: "Record-breaking 68-shot rally in the semi-finals.",
    categories: [
      {
        category: "Men's Doubles - Class A",
        champion: "Vikram S. / Rohan M.",
        runnerUp: "Arun V. / Sandeep G.",
        finalScore: "21-17, 17-21, 21-19",
      },
      {
        category: "Men's Doubles - Class B",
        champion: "Naveen R. / Pradeep K.",
        runnerUp: "Sunil M. / Tarun J.",
        finalScore: "21-15, 21-18",
      },
      {
        category: "Mixed Doubles - Class A",
        champion: "Aditya C. / Sneha P.",
        runnerUp: "Rajat V. / Neha S.",
        finalScore: "21-18, 21-16",
      },
    ],
  },
  {
    seasonNumber: 2,
    year: 2022,
    title: "Carbon Shuttles Season II: Rising Stars",
    theme: "Breakthrough Edition",
    venue: "City Sports Complex",
    mvp: "Rohan M. (Best Defense)",
    totalParticipants: 32,
    highlight: "Doubled tournament participation with players across multiple clubs.",
    categories: [
      {
        category: "Men's Doubles - Class A",
        champion: "Arun V. / Sandeep G.",
        runnerUp: "Gaurav B. / Mohit K.",
        finalScore: "21-16, 21-15",
      },
      {
        category: "Men's Doubles - Class B",
        champion: "Rohan M. / Varun T.",
        runnerUp: "Karthik N. / Sanjay D.",
        finalScore: "21-18, 22-20",
      },
    ],
  },
  {
    seasonNumber: 1,
    year: 2021,
    title: "Carbon Shuttles Season I: The Inception",
    theme: "Where Legends Began",
    venue: "Club Shuttle Grounds",
    mvp: "Arun V.",
    totalParticipants: 24,
    highlight: "The inaugural annual championship that launched the Carbon Shuttles community tradition.",
    categories: [
      {
        category: "Men's Doubles - Open",
        champion: "Arun V. / Rajesh K.",
        runnerUp: "Vikram S. / Sandeep G.",
        finalScore: "21-18, 21-19",
      },
      {
        category: "Men's Doubles - Tier 2",
        champion: "Sanjay D. / Mohit K.",
        runnerUp: "Rahul S. / Pradeep K.",
        finalScore: "21-17, 21-16",
      },
    ],
  },
];

export const HallOfFame: React.FC = () => {
  const [selectedSeason, setSelectedSeason] = useState<number>(5);

  const activeRecord =
    HISTORICAL_SEASONS.find((s) => s.seasonNumber === selectedSeason) ||
    HISTORICAL_SEASONS[0];

  return (
    <div className="space-y-6">
      {/* Current Season 6 Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-emerald-950/60 via-slate-900/90 to-teal-950/60 border border-emerald-500/30 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <Crown className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                ACTIVE CHAMPIONSHIP
              </span>
              <span className="text-xs text-slate-400 font-mono">6 Years of Excellence</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide mt-1">
              Carbon Shuttles Season VI (2026)
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Current tournament in progress. Matches are underway across Courts 1 to 6 to crown this year&apos;s champions.
            </p>
          </div>
        </div>

        <div className="text-left md:text-right bg-black/40 px-4 py-3 rounded-xl border border-white/5">
          <div className="text-[11px] font-mono text-slate-400">Total Editions</div>
          <div className="text-lg font-bold text-amber-400 font-mono">6 Seasons (2021 – 2026)</div>
        </div>
      </div>

      {/* Main Hall of Fame Content */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-6">
        {/* Season Selector Tabs */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h3 className="text-xl font-bold text-white tracking-wide">
                Championship Roll of Honour
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Official champions and memorable finals from past editions
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/5 overflow-x-auto">
            {HISTORICAL_SEASONS.map((s) => (
              <button
                key={s.seasonNumber}
                onClick={() => setSelectedSeason(s.seasonNumber)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  selectedSeason === s.seasonNumber
                    ? "bg-amber-400 text-slate-950 font-bold shadow-[0_0_12px_rgba(251,191,36,0.4)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Medal className="w-3.5 h-3.5" />
                Season {s.seasonNumber} ({s.year})
              </button>
            ))}
          </div>
        </div>

        {/* Selected Season Header Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-[10px] font-mono uppercase text-slate-400">Tournament Edition</span>
            <div className="text-sm font-bold text-white mt-1">{activeRecord.title}</div>
            <div className="text-xs text-amber-300 font-mono mt-0.5">&ldquo;{activeRecord.theme}&rdquo;</div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-[10px] font-mono uppercase text-slate-400">Venue & Turnout</span>
            <div className="text-sm font-bold text-white mt-1">{activeRecord.venue}</div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              {activeRecord.totalParticipants} Badminton Athletes
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-[10px] font-mono uppercase text-slate-400">Player of the Tournament (MVP)</span>
            <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {activeRecord.mvp}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">Highest tournament impact</div>
          </div>
        </div>

        {/* Categories & Champions Grid */}
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 font-semibold">
            Category Champions & Podium Finishes
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRecord.categories.map((cat, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-amber-400/40 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      {cat.category}
                    </span>
                    <span className="text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Final: {cat.finalScore}
                    </span>
                  </div>

                  {/* Winner */}
                  <div className="flex items-center gap-3 mt-4">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 font-bold text-xs">
                      🥇
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase text-amber-400 font-bold tracking-wider">
                        Champion
                      </div>
                      <div className="text-sm font-bold text-white tracking-wide">
                        {cat.champion}
                      </div>
                    </div>
                  </div>

                  {/* Runner Up */}
                  <div className="flex items-center gap-3 mt-3">
                    <div className="w-8 h-8 rounded-full bg-slate-400/20 border border-slate-400/40 flex items-center justify-center text-slate-300 font-bold text-xs">
                      🥈
                    </div>
                    <div>
                      <div className="text-[10px] font-mono uppercase text-slate-400 font-semibold tracking-wider">
                        Runner-Up
                      </div>
                      <div className="text-xs font-medium text-slate-300">
                        {cat.runnerUp}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Season Memory / Highlight */}
        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
          <Flame className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold text-amber-300 font-mono">Season Key Highlight</div>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              {activeRecord.highlight}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
