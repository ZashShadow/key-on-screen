import React from "react";
import { KeyButton } from "./KeyButton";

interface WasdControlsProps {
  showTitle?: boolean;
  title?: string;
  onKeyChange?: (key: string, pressed: boolean) => void;
}

export const WasdControls: React.FC<WasdControlsProps> = ({
  showTitle = true,
  title = "WASD Keys",
  onKeyChange,
}) => {
  return (
    <div className="flex flex-col items-center select-none">
      {showTitle && (
        <span className="text-xs font-semibold text-slate-400 mb-2 tracking-wider uppercase">
          {title}
        </span>
      )}
      <div className="flex flex-col items-center gap-1.5">
        <KeyButton
          targetKey="W"
          variant="red"
          onPress={() => onKeyChange?.("W", true)}
          onRelease={() => onKeyChange?.("W", false)}
        />
        <div className="flex gap-1.5">
          {["A", "S", "D"].map((key) => (
            <KeyButton
              key={key}
              targetKey={key}
              variant="red"
              onPress={() => onKeyChange?.(key, true)}
              onRelease={() => onKeyChange?.(key, false)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
