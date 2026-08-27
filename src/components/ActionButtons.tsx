import React from "react";
import { KeyButton } from "./KeyButton";

interface ActionButtonsProps {
  showTitle?: boolean;
  title?: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  showTitle = true,
  title = "Action Keys",
}) => {
  return (
    <div className="flex flex-col items-center select-none">
      {showTitle && (
        <span className="text-xs font-semibold text-slate-400 mb-2 tracking-wider uppercase">
          {title}
        </span>
      )}

      {/* Diamond Action Cluster composed of individual KeyButtons mapped via targetKey */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex flex-col items-center gap-1.5">
          {/* Top key: E */}
          <KeyButton targetKey="E" variant="amber" />
          <div className="flex gap-1.5">
            {/* Left key: Q */}
            <KeyButton targetKey="Q" variant="blue" />
            {/* Center key: R */}
            <KeyButton targetKey="R" variant="emerald" />
            {/* Right key: F */}
            <KeyButton targetKey="F" variant="purple" />
          </div>
        </div>

        {/* Space & Shift KeyButtons */}
        <div className="flex gap-2">
          <KeyButton
            targetKey="SPACE"
            label="Space"
            size="wide"
            variant="blue"
          />
          <KeyButton
            targetKey="SHIFT"
            label="Shift"
            size="md"
            variant="slate"
          />
        </div>
      </div>
    </div>
  );
};
