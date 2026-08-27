import { useState, useEffect } from "react";
import { Joystick, JoystickMode } from "./components/Joystick";
import { FiveKeyCluster } from "./components/FiveKeyCluster";
import { TitleBar } from "./components/TitleBar";
import { KeyButton } from "./components/KeyButton";
import {
  KeyMappingConfig,
  DEFAULT_KEY_MAPPINGS,
  parseKeyboardEventToKey,
} from "./types/mappings";
import "./App.css";

const LOCAL_STORAGE_KEY = "key_on_screen_mappings_v1";
const JOYSTICK_MODE_KEY = "key_on_screen_joystick_mode_v1";

function loadSavedMappings(): KeyMappingConfig {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_KEY_MAPPINGS, ...JSON.parse(saved) };
    }
  } catch {
    // Ignore parse errors and fallback to defaults
  }
  return DEFAULT_KEY_MAPPINGS;
}

function App() {
  const [mappings, setMappings] = useState<KeyMappingConfig>(loadSavedMappings);
  const [isMappingMode, setIsMappingMode] = useState<boolean>(false);
  const [rebindingId, setRebindingId] = useState<keyof KeyMappingConfig | null>(null);

  const [joystickMode, setJoystickMode] = useState<JoystickMode>(() => {
    const saved = localStorage.getItem(JOYSTICK_MODE_KEY);
    return saved === "arrows" ? "arrows" : "wasd";
  });

  // Save mappings to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mappings));
  }, [mappings]);

  // Save joystick mode to localStorage
  useEffect(() => {
    localStorage.setItem(JOYSTICK_MODE_KEY, joystickMode);
  }, [joystickMode]);

  // Global key listener for rebinding mode
  useEffect(() => {
    if (!rebindingId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === "Escape") {
        setRebindingId(null);
        return;
      }

      const newKey = parseKeyboardEventToKey(e);
      setMappings((prev) => ({
        ...prev,
        [rebindingId]: newKey,
      }));
      setRebindingId(null);
    };

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [rebindingId]);

  const handleRequestRebind = (buttonId: keyof KeyMappingConfig) => {
    setRebindingId(buttonId);
  };

  const handleResetDefaults = () => {
    setMappings(DEFAULT_KEY_MAPPINGS);
    setJoystickMode("wasd");
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(JOYSTICK_MODE_KEY);
  };

  return (
    <main className="container h-screen w-screen bg-transparent p-6 select-none relative overflow-hidden">
      {/* Custom Window Title Bar (Transparent Top Bar with Translucent Glass Controls) */}
      <TitleBar
        isMappingMode={isMappingMode}
        onToggleMappingMode={() => {
          setIsMappingMode(!isMappingMode);
          setRebindingId(null);
        }}
        onResetDefaults={handleResetDefaults}
      />

      {/* Top Left HUD: Pause / ESC Key Button */}
      <div className="absolute top-16 left-6 z-40 flex items-center gap-2">
        <KeyButton
          targetKey={mappings.top_pause || "ESCAPE"}
          label={mappings.top_pause === "ESCAPE" ? "ESC" : mappings.top_pause}
          size="md"
          variant="red"
          isMapping={isMappingMode}
          isRebinding={rebindingId === "top_pause"}
          onRebindClick={() => handleRequestRebind("top_pause")}
        />
        {isMappingMode && (
          <span className="text-[11px] font-bold text-slate-400 bg-slate-900/80 px-2 py-1 rounded-md border border-slate-700/60">
            Pause Key
          </span>
        )}
      </div>

      {/* Active Rebind Banner Overlay */}
      {rebindingId && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-amber-500/95 text-slate-950 font-extrabold px-6 py-2.5 rounded-full shadow-2xl backdrop-blur border border-amber-300 animate-pulse text-xs tracking-wide z-50 flex items-center gap-2">
          <span>PRESS ANY KEY ON YOUR KEYBOARD TO BIND (ESC TO CANCEL)</span>
        </div>
      )}

      {/* Left HUD: Floating 8-Directional Joystick */}
      <div className="absolute bottom-20 left-28">
        <Joystick
          size={170}
          knobSize={60}
          mode={joystickMode}
          isMapping={isMappingMode}
          onToggleMode={() =>
            setJoystickMode((prev) => (prev === "wasd" ? "arrows" : "wasd"))
          }
        />
      </div>

      {/* Right HUD: Floating 5-Key MOBA Cluster */}
      <div className="absolute bottom-13 right-25">
        <FiveKeyCluster
          mappings={mappings}
          isMapping={isMappingMode}
          rebindingId={rebindingId}
          onRequestRebind={handleRequestRebind}
        />
      </div>
    </main>
  );
}

export default App;
