import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface KeyButtonProps {
  /** The target keyboard key to send to system (e.g. "W", "SPACE", "SHIFT", "E", "Q", "1", "UP", "ENTER", "CTRL") */
  targetKey: string;
  /** Visible label on the button. Defaults to targetKey if not provided */
  label?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg" | "wide" | "extra-wide" | "pill" | "moba-main" | "moba-skill" | "moba-sub";
  /** Shape variant */
  shape?: "square" | "circle";
  /** Color theme variant */
  variant?: "red" | "blue" | "emerald" | "amber" | "purple" | "cyan" | "slate";
  /** Optional controlled pressed state from parent */
  pressed?: boolean;
  /** Is UI currently in key mapping mode */
  isMapping?: boolean;
  /** Is this specific button currently waiting for a physical keypress to rebind */
  isRebinding?: boolean;
  /** Custom Tailwind CSS classes */
  className?: string;
  /** Callback fired when button is pressed in normal mode */
  onPress?: () => void;
  /** Callback fired when button is released in normal mode */
  onRelease?: () => void;
  /** Callback fired when button is clicked in mapping mode */
  onRebindClick?: () => void;
}

function formatKeyLabel(rawKey: string): string {
  const k = rawKey.toUpperCase();
  if (k === "ESCAPE" || k === "ESC") return "ESC";
  if (k === "SPACE") return "SPC";
  if (k === "SHIFT") return "Shift";
  if (k === "CONTROL" || k === "CTRL") return "Ctrl";
  if (k === "ALT") return "Alt";
  if (k === "BACKSPACE") return "BS";
  if (k === "DELETE") return "DEL";
  if (k === "CAPSLOCK") return "CAPS";
  if (k === "ENTER") return "ENT";
  return rawKey;
}

const sizeClasses = {
  sm: "h-10 w-10 text-sm rounded-lg",
  md: "h-14 w-14 text-base rounded-xl",
  lg: "h-16 w-16 text-lg rounded-xl",
  wide: "h-14 w-28 text-base rounded-xl",
  "extra-wide": "h-14 w-36 text-base rounded-xl",
  pill: "h-10 px-4 text-xs font-bold rounded-full",
  "moba-main": "h-22 w-22 text-xl rounded-full border-2 shadow-2xl",
  "moba-skill": "h-14 w-14 text-base rounded-full border-2 shadow-lg",
  "moba-sub": "h-11 w-11 text-xs rounded-full border shadow-md",
};

