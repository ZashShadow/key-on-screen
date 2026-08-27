import React from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

interface TitleBarProps {
  isMappingMode: boolean;
  onToggleMappingMode: () => void;
  onResetDefaults?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  isMappingMode,
  onToggleMappingMode,
  onResetDefaults,
}) => {
  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      getCurrentWindow().minimize();
    } catch {
      // Fallback to Rust command
    }
    invoke("minimize_window").catch(() => {});
  };

  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      getCurrentWindow().toggleMaximize();
    } catch {
      // Fallback to Rust command
    }
    invoke("toggle_maximize_window").catch(() => {});
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      getCurrentWindow().close();
    } catch {
      // Fallback to Rust command
    }
    invoke("close_window").catch(() => {});
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-transparent flex items-center justify-between px-6 z-50 select-none pointer-events-auto">
      {/* Left side: App Logo & Draggable Title Area */}
      <div
        data-tauri-drag-region
        className="flex items-center gap-2 text-slate-300 font-extrabold text-sm tracking-wider cursor-grab active:cursor-grabbing h-full px-2"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400/50 pointer-events-none" />
        <span data-tauri-drag-region className="text-xs uppercase tracking-widest text-slate-400 pointer-events-none">
          Key Overlay
        </span>
      </div>

      {/* Center: Translucent Mapping Mode Control Bar */}
      <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-slate-700/60 shadow-xl">
        <button
          type="button"
          onClick={onToggleMappingMode}
          className={`px-3 py-1 text-xs font-extrabold rounded-xl transition-all duration-150 flex items-center gap-1.5 cursor-pointer shadow-md ${
            isMappingMode
              ? "bg-amber-500 text-slate-950 shadow-amber-500/40 ring-2 ring-amber-400 scale-105"
              : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
          }`}
        >
          <span>{isMappingMode ? "⚙️ Mapping: ON" : "🎮 Mapping: OFF"}</span>
        </button>

        {isMappingMode && onResetDefaults && (
          <button
            type="button"
            onClick={onResetDefaults}
            className="px-3 py-1 text-xs font-bold bg-slate-800 text-slate-300 hover:bg-red-600/80 hover:text-white rounded-xl transition-colors border border-slate-700 cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* Right side: Translucent Glass Window Controls (Minimize, Maximize, Close) */}
      <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-2xl border border-slate-700/60 shadow-xl">
        {/* Minimize Button */}
        <button
          type="button"
          onClick={handleMinimize}
          title="Minimize"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/80 transition-all cursor-pointer active:scale-90"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
            <rect x="2" y="7.5" width="12" height="1.5" rx="0.75" />
          </svg>
        </button>

        {/* Maximize / Restore Button */}
        <button
          type="button"
          onClick={handleMaximize}
          title="Maximize / Restore"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-slate-700/80 transition-all cursor-pointer active:scale-90"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="10" height="10" rx="1.5" />
          </svg>
        </button>

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          title="Close Overlay"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-white hover:bg-red-500 transition-all cursor-pointer active:scale-90"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>
    </header>
  );
};
