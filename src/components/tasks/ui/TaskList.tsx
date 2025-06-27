import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import TaskItem from "./TaskItem";
import { Task, TaskFilters } from "../../../store/tasks/types";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  filters: TaskFilters;
  selectedTasks: string[];
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onCreateTask: () => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  loading,
  filters,
  selectedTasks,
  onToggleComplete,
  onEdit,
  onDelete,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onCreateTask,
}) => {
  const hasActiveFilters =
    filters.completed !== undefined ||
    filters.priority ||
    filters.search ||
    filters.assigned_to ||
    filters.category_id;

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-6 h-6 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle size={24} className="text-emerald-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {hasActiveFilters
          ? "No tasks match your filters"
          : "All tasks completed! 🎉"}
      </h3>
      <p className="text-gray-500 mb-4">
        {hasActiveFilters
          ? "Try adjusting your filters to see more tasks"
          : "You're all caught up"}
      </p>
      {!hasActiveFilters && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreateTask}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Create a Task
        </motion.button>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Tasks ({tasks.length})
          </h3>

          {tasks.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={onSelectAll}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Select All
              </button>
              {selectedTasks.length > 0 && (
                <button
                  onClick={onClearSelection}
                  className="text-sm text-gray-600 hover:text-gray-700"
                >
                  Clear Selection
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <LoadingSkeleton />
        ) : tasks.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence>
              {tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggleComplete={onToggleComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleSelect={onToggleSelect}
                  isSelected={selectedTasks.includes(task.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default TaskList;
