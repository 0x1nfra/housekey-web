"use client";

import type React from "react";
import { useState } from "react";
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
  type Task,
  getRecurrenceLabel,
} from "../../../store/tasks/types";

dayjs.extend(relativeTime);

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleSelect?: (id: string) => void;
  isSelected?: boolean;
  showSelection?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onToggleSelect,
  isSelected = false,
  showSelection = false,
}) => {
  const [showActions, setShowActions] = useState(false);
  const isOverdue =
    task.due_date && !task.completed && new Date(task.due_date) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`flex items-center gap-4 p-4 bg-warm-off-white rounded-lg hover:bg-sage-green-light transition-all duration-300 ease-out group ${
        isSelected ? "ring-2 ring-sage-green bg-sage-green-light" : ""
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Selection Checkbox */}
      {onToggleSelect && showSelection && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onToggleSelect(task.id)}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isSelected
              ? "bg-sage-green border-sage-green text-deep-charcoal"
              : "border-gray-300 hover:border-sage-green"
          }`}
        >
          {isSelected && <Check size={14} />}
        </motion.button>
      )}

      {/* Completion Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onToggleComplete(task.id)}
        className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
          ${
            task.completed
              ? "bg-sage-green border-sage-green"
              : "border-gray-300 hover:border-sage-green"
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
            className={
              task.completed ? "text-deep-charcoal" : "text-transparent"
            }
          />
        </motion.div>
      </motion.button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <span
            className={`font-chivo font-medium ${
              task.completed
                ? "line-through text-charcoal-muted"
                : "text-deep-charcoal"
            }`}
          >
            {task.title}
          </span>

          <span
            className={`px-2 py-1 text-xs rounded-full font-chivo font-medium ${getPriorityColor(
              task.priority
            )}`}
          >
            {getPriorityLabel(task.priority)}
          </span>

          {task.category_name && (
            <span
              className="px-2 py-1 text-xs rounded-full font-chivo font-medium text-white flex items-center gap-1"
              style={{ backgroundColor: task.category_color || "#3B82F6" }}
            >
              <Tag size={12} />
              {task.category_name}
            </span>
          )}

          {task.is_recurring && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-chivo font-medium flex items-center gap-1">
              <Repeat size={12} />
              {task.recurrence_pattern &&
                getRecurrenceLabel(task.recurrence_pattern)}
            </span>
          )}

          {isOverdue && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-chivo font-medium">
              Overdue
            </span>
          )}
        </div>

        {task.description && (
          <p className="text-sm text-charcoal-muted mb-1 font-lora">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-sm text-charcoal-muted flex-wrap">
          {task.due_date && (
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span className="font-chivo">
                {dayjs(task.due_date).format("MMM DD, YYYY")}
              </span>
            </div>
          )}

          {task.assigned_to_name && (
            <div className="flex items-center gap-1">
              <User size={14} />
              <span className="font-chivo">
                Assigned to {task.assigned_to_name}
              </span>
            </div>
          )}

          <span>•</span>
          <span className="font-chivo">
            Created {dayjs(task.created_at).fromNow()}
          </span>
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
              className="opacity-0 group-hover:opacity-100 p-2 text-charcoal-muted hover:text-deep-charcoal hover:bg-sage-green-light rounded-lg transition-all"
              title="Edit task"
            >
              <Edit3 size={16} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDelete(task.id)}
              className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
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
