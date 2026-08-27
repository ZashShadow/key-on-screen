import React from "react";
import { KeyButton } from "./KeyButton";
import { KeyMappingConfig, DEFAULT_KEY_MAPPINGS } from "../types/mappings";

interface WasdControlsProps {
  showTitle?: boolean;
  title?: string;
  mappings?: Partial<KeyMappingConfig>;
  isMapping?: boolean;
  rebindingId?: string | null;
  onKeyChange?: (key: string, pressed: boolean) => void;
  onRequestRebind?: (buttonId: keyof KeyMappingConfig, currentKey: string) => void;
}

export const WasdControls: React.FC<WasdControlsProps> = ({
  showTitle = true,
  title = "WASD Keys",
  mappings = {},
  isMapping = false,
  rebindingId = null,
  onKeyChange,
  onRequestRebind,
}) => {
  const currentMappings = { ...DEFAULT_KEY_MAPPINGS, ...mappings };

  return (
    <div className="flex flex-col items-center select-none">
      {showTitle && (
        <span className="text-xs font-semibold text-slate-400 mb-2 tracking-wider uppercase">
          {title}
        </span>
      )}
      <div className="flex flex-col items-center gap-1.5">
        <KeyButton
          targetKey={currentMappings.wasd_w}
          variant="red"
          isMapping={isMapping}
          isRebinding={rebindingId === "wasd_w"}
          onPress={() => onKeyChange?.(currentMappings.wasd_w, true)}
          onRelease={() => onKeyChange?.(currentMappings.wasd_w, false)}
          onRebindClick={() => onRequestRebind?.("wasd_w", currentMappings.wasd_w)}
        />
        <div className="flex gap-1.5">
          {[
            { id: "wasd_a" as const, key: currentMappings.wasd_a },
            { id: "wasd_s" as const, key: currentMappings.wasd_s },
            { id: "wasd_d" as const, key: currentMappings.wasd_d },
          ].map(({ id, key }) => (
            <KeyButton
              key={id}
              targetKey={key}
              variant="red"
              isMapping={isMapping}
              isRebinding={rebindingId === id}
              onPress={() => onKeyChange?.(key, true)}
              onRelease={() => onKeyChange?.(key, false)}
              onRebindClick={() => onRequestRebind?.(id, key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
