import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import ShoppingQuickStats from "../ShoppingQuickStats";
import { type QuickStats } from "../hooks/useShoppingData";

interface QuickStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quickStats: QuickStats | null;
}

const QuickStatsModal: React.FC<QuickStatsModalProps> = ({
  isOpen,
  onClose,
  quickStats,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 font-interface">
                Shopping Stats
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Stats Content */}
            <ShoppingQuickStats quickStats={quickStats} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickStatsModal;
