import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface ErrorDisplayProps {
  error: string | null;
  onClearError: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onClearError }) => {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-50 border border-red-200 rounded-lg p-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-red-700">{error}</p>
        <button
          onClick={onClearError}
          className="text-red-500 hover:text-red-700"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default ErrorDisplay;
