import type React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, List } from "lucide-react";
import { type QuickStats } from "./hooks/useShoppingData";

interface ShoppingQuickStatsProps {
  quickStats: QuickStats | null;
}

const ShoppingQuickStats: React.FC<ShoppingQuickStatsProps> = ({
  quickStats,
}) => {
  if (!quickStats) return null;

  const stats = [
    {
      label: "Total Items",
      value: quickStats.totalItems,
      color: "text-blue-500",
      icon: List,
    },
    {
      label: "Pending",
      value: quickStats.pendingItems,
      color: "text-amber-500",
      icon: Clock,
    },
    {
      label: "Completed",
      value: quickStats.completedItems,
      color: "text-emerald-500",
      icon: CheckCircle,
    },
  ];

  return (
    <div className="card-content">
      <h3 className="font-semibold text-deep-charcoal mb-4 font-interface text-lg">
        Quick Stats
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-sm mb-2 font-interface">
          <span className="text-charcoal-muted">Progress</span>
          <span className="text-deep-charcoal font-medium">
            {quickStats.completedItems} of {quickStats.totalItems} items
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-sage-green h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${quickStats.completionPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
};

export default ShoppingQuickStats;
