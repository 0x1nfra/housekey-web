import React from "react";
import { motion } from "framer-motion";
import TasksView from "../components/tasks/TasksView";
import { CheckSquare } from "lucide-react";

const TasksPage: React.FC = () => {
  return (
    <div className="px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-sage-green-light rounded-xl flex items-center justify-center">
            <CheckSquare size={24} className="text-deep-charcoal" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-gray-100">
            Tasks
          </h1>
          <p className="text-gray-600 dark:text-gray-500">
            Manage household chores and responsibilities together
          </p>
        </div>

        <TasksView />
      </motion.div>
    </div>
  );
};

export default TasksPage;
