import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Joystick } from "./components/Joystick";
import "./App.css";

function App() {
  const [activeKeys, setActiveKeys] = useState<Record<string, boolean>>({});

  const handleKeyDown = (key: string) => {
    setActiveKeys((prev) => ({ ...prev, [key]: true }));
    invoke("send_key_input", { key, pressed: true });
  };

  const handleKeyUp = (key: string) => {
    setActiveKeys((prev) => ({ ...prev, [key]: false }));
    invoke("send_key_input", { key, pressed: false });
  };

  return (
    <main className="container h-screen w-screen bg-transparent p-6 select-none relative">
      {/* Overlay Control Panel Container */}
      <div className="absolute bottom-10 left-10 flex items-end gap-8 bg-slate-900/85 backdrop-blur-md p-5 rounded-2xl border border-slate-700/60 shadow-2xl">
        {/* WASD Button Cluster */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            className={`h-14 w-14 font-bold text-lg rounded-xl shadow-md border transition-all duration-150 flex items-center justify-center cursor-pointer select-none active:scale-95 ${
              activeKeys["W"]
                ? "bg-red-500 border-red-400 text-white shadow-red-500/50 scale-105"
                : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
            }`}
            onPointerDown={() => handleKeyDown("W")}
            onPointerUp={() => handleKeyUp("W")}
            onPointerLeave={() => handleKeyUp("W")}
            onContextMenu={(e) => e.preventDefault()}
          >
            W
          </button>
          <div className="flex gap-1.5">
            {["A", "S", "D"].map((key) => (
              <button
                key={key}
                type="button"
                className={`h-14 w-14 font-bold text-lg rounded-xl shadow-md border transition-all duration-150 flex items-center justify-center cursor-pointer select-none active:scale-95 ${
                  activeKeys[key]
                    ? "bg-red-500 border-red-400 text-white shadow-red-500/50 scale-105"
                    : "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
                }`}
                onPointerDown={() => handleKeyDown(key)}
                onPointerUp={() => handleKeyUp(key)}
                onPointerLeave={() => handleKeyUp(key)}
                onContextMenu={(e) => e.preventDefault()}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Separator Divider */}
        <div className="h-44 w-[1px] bg-slate-700/60 mx-1" />

        {/* 8-Directional Joystick */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-slate-400 mb-1 tracking-wider uppercase">
            8-Way Joystick
          </span>
          <Joystick size={170} knobSize={60} />
        </div>
      </div>
    </main>
  );
}

export default App;
