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
  /** Custom Tailwind CSS classes */
  className?: string;
  /** Callback fired when button is pressed */
  onPress?: () => void;
  /** Callback fired when button is released */
  onRelease?: () => void;
}

const sizeClasses = {
  sm: "h-10 w-10 text-sm rounded-lg",
  md: "h-14 w-14 text-lg rounded-xl",
  lg: "h-16 w-16 text-xl rounded-xl",
  wide: "h-14 w-28 text-base rounded-xl",
  "extra-wide": "h-14 w-36 text-base rounded-xl",
  pill: "h-10 px-4 text-xs font-bold rounded-full",
  "moba-main": "h-22 w-22 text-xl rounded-full border-2 shadow-2xl",
  "moba-skill": "h-14 w-14 text-base rounded-full border-2 shadow-lg",
  "moba-sub": "h-11 w-11 text-xs rounded-full border shadow-md",
};

const variantClasses = {
  red: {
    active: "bg-red-500 border-red-300 text-white shadow-red-500/60 scale-105 ring-2 ring-red-400/50",
    inactive: "bg-gradient-to-b from-red-600/90 to-red-800/90 border-red-500/60 text-white hover:from-red-500 hover:to-red-700 shadow-red-950/50",
  },
  blue: {
    active: "bg-blue-500 border-blue-300 text-white shadow-blue-500/60 scale-105 ring-2 ring-blue-400/50",
    inactive: "bg-gradient-to-b from-blue-600/90 to-blue-800/90 border-blue-500/60 text-white hover:from-blue-500 hover:to-blue-700 shadow-blue-950/50",
  },
  emerald: {
    active: "bg-emerald-500 border-emerald-300 text-white shadow-emerald-500/60 scale-105 ring-2 ring-emerald-400/50",
    inactive: "bg-gradient-to-b from-emerald-600/90 to-emerald-800/90 border-emerald-500/60 text-white hover:from-emerald-500 hover:to-emerald-700 shadow-emerald-950/50",
  },
  amber: {
    active: "bg-amber-500 border-amber-300 text-white shadow-amber-500/60 scale-105 ring-2 ring-amber-400/50",
    inactive: "bg-gradient-to-b from-amber-600/90 to-amber-800/90 border-amber-500/60 text-white hover:from-amber-500 hover:to-amber-700 shadow-amber-950/50",
  },
  purple: {
    active: "bg-purple-500 border-purple-300 text-white shadow-purple-500/60 scale-105 ring-2 ring-purple-400/50",
    inactive: "bg-gradient-to-b from-purple-600/90 to-purple-800/90 border-purple-500/60 text-white hover:from-purple-500 hover:to-purple-700 shadow-purple-950/50",
  },
  cyan: {
    active: "bg-cyan-500 border-cyan-300 text-white shadow-cyan-500/60 scale-105 ring-2 ring-cyan-400/50",
    inactive: "bg-gradient-to-b from-cyan-600/90 to-cyan-800/90 border-cyan-500/60 text-white hover:from-cyan-500 hover:to-cyan-700 shadow-cyan-950/50",
  },
  slate: {
    active: "bg-slate-500 border-slate-300 text-white shadow-slate-500/60 scale-105 ring-2 ring-slate-400/50",
    inactive: "bg-gradient-to-b from-slate-700/90 to-slate-900/90 border-slate-600/60 text-slate-200 hover:from-slate-600 hover:to-slate-800 shadow-black/50",
  },
};

export const KeyButton: React.FC<KeyButtonProps> = ({
  targetKey,
  label,
  size = "md",
  shape,
  variant = "red",
  pressed: controlledPressed,
  className = "",
  onPress,
  onRelease,
}) => {
  const [internalPressed, setInternalPressed] = useState(false);
  const isPressed = controlledPressed !== undefined ? controlledPressed : internalPressed;
  const displayLabel = label ?? targetKey;

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
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
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture was lost
    }
    setInternalPressed(false);
    invoke("send_key_input", { key: targetKey, pressed: false });
    if (onRelease) onRelease();
  };

  const sizeStyle = sizeClasses[size] || sizeClasses.md;
  const variantStyle = variantClasses[variant] || variantClasses.red;
  const shapeStyle = shape === "circle" ? "!rounded-full" : shape === "square" ? "!rounded-xl" : "";

  return (
    <button
      type="button"
      className={`font-bold transition-all duration-150 flex items-center justify-center cursor-pointer select-none active:scale-95 touch-none ${sizeStyle} ${shapeStyle} ${
        isPressed ? variantStyle.active : variantStyle.inactive
      } ${className}`}
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
