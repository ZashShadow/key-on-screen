export interface KeyMappingConfig {
  top_pause: string;   // Default: "ESCAPE"
  moba_skill1: string; // Default: "Q"
  moba_skill2: string; // Default: "L" or "W"
  moba_ult: string;    // Default: "R"
  moba_dash: string;   // Default: "SHIFT"
  moba_attack: string; // Default: "SPACE"
  wasd_w: string;      // Default: "W"
  wasd_a: string;      // Default: "A"
  wasd_s: string;      // Default: "S"
  wasd_d: string;      // Default: "D"
}

export const DEFAULT_KEY_MAPPINGS: KeyMappingConfig = {
  top_pause: "ESCAPE",
  moba_skill1: "Q",
  moba_skill2: "L",
  moba_ult: "R",
  moba_dash: "SHIFT",
  moba_attack: "SPACE",
  wasd_w: "W",
  wasd_a: "A",
  wasd_s: "S",
  wasd_d: "D",
};

/**
 * Format physical browser keyboard event key name to backend key string
 */
export function parseKeyboardEventToKey(e: KeyboardEvent): string {
  const code = e.code;
  const key = e.key;

  if (code === "Space" || key === " ") return "SPACE";
  if (code.startsWith("Shift") || key === "Shift") return "SHIFT";
  if (code.startsWith("Control") || key === "Control") return "CTRL";
  if (code.startsWith("Alt") || key === "Alt") return "ALT";
  if (code === "Enter" || key === "Enter") return "ENTER";
  if (code === "Escape" || key === "Escape") return "ESCAPE";
  if (code === "Tab" || key === "Tab") return "TAB";
  if (code === "Backspace" || key === "Backspace") return "BACKSPACE";
  if (code === "Delete" || key === "Delete") return "DELETE";
  if (code === "ArrowUp") return "UP";
  if (code === "ArrowDown") return "DOWN";
  if (code === "ArrowLeft") return "LEFT";
  if (code === "ArrowRight") return "RIGHT";

  if (code.startsWith("Key") && code.length === 4) {
    return code.substring(3).toUpperCase();
  }

  if (code.startsWith("Digit") && code.length === 6) {
    return code.substring(5);
  }

  if (key.length === 1) {
    return key.toUpperCase();
  }

  return key.toUpperCase();
}
