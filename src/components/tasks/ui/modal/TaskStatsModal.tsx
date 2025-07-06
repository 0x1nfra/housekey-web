import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface TaskStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskStats: {
    total: number;
    pending: number;
    completed: number;
  };
  overdueCount: number;
}

const TaskStatsModal: React.FC<TaskStatsModalProps> = ({
  isOpen,
  onClose,
  taskStats,
  overdueCount,
}) => {
  const stats = [
    {
      label: "Total Tasks",
      value: taskStats.total,
      color: "text-blue-500",
      icon: CheckCircle,
    },
    {
      label: "Pending",
      value: taskStats.pending,
      color: "text-amber-500",
      icon: Clock,
    },
    {
      label: "Completed",
      value: taskStats.completed,
      color: "text-emerald-500",
      icon: CheckCircle,
    },
    {
      label: "Overdue",
      value: overdueCount,
      color: "text-red-500",
      icon: AlertCircle,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-lg w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Task Statistics</h3>
                <button onClick={onClose} className="btn-ghost">
                  <X size={20} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-warm-off-white dark:bg-gray-800 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}
                      >
                        <stat.icon size={20} />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stat.value}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskStatsModal;
