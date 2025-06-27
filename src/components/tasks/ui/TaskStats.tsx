import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

interface TaskStatsProps {
  taskStats: {
    total: number;
    pending: number;
    completed: number;
  };
  overdueCount: number;
}

const TaskStats: React.FC<TaskStatsProps> = ({ taskStats, overdueCount }) => {
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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}
            >
              <stat.icon size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default TaskStats;
