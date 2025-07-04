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
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  icons,
}) => {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-sage-green focus:ring-offset-2 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${checked ? "bg-sage-green" : "bg-gray-200"}`}
    >
      <motion.span
        layout
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 flex items-center justify-center ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
        whileHover={!disabled ? { scale: 1.05 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
      >
        {icons && (
          <span className="text-xs text-charcoal-muted">
            {checked ? icons.checked : icons.unchecked}
          </span>
        )}
      </motion.span>
    </button>
  );
};

export default ToggleSwitch;
