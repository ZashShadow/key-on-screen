import React from "react";
import { KeyButton } from "./KeyButton";

interface FiveKeyClusterProps {
  showTitle?: boolean;
  title?: string;
}

export const FiveKeyCluster: React.FC<FiveKeyClusterProps> = ({
  showTitle = true,
  title = "MOBA Controls",
}) => {
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

        {/* ULT (R) - Angle 285° (Top of Attack circumference) */}
        <div className="absolute top-[33px] left-[162px] z-10">
          <KeyButton targetKey="R" size="moba-skill" variant="purple" />
        </div>

        {/* Skill 2 (W) - Angle 240° (Top-Left shoulder circumference) */}
        <div className="absolute top-[40px] left-[103px] z-10">
          <KeyButton targetKey="L" size="moba-skill" variant="blue" />
        </div>

        {/* Skill 1 (Q) - Angle 195° (Left shoulder circumference) */}
        <div className="absolute top-[88px] left-[67px] z-10">
          <KeyButton targetKey="Q" size="moba-skill" variant="cyan" />
        </div>

        {/* Dash / Sub-skill (Shift) - Angle 150° (Bottom-Left circumference) */}
        <div className="absolute top-[149px] left-[87px] z-10">
          <KeyButton
            targetKey="SHIFT"
            label="Shift"
            size="moba-sub"
            variant="emerald"
          />
        </div>

        {/* Primary Attack (SPACE) - Focal Center (Bottom Right) */}
        <div className="absolute top-[95px] left-[126px] z-10">
          <KeyButton
            targetKey="SPACE"
            label="ATK"
            size="moba-main"
            variant="amber"
          />
        </div>
      </div>
    </div>
  );
};
