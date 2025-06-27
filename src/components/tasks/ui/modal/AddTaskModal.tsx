"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
  Clock,
  Tag,
  Repeat,
  Plus,
} from "lucide-react";
import {
  getPriorityLabel,
  getPriorityColor,
} from "../../../../store/tasks/types";
import { useHubStore } from "../../../../store/hubStore";
import { useAuthStore } from "../../../../store/authStore";
import { useTasksStore } from "../../../../store/tasks";
import { shallow } from "zustand/shallow";
import { TaskPriority } from "../../../../types/tasks";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreate: (taskData: any) => void;
}

const TASK_CATEGORIES = [
  "Cleaning",
  "Cooking",
  "Pet Care",
  "Yard Work",
  "Shopping",
  "Maintenance",
  "Organization",
  "Other",
] as const;

const DURATION_OPTIONS = [
  { value: "", label: "Any" },
  { value: "15min", label: "15 min" },
  { value: "30min", label: "30 min" },
  { value: "1hour", label: "1 hour" },
  { value: "2hours", label: "2 hours" },
  { value: "halfday", label: "Half day" },
  { value: "fullday", label: "Full day" },
] as const;

const RECURRENCE_OPTIONS = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
] as const;

const INITIAL_TASK_DATA = {
  title: "",
  description: "",
  assignedTo: "",
  dueDate: "",
  priority: TaskPriority.MEDIUM,
  category: "",
  recurring: false,
  recurrencePattern: "weekly" as const,
  recurrenceInterval: 1,
  estimatedTime: "",
  notes: "",
};

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onTaskCreate,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [taskData, setTaskData] = useState(INITIAL_TASK_DATA);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", color: "#3B82F6" });

  const { hubMembers } = useHubStore();
  const { profile } = useAuthStore(
    (state) => ({
      profile: state.profile,
    }),
    shallow
  );

  const { categories, fetchCategories, createCategory } = useTasksStore(
    (state) => ({
      categories: state.categories,
      fetchCategories: state.fetchCategories,
      createCategory: state.createCategory,
    }),
    shallow
  );

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, fetchCategories]);

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

  // Get available assignees (hub members + current user)
  const availableAssignees = [
    ...(profile ? [{ email: profile.email, name: profile.name }] : []),
    ...hubMembers
      .filter((member) => member.user_profile?.email !== profile?.email)
      .map((member) => ({
        email: member.user_profile?.email || "",
        name: member.user_profile?.name || "Unknown User",
      })),
  ].filter((assignee) => assignee.email);

  const handleInputChange = (field: string, value: any) => {
    setTaskData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) return;

    try {
      await createCategory(newCategory);
      setNewCategory({ name: "", color: "#3B82F6" });
      setShowCategoryForm(false);
      await fetchCategories();
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const resetForm = () => {
    setTaskData(INITIAL_TASK_DATA);
    setShowAdvanced(false);
    setShowCategoryForm(false);
    setNewCategory({ name: "", color: "#3B82F6" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTaskCreate(taskData);
    resetForm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Plus size={16} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">New Task</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Essential Fields */}

              {/* Task Title */}
              <div>
                <input
                  type="text"
                  value={taskData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full border-0 border-b-2 border-gray-200 px-0 py-3 text-lg font-medium placeholder-gray-400 focus:border-gray-900 focus:ring-0 transition-colors bg-transparent"
                  placeholder="What needs to be done?"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <textarea
                  value={taskData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm placeholder-gray-400 focus:border-gray-400 focus:ring-0 transition-colors resize-none"
                  placeholder="Description (optional)"
                />
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">
                  Priority
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {priorityOptions.map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() =>
                        handleInputChange("priority", priority.value)
                      }
                      className={`p-2 border rounded-lg transition-all text-center ${
                        taskData.priority === priority.value
                          ? "border-gray-900 bg-gray-50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center mx-auto mb-1 ${priority.color}`}
                      >
                        <span className="text-xs font-bold">!</span>
                      </div>
                      <span className="text-xs font-medium">
                        {priority.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Assign To */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">
                    Assign
                  </label>
                  <div className="relative">
                    <Users
                      size={16}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <select
                      value={taskData.assignedTo}
                      onChange={(e) =>
                        handleInputChange("assignedTo", e.target.value)
                      }
                      className="w-full border border-gray-200 rounded-lg px-2 py-2 pl-7 text-sm focus:border-gray-400 focus:ring-0 transition-colors"
                    >
                      <option value="">Anyone</option>
                      {availableAssignees.map((assignee) => (
                        <option key={assignee.email} value={assignee.email}>
                          {assignee.name.split(" ")[0]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">
                    Category
                  </label>
                  <div className="relative">
                    <Tag
                      size={16}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <select
                      value={taskData.category}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                      className="w-full border border-gray-200 rounded-lg px-2 py-2 pl-7 text-sm focus:border-gray-400 focus:ring-0 transition-colors"
                    >
                      <option value="">None</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                      <option value="__create_new__">+ Create New Category</option>
                    </select>
                  </div>
                  
                  {/* Create Category Form */}
                  {(showCategoryForm || taskData.category === "__create_new__") && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 p-3 border border-gray-200 rounded-lg bg-gray-50"
                    >
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Category name"
                          className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                        <input
                          type="color"
                          value={newCategory.color}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                          className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleCreateCategory}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          Create
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCategoryForm(false);
                            setTaskData(prev => ({ ...prev, category: "" }));
                          }}
                          className="px-3 py-1 text-gray-600 text-xs rounded hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Advanced Options Toggle */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span>Advanced Options</span>
                {showAdvanced ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>

              {/* Advanced Options */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 border-t border-gray-100 pt-4"
                  >
                    {/* Due date and Estimated Time */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Due Date */}
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">
                          Due
                        </label>
                        <div className="relative">
                          <Calendar
                            size={16}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                          />
                          <input
                            type="date"
                            value={taskData.dueDate}
                            onChange={(e) =>
                              handleInputChange("dueDate", e.target.value)
                            }
                            className="w-full border border-gray-200 rounded-lg px-2 py-2 pl-7 text-sm focus:border-gray-400 focus:ring-0 transition-colors"
                          />
                        </div>
                      </div>
                      {/* Duration */}
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">
                          Duration
                        </label>
                        <div className="relative">
                          <Clock
                            size={16}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                          />
                          <select
                            value={taskData.estimatedTime}
                            onChange={(e) =>
                              handleInputChange("estimatedTime", e.target.value)
                            }
                            className="w-full border border-gray-200 rounded-lg px-2 py-2 pl-7 text-sm focus:border-gray-400 focus:ring-0 transition-colors"
                          >
                            {DURATION_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Recurring Task */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <Repeat size={16} className="text-gray-500" />
                        <input
                          type="checkbox"
                          id="recurring"
                          checked={taskData.recurring}
                          onChange={(e) =>
                            handleInputChange("recurring", e.target.checked)
                          }
                          className="w-4 h-4 text-gray-600 border-gray-300 rounded focus:ring-gray-500"
                        />
                        <label
                          htmlFor="recurring"
                          className="text-sm font-medium text-gray-700"
                        >
                          Recurring task
                        </label>
                      </div>

                      {taskData.recurring && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3"
                        >
                          <div className="grid grid-cols-2 gap-3">
                            <select
                              value={taskData.recurrencePattern}
                              onChange={(e) =>
                                handleInputChange(
                                  "recurrencePattern",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-gray-400 focus:ring-0 transition-colors"
                            >
                              {RECURRENCE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">
                                Every
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={taskData.recurrenceInterval}
                                onChange={(e) =>
                                  handleInputChange("recurrenceInterval", parseInt(e.target.value) || 1)
                                }
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-gray-400 focus:ring-0 transition-colors"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer */}
              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!taskData.title}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Task
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddTaskModal;