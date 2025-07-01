import React from "react";
import { motion } from "framer-motion";

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  disabled?: boolean;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  value,
  onChange,
  options,
  disabled = false,
}) => {
  return (
    <div className="space-y-3 py-3">
      {options.map((option) => (
        <motion.div
          key={option.value}
          whileHover={{ scale: disabled ? 1 : 1.01 }}
          whileTap={{ scale: disabled ? 1 : 0.99 }}
          className={`relative flex items-start p-3 rounded-lg border ${
            value === option.value
              ? "border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-900/30"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          onClick={() => !disabled && onChange(option.value)}
        >
          <div className="flex items-center h-5">
            <input
              id={`${name}-${option.value}`}
              name={name}
              type="radio"
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
              disabled={disabled}
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              htmlFor={`${name}-${option.value}`}
              className={`font-medium ${
                value === option.value 
                  ? "text-indigo-900 dark:text-indigo-300" 
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {option.label}
            </label>
            {option.description && (
              <p
                className={`${
                  value === option.value 
                    ? "text-indigo-700 dark:text-indigo-400" 
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {option.description}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default RadioGroup;