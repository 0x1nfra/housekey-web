"use client";

import type React from "react";
import { motion } from "framer-motion";

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  icons?: {
    checked?: React.ReactNode;
    unchecked?: React.ReactNode;
  };
  size?: "sm" | "md" | "lg";
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  icons,
  size = "md",
}) => {
  const sizeClasses = {
    sm: {
      container: "w-10 h-6",
      thumb: "w-4 h-4",
      translate: "translate-x-4",
    },
    md: {
      container: "w-12 h-7",
      thumb: "w-5 h-5",
      translate: "translate-x-5",
    },
    lg: {
      container: "w-14 h-8",
      thumb: "w-6 h-6",
      translate: "translate-x-6",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        relative inline-flex items-center ${currentSize.container} rounded-full
        transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 
        focus:ring-sage-green focus:ring-offset-2 min-h-[44px] min-w-[44px]
        ${checked ? "bg-sage-green" : "bg-gray-200"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
      aria-checked={checked}
      role="switch"
    >
      <motion.div
        className={`
          ${currentSize.thumb} bg-white rounded-full shadow-md flex items-center justify-center
          transform transition-transform duration-300 ease-in-out
        `}
        animate={{
          x: checked ? currentSize.translate.replace("translate-x-", "") : "0",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {icons && (
          <div className="text-charcoal-muted">
            {checked ? icons.checked : icons.unchecked}
          </div>
        )}
      </motion.div>
    </button>
  );
};

export default ToggleSwitch;
