import React from "react";
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
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
        checked ? "bg-indigo-600" : "bg-gray-200 dark:bg-gray-700"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      <span className="sr-only">{checked ? "Enable" : "Disable"}</span>
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`${
          checked ? "translate-x-6" : "translate-x-1"
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      >
        {checked && icons?.checked && (
          <span className="absolute inset-0 flex items-center justify-center text-indigo-600">
            {icons.checked}
          </span>
        )}
        {!checked && icons?.unchecked && (
          <span className="absolute inset-0 flex items-center justify-center text-gray-400">
            {icons.unchecked}
          </span>
        )}
      </motion.span>
    </motion.button>
  );
};

export default ToggleSwitch;