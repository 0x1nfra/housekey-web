import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Calendar,
  User,
  Trash2,
  Edit3,
} from "lucide-react";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  getPriorityBorderColor,
  getPriorityColor,
  getPriorityLabel,
  Task,
} from "../../../store/tasks/types";

dayjs.extend(relativeTime);

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleSelect: (id: string) => void;
  isSelected: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onToggleSelect,
  isSelected,
}) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusIcon = (completed: boolean) => {
    return completed ? CheckCircle : Clock;
  };

  const getStatusColor = (completed: boolean) => {
    return completed
      ? "text-emerald-600 bg-emerald-50"
      : "text-amber-600 bg-amber-50";
  };

  const isOverdue =
    task.due_date && !task.completed && new Date(task.due_date) < new Date();
  const StatusIcon = getStatusIcon(task.completed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-4 border-l-4 rounded-lg transition-all hover:shadow-md ${getPriorityBorderColor(
        task.priority
      )} ${isSelected ? "ring-2 ring-indigo-500" : ""}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          {/* Selection Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(task.id)}
            className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />

          {/* Status Icon */}
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusColor(
              task.completed
            )}`}
          >
            <StatusIcon size={16} />
          </div>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h4
                className={`font-medium ${
                  task.completed
                    ? "line-through text-gray-500"
                    : "text-gray-900"
                }`}
              >
                {task.title}
              </h4>

              {/* Priority Badge */}
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                  task.priority
                )}`}
              >
                {getPriorityLabel(task.priority)}
              </span>

              {/* Overdue Badge */}
              {isOverdue && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                  Overdue
                </span>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
            )}

            {/* Task Meta */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {task.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{dayjs(task.due_date).format("MMM DD, YYYY")}</span>
                </div>
              )}

              {task.assigned_to_email && (
                <div className="flex items-center gap-1">
                  <User size={14} />
                  <span>{task.assigned_to_email}</span>
                </div>
              )}

              <span>Created {dayjs(task.created_at).fromNow()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onToggleComplete(task.id)}
                className={`p-2 rounded-lg transition-colors ${
                  task.completed
                    ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
                    : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                }`}
                title={
                  task.completed ? "Mark as incomplete" : "Mark as complete"
                }
              >
                <CheckCircle size={16} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit(task)}
                className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                title="Edit task"
              >
                <Edit3 size={16} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(task.id)}
                className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                title="Delete task"
              >
                <Trash2 size={16} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TaskItem;
