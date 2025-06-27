import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Edit3, Trash2, Calendar, User } from "lucide-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
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
  //   onToggleSelect,
  //   isSelected,
}) => {
  const [showActions, setShowActions] = useState(false);
  const isOverdue =
    task.due_date && !task.completed && new Date(task.due_date) < new Date();

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
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
        : "border-gray-300 hover:border-emerald-500"
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
        <div className="flex items-center gap-3 mb-1">
          <span
            className={`font-medium ${
              task.completed ? "line-through text-gray-500" : "text-gray-900"
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

          {isOverdue && (
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
              Overdue
            </span>
          )}
        </div>

        {task.description && (
          <p className="text-sm text-gray-600 mb-1">{task.description}</p>
        )}

        <div className="flex items-center gap-3 text-sm text-gray-500">
          {task.due_date && (
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{dayjs(task.due_date).format("MMM DD, YYYY")}</span>
            </div>
          )}

          {task.assigned_to && (
            <div className="flex items-center gap-1">
              <User size={14} />
              <span>{task.assigned_to_email}</span>
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
              className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
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
