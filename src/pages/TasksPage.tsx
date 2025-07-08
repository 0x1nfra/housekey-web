"use client";

import type React from "react";
import { motion } from "framer-motion";
import TasksView from "../components/tasks/TasksView";
import { CheckSquare } from "lucide-react";

const TasksPage: React.FC = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6 sm:space-y-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sage-green-light rounded-xl flex items-center justify-center">
              <CheckSquare size={20} className="sm:size-6 text-deep-charcoal" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                Tasks
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-500">
                Manage household chores and responsibilities together
              </p>
            </div>
          </div>
        </div>

        <TasksView />
      </motion.div>
    </div>
  );
};

export default TasksPage;
