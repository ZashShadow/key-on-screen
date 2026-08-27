import React, { useRef, useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

export type JoystickMode = "wasd" | "arrows";

interface JoystickProps {
  size?: number; // Outer diameter in px
  knobSize?: number; // Inner knob diameter in px
  mode?: JoystickMode;
  isMapping?: boolean;
  onToggleMode?: () => void;
}

// 8-direction sector helper supporting WASD & Arrow Keys
function get8DirectionKeys(deg: number, mode: JoystickMode = "wasd"): string[] {
  const up = mode === "arrows" ? "UP" : "W";
  const down = mode === "arrows" ? "DOWN" : "S";
  const left = mode === "arrows" ? "LEFT" : "A";
  const right = mode === "arrows" ? "RIGHT" : "D";

  if (deg >= 337.5 || deg < 22.5) return [right];
  if (deg >= 22.5 && deg < 67.5) return [up, right];
  if (deg >= 67.5 && deg < 112.5) return [up];
  if (deg >= 112.5 && deg < 157.5) return [up, left];
  if (deg >= 157.5 && deg < 202.5) return [left];
  if (deg >= 202.5 && deg < 247.5) return [down, left];
  if (deg >= 247.5 && deg < 292.5) return [down];
  if (deg >= 292.5 && deg < 337.5) return [down, right];
  return [];
}

export const Joystick: React.FC<JoystickProps> = ({
  size = 180,
  knobSize = 64,
  mode = "wasd",
  isMapping = false,
  onToggleMode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Ref to keep track of active keys synchronously during drag
  const currentKeysRef = useRef<Set<string>>(new Set());

  const updateKeys = useCallback((newKeysArr: string[]) => {
    const nextSet = new Set(newKeysArr);
    const prevSet = currentKeysRef.current;

    // Keys to release: in prevSet but not in nextSet
    for (const key of prevSet) {
      if (!nextSet.has(key)) {
        invoke("send_key_input", { key, pressed: false });
      }
    }

    // Keys to press: in nextSet but not in prevSet
    for (const key of nextSet) {
      if (!prevSet.has(key)) {
        invoke("send_key_input", { key, pressed: true });
      }
    }

    currentKeysRef.current = nextSet;
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isMapping) return; // Don't activate key inputs while in mapping mode

    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    handlePointerMove(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging && e.buttons === 0) return;
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = (size - knobSize) / 2;
    const deadzone = 14;

    if (distance < deadzone) {
      setKnobPos({ x: 0, y: 0 });
      updateKeys([]);
      return;
    }

    // Angle in radians (Up is positive Y in math, so -dy)
    const angleRad = Math.atan2(-dy, dx);
    const deg = (angleRad * (180 / Math.PI) + 360) % 360;

    // Clamp knob position inside joystick boundary
    const clampedDistance = Math.min(distance, maxRadius);
    const knobX = Math.cos(angleRad) * clampedDistance;
    const knobY = -Math.sin(angleRad) * clampedDistance;

    setKnobPos({ x: knobX, y: knobY });

    const targetKeys = get8DirectionKeys(deg, mode);
    updateKeys(targetKeys);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if capture was lost
    }
    setKnobPos({ x: 0, y: 0 });
    updateKeys([]);
  };

  return (
    <div className="flex flex-col items-center select-none">
      {/* Interactive Mode Toggle Badge in Mapping Mode */}
      {isMapping && (
        <button
          type="button"
          onClick={onToggleMode}
          className="mb-3 px-3 py-1 text-xs font-bold bg-slate-900/90 text-cyan-300 border border-cyan-500/50 rounded-xl hover:bg-cyan-500 hover:text-slate-950 transition-all cursor-pointer shadow-lg shadow-cyan-500/20 active:scale-95"
        >
          🕹️ Joystick: {mode === "wasd" ? "WASD" : "Arrow Keys (↑↓←→)"}
        </button>
      )}

      {/* Joystick Container */}
      <div
        ref={containerRef}
        style={{ width: size, height: size }}
        className={`relative rounded-full bg-slate-900/40 border-2 border-slate-700/40 backdrop-blur-md shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing touch-none ${
          isMapping ? "ring-2 ring-cyan-400/60 ring-offset-2 ring-offset-slate-950" : ""
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Direction Indicator Rings/Crosshairs */}
        <div className="absolute inset-0 rounded-full border border-slate-800/40 pointer-events-none" />
        <div className="absolute w-full h-[1px] bg-slate-800/40 pointer-events-none" />
        <div className="absolute h-full w-[1px] bg-slate-800/40 pointer-events-none" />

        {/* Diagonal Direction Hints */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[85%] h-[85%] rounded-full border border-dashed border-slate-700/20" />
        </div>

        {/* Joystick Movable Handle/Knob */}
        <div
          style={{
            width: knobSize,
            height: knobSize,
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
          className={`rounded-full shadow-xl flex items-center justify-center transition-transform duration-75 ease-out ${
            isDragging
              ? "bg-gradient-to-br from-red-500/90 to-rose-600/90 border-2 border-red-300 shadow-red-500/40"
              : "bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-2 border-slate-600/50 backdrop-blur-sm shadow-black/30"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full ${
              isDragging ? "bg-white/80" : "bg-slate-400/50"
            }`}
          />
        </div>
      </div>
    </div>
  );
};
