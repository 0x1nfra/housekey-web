"use client";

import type React from "react";
import { motion } from "framer-motion";
import { Search, Plus } from "lucide-react";
import type { TaskFilters } from "../../../store/tasks/types";
import { TaskPriority } from "../../../types/tasks";

interface TaskFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: TaskFilters;
  onFilterChange: (filters: Partial<TaskFilters>) => void;
  onClearFilters: () => void;
  onCreateTask: () => void;
}

const TaskFiltersComponent: React.FC<TaskFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
  onClearFilters,
  onCreateTask,
}) => {
  const hasActiveFilters =
    filters.completed !== undefined || filters.priority || filters.search;

  return (
    <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-muted"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-field pl-10"
            placeholder="Search tasks..."
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={filters.completed?.toString() || ""}
            onChange={(e) =>
              onFilterChange({
                completed:
                  e.target.value === "" ? undefined : e.target.value === "true",
              })
            }
            className="input-field text-sm py-2"
          >
            <option value="">All Tasks</option>
            <option value="false">Pending</option>
            <option value="true">Completed</option>
          </select>

          <select
            value={filters.priority?.toString() || ""}
            onChange={(e) => {
              const value = e.target.value;
              const numValue = value ? Number(value) : undefined;
              const validPriorities = [
                TaskPriority.LOW,
                TaskPriority.MEDIUM,
                TaskPriority.HIGH,
                TaskPriority.URGENT,
              ];
              const priority =
                numValue !== undefined && validPriorities.includes(numValue)
                  ? (numValue as TaskPriority)
                  : undefined;
              onFilterChange({
                priority,
              });
            }}
            className="input-field text-sm py-2"
          >
            <option value="">All Priorities</option>
            <option value={TaskPriority.URGENT}>Urgent Priority</option>
            <option value={TaskPriority.HIGH}>High Priority</option>
            <option value={TaskPriority.MEDIUM}>Medium Priority</option>
            <option value={TaskPriority.LOW}>Low Priority</option>
          </select>

          {hasActiveFilters && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClearFilters}
              className="btn-ghost text-sm"
            >
              Clear Filters
            </motion.button>
          )}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCreateTask}
        className="btn-primary flex items-center gap-2"
      >
        <Plus size={16} />
        New Task
      </motion.button>
    </div>
  );
};

export default TaskFiltersComponent;
