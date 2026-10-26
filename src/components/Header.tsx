"use client";

import React, { useState, useEffect } from "react";
import { StreamConnectionStatus } from "@/hooks/useMatchStream";
import {
  Zap,
  Trophy,
  Layers,
  Flame,
  Radio,
  Wifi,
  WifiOff,
  Sliders,
  Sun,
  Moon,
  Lock,
  Unlock,
  Download,
  Upload,
  Crown,
  LogOut,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { Match, CATEGORY_SHORT, UmpireClaim } from "@/types/tournament";

export type ActiveTab =
  | "arena"
  | "umpire"
  | "standings"
  | "brackets"
  | "hall_of_fame"
  | "organizer"
  | "setup";

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  connectionStatus: StreamConnectionStatus;
  pendingSyncCount: number;
  isAdmin: boolean;
  onLogin: (status: boolean) => void;
  umpireCourt: number | null;
  onUmpireLogin: (courtNumber: number) => void;
  onUmpireLogout: () => void;
  courtUmpires?: Record<number, UmpireClaim>;
  currentUmpireId?: string;
  matches?: Match[];
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onExportBackup?: () => void;
  onImportBackup?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showUmpireModalTrigger?: boolean;
  onCloseUmpireModalTrigger?: () => void;
  requestedUmpireCourt?: number | null;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  connectionStatus,
  pendingSyncCount,
  isAdmin,
  onLogin,
  umpireCourt,
  onUmpireLogin,
  onUmpireLogout,
  courtUmpires = {},
  currentUmpireId = "",
  matches = [],
  theme,
  onToggleTheme,
  onExportBackup,
  onImportBackup,
  showUmpireModalTrigger = false,
  onCloseUmpireModalTrigger,
  requestedUmpireCourt = null,
}) => {
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>("admin");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Separate Umpire Login Modal State
  const [showUmpireModal, setShowUmpireModal] = useState<boolean>(false);
  const [umpirePasswordInput, setUmpirePasswordInput] = useState<string>("1234");
  const [selectedCourtToClaim, setSelectedCourtToClaim] = useState<number>(1);
  const [umpireLoginError, setUmpireLoginError] = useState<string | null>(null);

  // Sync external trigger for umpire modal (e.g. from CourtCard click)
  useEffect(() => {
    if (showUmpireModalTrigger) {
      if (requestedUmpireCourt && requestedUmpireCourt >= 1 && requestedUmpireCourt <= 6) {
        setSelectedCourtToClaim(requestedUmpireCourt);
      }
      setShowUmpireModal(true);
      if (onCloseUmpireModalTrigger) {
        onCloseUmpireModalTrigger();
      }
    }
  }, [showUmpireModalTrigger, requestedUmpireCourt, onCloseUmpireModalTrigger]);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim() === "admin" && passwordInput === "carbonshuttle") {
      onLogin(true);
      setShowLoginModal(false);
      setPasswordInput("");
      setLoginError(null);
    } else {
      setLoginError("Invalid credentials. Try User: admin, Password: carbonshuttle");
    }
  };

  const handleAdminLogout = () => {
    onLogin(false);
    if (activeTab === "organizer" || activeTab === "setup" || (!umpireCourt && activeTab === "umpire")) {
      onTabChange("arena");
    }
  };

  const handleUmpireSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (umpirePasswordInput.trim() !== "1234") {
      setUmpireLoginError("Invalid passcode. All official umpires authenticate with: 1234");
      return;
    }

    if (!selectedCourtToClaim) {
      setUmpireLoginError("Please select a court to manage.");
      return;
    }

    const claim = courtUmpires[selectedCourtToClaim];
    if (claim && claim.umpireId !== currentUmpireId) {
      setUmpireLoginError(`Court ${selectedCourtToClaim} is already occupied by another umpire. Only 1 umpire is permitted per court.`);
      return;
    }

    onUmpireLogin(selectedCourtToClaim);
    setShowUmpireModal(false);
    setUmpireLoginError(null);
    setUmpirePasswordInput("1234");
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-black/10 dark:border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand */}
          <div
            onClick={() => onTabChange("arena")}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-[#E50914] to-[#990000] flex items-center justify-center shadow-md group-hover:scale-105 transition shadow-red-950/30">
              {/* Badminton Shuttlecock Icon */}
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-white transform group-hover:rotate-12 transition duration-300"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L15 8H9L12 2Z" />
                <path d="M8 9H16L18 16H6L8 9Z" opacity="0.85" />
                <circle cx="12" cy="19" r="3" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-black text-base sm:text-lg tracking-wider text-slate-900 dark:text-white">
                  CARBON<span className="text-[#E50914] font-mono">SHUTTLES</span>
                </span>
                <span className="hidden md:inline-block text-[9px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded bg-red-500/10 dark:bg-[#E50914]/20 text-[#E50914] border border-[#E50914]/30">
                  SEASON VI
                </span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono tracking-tight hidden lg:block">
                Annual Badminton Championship • 6-Court Realtime Engine
              </p>
            </div>
          </div>

          {/* View Switcher Tabs */}
          <nav className="flex items-center gap-1 bg-slate-200/80 dark:bg-[#1a1a1a] p-1 rounded-xl border border-slate-300 dark:border-white/10 overflow-x-auto max-w-[62vw] sm:max-w-none">
            {/* 1. Arena View (Always visible) */}
            <button
              onClick={() => onTabChange("arena")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "arena"
                  ? "bg-[#3574F0] text-white dark:bg-[#E50914] dark:text-white font-bold shadow-sm"
                  : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Arena</span> View
            </button>

            {/* 2. Standings (Always visible) */}
            <button
              onClick={() => onTabChange("standings")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "standings"
                  ? "bg-[#3574F0] text-white dark:bg-[#E50914] dark:text-white font-bold shadow-sm"
                  : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Standings
            </button>

            {/* 3. Brackets (Always visible) */}
            <button
              onClick={() => onTabChange("brackets")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "brackets"
                  ? "bg-[#3574F0] text-white dark:bg-[#E50914] dark:text-white font-bold shadow-sm"
                  : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Brackets
            </button>

            {/* 4. Hall of Fame (Always visible) */}
            <button
              onClick={() => onTabChange("hall_of_fame")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "hall_of_fame"
                  ? "bg-[#3574F0] text-white dark:bg-[#E50914] dark:text-white font-bold shadow-sm"
                  : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <Crown className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span className="hidden sm:inline">Hall of</span> Fame
            </button>

            {/* ADMIN-ONLY TABS */}
            {isAdmin && (
              <>
                <button
                  onClick={() => onTabChange("umpire")}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeTab === "umpire"
                      ? "bg-[#3574F0] text-white dark:bg-[#E50914] dark:text-white font-bold shadow-sm"
                      : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Umpire
                </button>

                <button
                  onClick={() => onTabChange("setup")}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeTab === "setup"
                      ? "bg-[#3574F0] text-white dark:bg-[#E50914] dark:text-white font-bold shadow-sm"
                      : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Setup
                </button>

                <button
                  onClick={() => onTabChange("organizer")}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    activeTab === "organizer"
                      ? "bg-[#3574F0] text-white dark:bg-[#E50914] dark:text-white font-bold shadow-sm"
                      : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Organizer
                </button>
              </>
            )}

            {/* UMPIRE TAB (when logged in as Umpire, non-admin) */}
            {!isAdmin && umpireCourt !== null && (
              <button
                onClick={() => onTabChange("umpire")}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeTab === "umpire"
                    ? "bg-[#3574F0] text-white dark:bg-[#E50914] dark:text-white font-bold shadow-sm"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                Umpire (C{umpireCourt})
              </button>
            )}
          </nav>

          {/* Right Controls: Theme Toggle, Umpire Login, Admin Lock/Unlock, Backup, SSE Status */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Light / Dark Mode Switcher */}
            <button
              onClick={onToggleTheme}
              title={`Switch to ${theme === "dark" ? "IntelliJ IDEA Day" : "Netflix Dark"} mode`}
              className="p-1.5 sm:p-2 rounded-xl border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-[#3574F0]" />
              )}
            </button>

            {/* SEPARATE UMPIRE LOGIN / ROLE STATUS */}
            {umpireCourt !== null ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onTabChange("umpire")}
                  title={`Active Umpire for Court ${umpireCourt}`}
                  className="px-2 py-1.5 rounded-xl border border-red-500/40 bg-red-500/15 text-[11px] font-mono font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5 cursor-pointer hover:bg-red-500/25 transition"
                >
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span>Court {umpireCourt}</span>
                </button>
                <button
                  onClick={onUmpireLogout}
                  title={`Release Court ${umpireCourt} & Logout Umpire`}
                  className="p-1.5 rounded-xl border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setUmpireLoginError(null);
                  setShowUmpireModal(true);
                }}
                className="px-2.5 py-1.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-[11px] font-mono font-bold text-red-600 dark:text-red-400 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-red-500" />
                <span>Umpire Login</span>
              </button>
            )}

            {/* SEPARATE ADMIN LOGIN / ROLE STATUS */}
            {isAdmin ? (
              <div className="flex items-center gap-1">
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1.5 rounded-xl text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  <Unlock className="w-3 h-3 text-amber-500" />
                  ADMIN
                </span>
                <button
                  onClick={handleAdminLogout}
                  title="Logout Admin"
                  className="p-1.5 sm:p-2 rounded-xl border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-[11px] font-mono font-medium text-slate-700 dark:text-slate-300 transition flex items-center gap-1 cursor-pointer"
              >
                <Lock className="w-3 h-3" />
                <span className="hidden sm:inline">Admin</span> Login
              </button>
            )}

            {/* Live SSE Status Pill */}
            {connectionStatus === "connected" ? (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] sm:text-[11px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="hidden sm:inline">LIVE</span>
              </div>
            ) : connectionStatus === "reconnecting" ? (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] sm:text-[11px] font-mono bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="hidden sm:inline">RECONNECTING</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] sm:text-[11px] font-mono bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/40">
                <WifiOff className="w-3 h-3" />
                <span className="hidden sm:inline">OFFLINE</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SEPARATE UMPIRE LOGIN MODAL */}
      {showUmpireModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-red-500/40 max-w-lg w-full space-y-4 shadow-2xl my-auto">
            <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-500 shadow-sm">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Official Umpire Login
                    </h3>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                      BWF OFFICIAL
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Enter password 1234 &amp; choose court (1 Umpire per Court)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUmpireModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUmpireSubmit} className="space-y-4 pt-1">
              {/* Password Input: Common password 1234 for all umpires */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold">
                    Official Passcode
                  </label>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                    Default: 1234
                  </span>
                </div>
                <input
                  type="password"
                  value={umpirePasswordInput}
                  onChange={(e) => setUmpirePasswordInput(e.target.value)}
                  placeholder="Enter 1234"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-red-500"
                  required
                  autoFocus
                />
              </div>

              {/* Court Selector: Courts 1 through 6 */}
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold mb-2">
                  Select Court Terminal (Courts 1–6)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((courtNum) => {
                    const claim = courtUmpires[courtNum];
                    const isOccupiedByOther = !!(claim && claim.umpireId !== currentUmpireId);
                    const isClaimedByMe = !!(claim && claim.umpireId === currentUmpireId);
                    const isSelected = selectedCourtToClaim === courtNum;
                    const ongoing = matches.find(
                      (m) => m.status === "ongoing" && m.courtNumber === courtNum
                    );

                    return (
                      <button
                        type="button"
                        key={courtNum}
                        disabled={isOccupiedByOther}
                        onClick={() => {
                          setSelectedCourtToClaim(courtNum);
                          setUmpireLoginError(null);
                        }}
                        className={`relative p-3 rounded-xl border text-left transition flex flex-col justify-between min-h-[76px] cursor-pointer ${
                          isOccupiedByOther
                            ? "bg-slate-100 dark:bg-black/30 border-slate-300 dark:border-white/5 opacity-50 cursor-not-allowed"
                            : isSelected
                            ? "bg-red-500/15 border-2 border-red-500 shadow-md ring-2 ring-red-500/30"
                            : "bg-slate-100/70 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-red-500/40 hover:bg-red-500/5"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span
                            className={`font-mono font-bold text-xs ${
                              isSelected
                                ? "text-red-600 dark:text-red-400"
                                : "text-slate-800 dark:text-white"
                            }`}
                          >
                            Court {courtNum}
                          </span>

                          {isOccupiedByOther ? (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              IN USE
                            </span>
                          ) : isClaimedByMe ? (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                              YOURS
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold">
                              FREE
                            </span>
                          )}
                        </div>

                        <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">
                          {isOccupiedByOther
                            ? "Umpire Active"
                            : ongoing
                            ? `Live: ${CATEGORY_SHORT[ongoing.category]}`
                            : "Vacant / Idle"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {umpireLoginError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{umpireLoginError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  No multiple umpires permitted per court.
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowUmpireModal(false)}
                    className="px-3 py-2 rounded-xl text-xs font-mono text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold font-mono text-xs transition cursor-pointer shadow-md flex items-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Enter Court {selectedCourtToClaim} Console
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/40 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Admin Authentication</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Tournament Organizer Controls</p>
                </div>
              </div>
              <button
                onClick={() => setShowLoginModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-600 dark:text-slate-400 mb-1 font-bold">
                  User ID
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-[#3574F0] dark:focus:border-[#E50914]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-600 dark:text-slate-400 mb-1 font-bold">
                  Password
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-[#3574F0] dark:focus:border-[#E50914]"
                  required
                  autoFocus
                />
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-1.5 font-bold">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-mono text-slate-600 hover:text-black dark:text-slate-400 dark:hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#3574F0] hover:bg-[#2563EB] text-white dark:bg-[#E50914] dark:hover:bg-[#b80710] font-bold font-mono text-xs transition cursor-pointer shadow-sm"
                >
                  Unlock Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