const variantClasses = {
  red: {
    active: "bg-red-500/90 border-red-300 text-white shadow-red-500/60 scale-105 ring-2 ring-red-400/50",
    inactive: "bg-gradient-to-b from-red-600/40 to-red-900/40 border-red-400/50 text-white backdrop-blur-md hover:from-red-500/60 hover:to-red-800/60 shadow-lg shadow-red-950/30",
  },
  blue: {
    active: "bg-blue-500/90 border-blue-300 text-white shadow-blue-500/60 scale-105 ring-2 ring-blue-400/50",
    inactive: "bg-gradient-to-b from-blue-600/40 to-blue-900/40 border-blue-400/50 text-white backdrop-blur-md hover:from-blue-500/60 hover:to-blue-800/60 shadow-lg shadow-blue-950/30",
  },
  emerald: {
    active: "bg-emerald-500/90 border-emerald-300 text-white shadow-emerald-500/60 scale-105 ring-2 ring-emerald-400/50",
    inactive: "bg-gradient-to-b from-emerald-600/40 to-emerald-900/40 border-emerald-400/50 text-white backdrop-blur-md hover:from-emerald-500/60 hover:to-emerald-800/60 shadow-lg shadow-emerald-950/30",
  },
  amber: {
    active: "bg-amber-500/90 border-amber-300 text-white shadow-amber-500/60 scale-105 ring-2 ring-amber-400/50",
    inactive: "bg-gradient-to-b from-amber-600/40 to-amber-900/40 border-amber-400/50 text-white backdrop-blur-md hover:from-amber-500/60 hover:to-amber-800/60 shadow-lg shadow-amber-950/30",
  },
  purple: {
    active: "bg-purple-500/90 border-purple-300 text-white shadow-purple-500/60 scale-105 ring-2 ring-purple-400/50",
    inactive: "bg-gradient-to-b from-purple-600/40 to-purple-900/40 border-purple-400/50 text-white backdrop-blur-md hover:from-purple-500/60 hover:to-purple-800/60 shadow-lg shadow-purple-950/30",
  },
  cyan: {
    active: "bg-cyan-500/90 border-cyan-300 text-white shadow-cyan-500/60 scale-105 ring-2 ring-cyan-400/50",
    inactive: "bg-gradient-to-b from-cyan-600/40 to-cyan-900/40 border-cyan-400/50 text-white backdrop-blur-md hover:from-cyan-500/60 hover:to-cyan-800/60 shadow-lg shadow-cyan-950/30",
  },
  slate: {
    active: "bg-slate-500/90 border-slate-300 text-white shadow-slate-500/60 scale-105 ring-2 ring-slate-400/50",
    inactive: "bg-gradient-to-b from-slate-700/40 to-slate-900/40 border-slate-500/50 text-slate-200 backdrop-blur-md hover:from-slate-600/60 hover:to-slate-800/60 shadow-lg shadow-black/30",
  },
};

export const KeyButton: React.FC<KeyButtonProps> = ({
  targetKey,
  label,
  size = "md",
  shape,
  variant = "red",
  pressed: controlledPressed,
  isMapping = false,
  isRebinding = false,
  className = "",
  onPress,
  onRelease,
  onRebindClick,
}) => {
  const [internalPressed, setInternalPressed] = useState(false);
  const isPressed = controlledPressed !== undefined ? controlledPressed : internalPressed;

  const rawText = label ?? targetKey;
  const displayLabel = isRebinding ? "..." : formatKeyLabel(rawText);
  const textLengthClass = displayLabel.length > 3 ? "!text-xs px-1" : "";

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isMapping) {
      if (onRebindClick) onRebindClick();
      return;
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore pointer capture errors
    }
    setInternalPressed(true);
    invoke("send_key_input", { key: targetKey, pressed: true });
    if (onPress) onPress();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (isMapping) return;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore pointer capture loss
    }
    setInternalPressed(false);
    invoke("send_key_input", { key: targetKey, pressed: false });
    if (onRelease) onRelease();
  };

  const sizeStyle = sizeClasses[size] || sizeClasses.md;
  const variantStyle = variantClasses[variant] || variantClasses.red;
  const shapeStyle = shape === "circle" ? "!rounded-full" : shape === "square" ? "!rounded-xl" : "";

  // Mapping state visual styling
  let mappingOverlayStyle = "";
  if (isRebinding) {
    mappingOverlayStyle = "animate-pulse !bg-amber-400 !border-amber-200 !text-slate-950 ring-4 ring-amber-400/80 scale-110 shadow-lg shadow-amber-500/50";
  } else if (isMapping) {
    mappingOverlayStyle = "ring-2 ring-cyan-400/80 ring-offset-2 ring-offset-slate-900 border-cyan-400/90 hover:scale-105";
  }

  return (
    <button
      type="button"
      className={`font-bold transition-all duration-150 flex items-center justify-center cursor-pointer select-none active:scale-95 touch-none overflow-hidden text-ellipsis whitespace-nowrap ${sizeStyle} ${shapeStyle} ${
        isPressed ? variantStyle.active : variantStyle.inactive
      } ${mappingOverlayStyle} ${textLengthClass} ${className}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onContextMenu={(e) => e.preventDefault()}
    >
      {displayLabel}
    </button>
  );
};

export default KeyButton;
