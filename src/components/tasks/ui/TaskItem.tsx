import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Edit3,
  Trash2,
  Calendar,
  User,
  Repeat,
  Tag,
} from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  getPriorityColor,
  getPriorityLabel,
  Task,
  getRecurrenceLabel,
} from "../../../store/tasks/types";

dayjs.extend(relativeTime);

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false);
  const isOverdue =
    task.due_date && !task.completed && new Date(task.due_date) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onToggleComplete(task.id)}
        className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
          ${
            task.completed
              ? "bg-emerald-500 border-emerald-500"
              : "border-gray-300 dark:border-gray-600 hover:border-emerald-500"
          }
        `}
      >
        <motion.div
          initial={false}
          animate={{
            scale: task.completed ? 1 : 0,
            opacity: task.completed ? 1 : 0,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Check
            size={14}
            className={task.completed ? "text-white" : "text-transparent"}
          />
        </motion.div>
      </motion.button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <span
            className={`font-medium ${
              task.completed
                ? "line-through text-gray-500 dark:text-gray-400"
                : "text-gray-900 dark:text-white"
            }`}
          >
            {task.title}
          </span>

          <span
            className={`px-2 py-1 text-xs rounded-full font-medium ${getPriorityColor(
              task.priority
            )}`}
          >
            {getPriorityLabel(task.priority)}
          </span>

          {task.category_name && (
            <span
              className="px-2 py-1 text-xs rounded-full font-medium text-white flex items-center gap-1"
              style={{ backgroundColor: task.category_color || "#3B82F6" }}
            >
              <Tag size={12} />
              {task.category_name}
            </span>
          )}

          {task.is_recurring && (
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium flex items-center gap-1">
              <Repeat size={12} />
              {task.recurrence_pattern &&
                getRecurrenceLabel(task.recurrence_pattern)}
            </span>
          )}

          {isOverdue && (
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-400 text-xs rounded-full font-medium">
              Overdue
            </span>
          )}
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
          {task.due_date && (
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{dayjs(task.due_date).format("MMM DD, YYYY")}</span>
            </div>
          )}

          {task.assigned_to_name && (
            <div className="flex items-center gap-1">
              <User size={14} />
              <span>Assigned to {task.assigned_to_name}</span>
            </div>
          )}

          <span>•</span>
          <span>Created {dayjs(task.created_at).fromNow()}</span>
        </div>
      </div>

      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEdit(task)}
              className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              title="Edit task"
            >
              <Edit3 size={16} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete(task.id)}
              className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-all"
              title="Delete task"
            >
              <Trash2 size={16} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TaskItem;
