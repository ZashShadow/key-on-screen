import React, { useRef, useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

interface JoystickProps {
  size?: number; // Outer diameter in px
  knobSize?: number; // Inner knob diameter in px
}

// 8-direction sector helper
function get8DirectionKeys(deg: number): string[] {
  // deg is 0 to 360, where 0 is Right (D), 90 is Up (W), 180 is Left (A), 270 is Down (S)
  if (deg >= 337.5 || deg < 22.5) return ["D"];
  if (deg >= 22.5 && deg < 67.5) return ["W", "D"];
  if (deg >= 67.5 && deg < 112.5) return ["W"];
  if (deg >= 112.5 && deg < 157.5) return ["W", "A"];
  if (deg >= 157.5 && deg < 202.5) return ["A"];
  if (deg >= 202.5 && deg < 247.5) return ["S", "A"];
  if (deg >= 247.5 && deg < 292.5) return ["S"];
  if (deg >= 292.5 && deg < 337.5) return ["S", "D"];
  return [];
}

export const Joystick: React.FC<JoystickProps> = ({
  size = 180,
  knobSize = 64,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);

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
    setActiveKeys(newKeysArr);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
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

    const targetKeys = get8DirectionKeys(deg);
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

  const isKeyActive = (key: string) => activeKeys.includes(key);

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {/* Active Keys Badge Indicator */}
      <div className="flex gap-1.5 h-7 items-center justify-center">
        {["W", "A", "S", "D"].map((k) => (
          <span
            key={k}
            className={`px-2 py-0.5 text-xs font-bold rounded transition-colors duration-150 ${
              isKeyActive(k)
                ? "bg-red-500 text-white shadow-lg shadow-red-500/50 scale-110"
                : "bg-slate-800/80 text-slate-400 border border-slate-700/50"
            }`}
          >
            {k}
          </span>
        ))}
      </div>

      {/* Joystick Container */}
      <div
        ref={containerRef}
        style={{ width: size, height: size }}
        className="relative rounded-full bg-slate-900/80 border-2 border-slate-700/60 backdrop-blur-md shadow-2xl flex items-center justify-center cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Direction Indicator Rings/Crosshairs */}
        <div className="absolute inset-0 rounded-full border border-slate-800 pointer-events-none" />
        <div className="absolute w-full h-[1px] bg-slate-800/60 pointer-events-none" />
        <div className="absolute h-full w-[1px] bg-slate-800/60 pointer-events-none" />

        {/* Diagonal Direction Hints */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[85%] h-[85%] rounded-full border border-dashed border-slate-700/30" />
        </div>

        {/* Direction Labels */}
        <span
          className={`absolute top-2 text-[10px] font-bold ${
            isKeyActive("W") ? "text-red-400 font-extrabold" : "text-slate-500"
          }`}
        >
          W
        </span>
        <span
          className={`absolute bottom-2 text-[10px] font-bold ${
            isKeyActive("S") ? "text-red-400 font-extrabold" : "text-slate-500"
          }`}
        >
          S
        </span>
        <span
          className={`absolute left-2 text-[10px] font-bold ${
            isKeyActive("A") ? "text-red-400 font-extrabold" : "text-slate-500"
          }`}
        >
          A
        </span>
        <span
          className={`absolute right-2 text-[10px] font-bold ${
            isKeyActive("D") ? "text-red-400 font-extrabold" : "text-slate-500"
          }`}
        >
          D
        </span>

        {/* Joystick Movable Handle/Knob */}
        <div
          style={{
            width: knobSize,
            height: knobSize,
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
          className={`rounded-full shadow-xl flex items-center justify-center transition-transform duration-75 ease-out ${
            isDragging
              ? "bg-gradient-to-br from-red-500 to-rose-600 border-2 border-red-300 shadow-red-500/40"
              : "bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 shadow-black/50"
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
