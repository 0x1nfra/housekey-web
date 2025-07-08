import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  Tag,
  Repeat,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { TaskData, TaskPriority } from "../../../../../types/tasks";
import {
  getPriorityLabel,
  getPriorityColor,
} from "../../../../../store/tasks/types";

interface TaskFormFieldsProps {
  taskData: TaskData;
  onInputChange: (field: keyof TaskData, value: any) => void;
  availableAssignees: Array<{ name: string; user_id: string }>;
  categories: Array<{ id: string; name: string }>;
  onCreateCategory: () => void;
}

const RECURRENCE_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
] as const;

const priorityOptions = [
  {
    value: TaskPriority.LOW,
    label: getPriorityLabel(TaskPriority.LOW),
    color: getPriorityColor(TaskPriority.LOW),
  },
  {
    value: TaskPriority.MEDIUM,
    label: getPriorityLabel(TaskPriority.MEDIUM),
    color: getPriorityColor(TaskPriority.MEDIUM),
  },
  {
    value: TaskPriority.HIGH,
    label: getPriorityLabel(TaskPriority.HIGH),
    color: getPriorityColor(TaskPriority.HIGH),
  },
  {
    value: TaskPriority.URGENT,
    label: getPriorityLabel(TaskPriority.URGENT),
    color: getPriorityColor(TaskPriority.URGENT),
  },
];

export const TaskFormFields: React.FC<TaskFormFieldsProps> = ({
  taskData,
  onInputChange,
  availableAssignees,
  categories,
  onCreateCategory,
}) => {
  const [isAdditionalInfoExpanded, setIsAdditionalInfoExpanded] =
    useState(false);

  return (
    <div className="space-y-4">
      {/* Task Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Task Name
        </label>
        <input
          type="text"
          value={taskData.title}
          onChange={(e) => onInputChange("title", e.target.value)}
          className="w-full h-11 border border-gray-200 rounded-lg px-4 text-sm bg-warm-off-white focus:ring-2 focus:ring-sage-green-light focus:border-sage-green-light"
          placeholder="What needs to be done?"
          required
        />
      </div>

      {/* Assignment and Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assign to
          </label>
          <div className="relative">
            <Users
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <select
              value={taskData.assignedTo}
              onChange={(e) => onInputChange("assignedTo", e.target.value)}
              className="w-full h-11 border border-gray-200 rounded-lg px-4 pl-10 text-sm bg-warm-off-white focus:ring-2 focus:ring-sage-green-light focus:border-sage-green-light"
            >
              <option value="">Anyone</option>
              {availableAssignees.map((assignee) => (
                <option key={assignee.user_id} value={assignee.user_id}>
                  {assignee.name.split(" ")[0]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            value={taskData.priority}
            onChange={(e) => onInputChange("priority", Number(e.target.value))}
            className="w-full h-11 border border-gray-200 rounded-lg px-4 text-sm bg-warm-off-white focus:ring-2 focus:ring-sage-green-light focus:border-sage-green-light"
          >
            {priorityOptions.map((priority) => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Due Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Due Date
        </label>
        <div className="relative">
          <Calendar
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="date"
            value={taskData.dueDate}
            onChange={(e) => onInputChange("dueDate", e.target.value)}
            className="w-full h-11 border border-gray-200 rounded-lg px-4 pl-10 text-sm bg-warm-off-white focus:ring-2 focus:ring-sage-green-light focus:border-sage-green-light"
          />
        </div>
      </div>

      {/* Collapsible Additional Info Section */}
      <div className="border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={() => setIsAdditionalInfoExpanded(!isAdditionalInfoExpanded)}
          className="w-full flex items-center justify-between py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
        >
          <span>Additional Info</span>
          <motion.div
            animate={{ rotate: isAdditionalInfoExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={16} />
          </motion.div>
        </button>

        <AnimatePresence>
          {isAdditionalInfoExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-4 pt-4">
                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={taskData.description}
                    onChange={(e) =>
                      onInputChange("description", e.target.value)
                    }
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm bg-warm-off-white focus:ring-2 focus:ring-sage-green-light focus:border-sage-green-light resize-none"
                    placeholder="Additional details about the task..."
                  />
                </div>

                {/* Category and Recurring */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <div className="relative">
                      <Tag
                        size={18}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <select
                        value={taskData.category}
                        onChange={(e) => {
                          if (e.target.value === "__create_new__") {
                            onCreateCategory();
                            onInputChange("category", "");
                          } else {
                            onInputChange("category", e.target.value);
                          }
                        }}
                        className="w-full h-11 border border-gray-200 rounded-lg px-4 pl-10 text-sm bg-warm-off-white focus:ring-2 focus:ring-sage-green-light focus:border-sage-green-light"
                      >
                        <option value="">None</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                        <option value="__create_new__">+ Create New</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recurring
                    </label>
                    <div className="relative">
                      <Repeat
                        size={18}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <select
                        value={
                          taskData.recurring ? taskData.recurrencePattern : ""
                        }
                        onChange={(e) => {
                          const isRecurring = e.target.value !== "";
                          onInputChange("recurring", isRecurring);
                          if (isRecurring) {
                            onInputChange("recurrencePattern", e.target.value);
                          }
                        }}
                        className="w-full h-11 border border-gray-200 rounded-lg px-4 pl-10 text-sm bg-warm-off-white focus:ring-2 focus:ring-sage-green-light focus:border-sage-green-light"
                      >
                        <option value="">No</option>
                        {RECURRENCE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Recurrence Interval */}
                {taskData.recurring && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Repeat every
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max="365"
                        value={taskData.recurrenceInterval}
                        onChange={(e) =>
                          onInputChange(
                            "recurrenceInterval",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-20 h-11 border border-gray-200 rounded-lg px-3 text-sm text-center bg-warm-off-white focus:ring-2 focus:ring-sage-green-light focus:border-sage-green-light"
                      />
                      <span className="text-sm text-gray-600">
                        {taskData.recurrencePattern}(s)
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
