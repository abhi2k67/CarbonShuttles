"use client";

import React, { useState } from "react";
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
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onExportBackup?: () => void;
  onImportBackup?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  connectionStatus,
  pendingSyncCount,
  isAdmin,
  onLogin,
  theme,
  onToggleTheme,
  onExportBackup,
  onImportBackup,
}) => {
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>("admin");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [loginError, setLoginError] = useState<string | null>(null);

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

  const handleLogout = () => {
    onLogin(false);
    if (activeTab === "umpire" || activeTab === "organizer" || activeTab === "setup") {
      onTabChange("arena");
    }
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
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md group-hover:scale-105 transition">
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
                  CARBON<span className="text-emerald-600 dark:text-emerald-400 font-mono">SHUTTLES</span>
                </span>
                <span className="hidden md:inline-block text-[9px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  SEASON VI
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-tight hidden lg:block">
                Annual Badminton Championship • 6-Court Realtime Engine
              </p>
            </div>
          </div>

          {/* View Switcher Tabs */}
          <nav className="flex items-center gap-1 bg-slate-200/70 dark:bg-black/50 p-1 rounded-xl border border-black/5 dark:border-white/5 overflow-x-auto max-w-[62vw] sm:max-w-none">
            {/* 1. Arena View (Always visible) */}
            <button
              onClick={() => onTabChange("arena")}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === "arena"
                  ? "bg-emerald-500 text-slate-950 font-bold shadow-sm"
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
                  ? "bg-amber-400 text-slate-950 font-bold shadow-sm"
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
                  ? "bg-indigo-500 text-white font-bold shadow-sm"
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
                  ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
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
                      ? "bg-red-500 text-white font-bold shadow-sm"
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
                      ? "bg-teal-500 text-slate-950 font-bold shadow-sm"
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
                      ? "bg-slate-800 text-white dark:bg-slate-700 font-bold shadow-sm"
                      : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Organizer
                </button>
              </>
            )}
          </nav>

          {/* Right Controls: Theme Toggle, Admin Lock/Unlock, Backup, SSE Status */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Light / Dark Mode Switcher */}
            <button
              onClick={onToggleTheme}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
              className="p-1.5 sm:p-2 rounded-xl border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Admin Role Status / Login Button */}
            {isAdmin ? (
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  <Unlock className="w-3 h-3 text-amber-500" />
                  ADMIN
                </span>
                <button
                  onClick={handleLogout}
                  title="Logout Admin"
                  className="p-1.5 sm:p-2 rounded-xl border border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
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
                <label className="block text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  required
                  autoFocus
                />
              </div>

              {loginError && (
                <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="px-3 py-2 rounded-xl text-xs font-mono text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs transition cursor-pointer shadow-sm"
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
