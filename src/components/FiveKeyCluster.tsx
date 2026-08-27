import React from "react";
import { KeyButton } from "./KeyButton";
import { KeyMappingConfig, DEFAULT_KEY_MAPPINGS } from "../types/mappings";

interface FiveKeyClusterProps {
  showTitle?: boolean;
  title?: string;
  mappings?: Partial<KeyMappingConfig>;
  isMapping?: boolean;
  rebindingId?: string | null;
  onRequestRebind?: (buttonId: keyof KeyMappingConfig, currentKey: string) => void;
}

export const FiveKeyCluster: React.FC<FiveKeyClusterProps> = ({
  showTitle = false,
  title = "MOBA Controls",
  mappings = {},
  isMapping = false,
  rebindingId = null,
  onRequestRebind,
}) => {
  const currentMappings = { ...DEFAULT_KEY_MAPPINGS, ...mappings };

  return (
    <div className="flex flex-col items-center select-none">
      {showTitle && (
        <span className="text-xs font-bold text-slate-400 mb-1 tracking-wider uppercase">
          {title}
        </span>
      )}

      {/* Circumference-Aligned MOBA Action HUD */}
      <div className="relative w-64 h-56">
        {/* Subtle Arc Guide Ring Background */}
        <div className="absolute top-[52px] left-[67px] w-[156px] h-[156px] rounded-full border border-dashed border-slate-700/40 pointer-events-none" />

        {/* ULT (R) */}
        <div className="absolute top-[33px] left-[162px] z-10">
          <KeyButton
            targetKey={currentMappings.moba_ult}
            size="moba-skill"
            variant="purple"
            isMapping={isMapping}
            isRebinding={rebindingId === "moba_ult"}
            onRebindClick={() => onRequestRebind?.("moba_ult", currentMappings.moba_ult)}
          />
        </div>

        {/* Skill 2 (L/W) */}
        <div className="absolute top-[40px] left-[103px] z-10">
          <KeyButton
            targetKey={currentMappings.moba_skill2}
            size="moba-skill"
            variant="blue"
            isMapping={isMapping}
            isRebinding={rebindingId === "moba_skill2"}
            onRebindClick={() => onRequestRebind?.("moba_skill2", currentMappings.moba_skill2)}
          />
        </div>

        {/* Skill 1 (Q) */}
        <div className="absolute top-[88px] left-[67px] z-10">
          <KeyButton
            targetKey={currentMappings.moba_skill1}
            size="moba-skill"
            variant="cyan"
            isMapping={isMapping}
            isRebinding={rebindingId === "moba_skill1"}
            onRebindClick={() => onRequestRebind?.("moba_skill1", currentMappings.moba_skill1)}
          />
        </div>

        {/* Dash / Sub-skill (Shift) */}
        <div className="absolute top-[149px] left-[87px] z-10">
          <KeyButton
            targetKey={currentMappings.moba_dash}
            label={currentMappings.moba_dash === "SHIFT" ? "Shift" : currentMappings.moba_dash}
            size="moba-sub"
            variant="emerald"
            isMapping={isMapping}
            isRebinding={rebindingId === "moba_dash"}
            onRebindClick={() => onRequestRebind?.("moba_dash", currentMappings.moba_dash)}
          />
        </div>

        {/* Primary Attack (SPACE) */}
        <div className="absolute top-[95px] left-[126px] z-10">
          <KeyButton
            targetKey={currentMappings.moba_attack}
            label={currentMappings.moba_attack === "SPACE" ? "ATK" : currentMappings.moba_attack}
            size="moba-main"
            variant="amber"
            isMapping={isMapping}
            isRebinding={rebindingId === "moba_attack"}
            onRebindClick={() => onRequestRebind?.("moba_attack", currentMappings.moba_attack)}
          />
        </div>
      </div>
    </div>
  );
};
