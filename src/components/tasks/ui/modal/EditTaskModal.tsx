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
  Check,
} from "lucide-react";
import {
  type Task,
  getPriorityLabel,
  getPriorityColor,
} from "../../../../store/tasks/types";
import { useHubStore } from "../../../../store/hubStore";
import { useAuthStore } from "../../../../store/authStore";
import { useTasksStore } from "../../../../store/tasks";
import { shallow } from "zustand/shallow";
import { TaskPriority } from "../../../../types/tasks";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  task: Task | null;
}

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

// Custom hook for dark mode detection
const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkDarkMode = () => {
      const htmlElement = document.documentElement;
      const isDarkMode =
        htmlElement.classList.contains("dark") ||
        (window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      setIsDark(isDarkMode);
    };

    checkDarkMode();

    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => checkDarkMode();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return isDark;
};

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  onTaskUpdate,
  task,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: "#3B82F6",
  });
  const [taskData, setTaskData] = useState({
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
  });

  const isDark = useDarkMode();

  const { hubMembers } = useHubStore();
  const { user, profile } = useAuthStore(
    (state) => ({
      user: state.user,
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

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setTaskData({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        dueDate: task.due_date
          ? new Date(task.due_date).toISOString().split("T")[0]
          : "",
        assignedTo: task.assigned_to || "",
        category: task.category_id || "",
        recurring: task.is_recurring || false,
        recurrencePattern: task.recurrence_pattern || "weekly",
        recurrenceInterval: task.recurrence_interval || 1,
        estimatedTime: "", // This would need to be added to the task schema
      });
    }
  }, [task]);

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
    ...(profile ? [{ name: profile.name, user_id: profile.id }] : []),
    ...hubMembers
      .filter((member) => member.user_profile?.name !== profile?.name)
      .map((member) => ({
        name: member.user_profile?.name || "Unknown User",
        user_id: member.user_id,
      })),
  ].filter((assignee) => assignee.name);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !taskData.title.trim()) return;

    // Validate recurrence settings
    if (
      taskData.recurring &&
      (!taskData.recurrenceInterval || taskData.recurrenceInterval < 1)
    ) {
      // TODO: Show error message
      return;
    }

    const updates: Partial<Task> = {
      title: taskData.title.trim(),
      description: taskData.description.trim() || undefined,
      priority: taskData.priority,
      due_date: taskData.dueDate
        ? new Date(taskData.dueDate).toISOString()
        : undefined,
      category_id: taskData.category || undefined,
      is_recurring: taskData.recurring,
      recurrence_pattern: taskData.recurring
        ? taskData.recurrencePattern
        : undefined,
      recurrence_interval: taskData.recurring
        ? taskData.recurrenceInterval
        : undefined,
    };

    // Handle assignment
    if (taskData.assignedTo) {
      updates.assigned_to = taskData.assignedTo;
    } else {
      updates.assigned_to = undefined;
    }

    onTaskUpdate(task.id, updates);
  };

  if (!task) return null;

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
            className={`${
              isDark ? "bg-gray-900 border border-gray-700" : "bg-white"
            } rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 ${
                    isDark ? "bg-blue-900/50" : "bg-blue-100"
                  } rounded-lg flex items-center justify-center`}
                >
                  <Check
                    size={16}
                    className={isDark ? "text-blue-400" : "text-blue-600"}
                  />
                </div>
                <h2
                  className={`text-xl font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Edit Task
                </h2>
              </div>
              <button
                onClick={onClose}
                className={`w-8 h-8 flex items-center justify-center rounded-lg ${
                  isDark
                    ? "hover:bg-gray-800 text-gray-400"
                    : "hover:bg-gray-100 text-gray-500"
                } transition-colors`}
              >
                <X size={18} />
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
                  className={`w-full border-0 border-b-2 ${
                    isDark
                      ? "border-gray-700 focus:border-gray-400 text-white placeholder-gray-500"
                      : "border-gray-200 focus:border-gray-900 text-gray-900 placeholder-gray-400"
                  } px-0 py-3 text-lg font-medium focus:ring-0 transition-colors bg-transparent`}
                  placeholder="Task title"
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
                  className={`w-full border ${
                    isDark
                      ? "border-gray-700 focus:border-gray-600 text-white placeholder-gray-500 bg-gray-800/50"
                      : "border-gray-200 focus:border-gray-400 text-gray-900 placeholder-gray-400 bg-white"
                  } rounded-lg px-3 py-2 text-sm focus:ring-0 transition-colors resize-none`}
                  placeholder="Description (optional)"
                />
              </div>

              {/* Priority */}
              <div>
                <label
                  className={`text-xs font-medium ${
                    isDark ? "text-gray-400" : "text-gray-500"
                  } mb-2 block`}
                >
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
                          ? isDark
                            ? "border-gray-500 bg-gray-800 shadow-sm"
                            : "border-gray-900 bg-gray-50 shadow-sm"
                          : isDark
                          ? "border-gray-700 hover:border-gray-600"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center mx-auto mb-1 ${priority.color}`}
                      >
                        <span className="text-xs font-bold">!</span>
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
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
                  <label
                    className={`text-xs font-medium ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    } mb-1 block`}
                  >
                    Assigned to
                  </label>
                  <div className="relative">
                    <Users
                      size={16}
                      className={`absolute left-2 top-1/2 transform -translate-y-1/2 ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                    <select
                      value={taskData.assignedTo}
                      onChange={(e) =>
                        handleInputChange("assignedTo", e.target.value)
                      }
                      className={`w-full border ${
                        isDark
                          ? "border-gray-700 focus:border-gray-600 text-white bg-gray-800"
                          : "border-gray-200 focus:border-gray-400 text-gray-900 bg-white"
                      } rounded-lg px-2 py-2 pl-7 text-sm focus:ring-0 transition-colors`}
                    >
                      <option value="">Unassigned</option>
                      {availableAssignees.map((assignee) => (
                        <option key={assignee.user_id} value={assignee.user_id}>
                          {assignee.name.split(" ")[0]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label
                    className={`text-xs font-medium ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    } mb-1 block`}
                  >
                    Category
                  </label>
                  <div className="relative">
                    <Tag
                      size={16}
                      className={`absolute left-2 top-1/2 transform -translate-y-1/2 ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    />
                    <select
                      value={taskData.category}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                      className={`w-full border ${
                        isDark
                          ? "border-gray-700 focus:border-gray-600 text-white bg-gray-800"
                          : "border-gray-200 focus:border-gray-400 text-gray-900 bg-white"
                      } rounded-lg px-2 py-2 pl-7 text-sm focus:ring-0 transition-colors`}
                    >
                      <option value="">None</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                      <option value="__create_new__">
                        + Create New Category
                      </option>
                    </select>
                  </div>

                  {/* Create Category Form */}
                  {(showCategoryForm ||
                    taskData.category === "__create_new__") && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`mt-2 p-3 border ${
                        isDark
                          ? "border-gray-700 bg-gray-800/50"
                          : "border-gray-200 bg-gray-50"
                      } rounded-lg`}
                    >
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={newCategory.name}
                          onChange={(e) =>
                            setNewCategory((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Category name"
                          className={`flex-1 border ${
                            isDark
                              ? "border-gray-600 bg-gray-800 text-white placeholder-gray-500"
                              : "border-gray-300 bg-white text-gray-900 placeholder-gray-400"
                          } rounded px-2 py-1 text-sm`}
                        />
                        <input
                          type="color"
                          value={newCategory.color}
                          onChange={(e) =>
                            setNewCategory((prev) => ({
                              ...prev,
                              color: e.target.value,
                            }))
                          }
                          className={`w-8 h-8 border ${
                            isDark ? "border-gray-600" : "border-gray-300"
                          } rounded cursor-pointer`}
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
                            setTaskData((prev) => ({
                              ...prev,
                              category: task.category_id || "",
                            }));
                          }}
                          className={`px-3 py-1 ${
                            isDark
                              ? "text-gray-300 hover:bg-gray-700"
                              : "text-gray-600 hover:bg-gray-200"
                          } text-xs rounded`}
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
                className={`w-full flex items-center justify-center gap-2 py-2 text-sm ${
                  isDark
                    ? "text-gray-400 hover:text-gray-200"
                    : "text-gray-600 hover:text-gray-900"
                } transition-colors`}
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
                    className={`space-y-4 border-t ${
                      isDark ? "border-gray-700" : "border-gray-100"
                    } pt-4`}
                  >
                    {/* Due date and Estimated Time */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Due Date */}
                      <div>
                        <label
                          className={`text-xs font-medium ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          } mb-1 block`}
                        >
                          Due date
                        </label>
                        <div className="relative">
                          <Calendar
                            size={16}
                            className={`absolute left-2 top-1/2 transform -translate-y-1/2 ${
                              isDark ? "text-gray-500" : "text-gray-400"
                            }`}
                          />
                          <input
                            type="date"
                            value={taskData.dueDate}
                            onChange={(e) =>
                              handleInputChange("dueDate", e.target.value)
                            }
                            className={`w-full border ${
                              isDark
                                ? "border-gray-700 focus:border-gray-600 text-white bg-gray-800"
                                : "border-gray-200 focus:border-gray-400 text-gray-900 bg-white"
                            } rounded-lg px-2 py-2 pl-7 text-sm focus:ring-0 transition-colors`}
                          />
                        </div>
                      </div>
                      {/* Duration */}
                      <div>
                        <label
                          className={`text-xs font-medium ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          } mb-1 block`}
                        >
                          Duration
                        </label>
                        <div className="relative">
                          <Clock
                            size={16}
                            className={`absolute left-2 top-1/2 transform -translate-y-1/2 ${
                              isDark ? "text-gray-500" : "text-gray-400"
                            }`}
                          />
                          <select
                            value={taskData.estimatedTime}
                            onChange={(e) =>
                              handleInputChange("estimatedTime", e.target.value)
                            }
                            className={`w-full border ${
                              isDark
                                ? "border-gray-700 focus:border-gray-600 text-white bg-gray-800"
                                : "border-gray-200 focus:border-gray-400 text-gray-900 bg-white"
                            } rounded-lg px-2 py-2 pl-7 text-sm focus:ring-0 transition-colors`}
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
                    <div
                      className={`${
                        isDark ? "bg-gray-800/50" : "bg-gray-50"
                      } rounded-lg p-3`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Repeat
                          size={16}
                          className={isDark ? "text-gray-400" : "text-gray-500"}
                        />
                        <input
                          type="checkbox"
                          id="recurring"
                          checked={taskData.recurring}
                          onChange={(e) =>
                            handleInputChange("recurring", e.target.checked)
                          }
                          className={`w-4 h-4 ${
                            isDark
                              ? "text-gray-500 border-gray-600 bg-gray-800 focus:ring-gray-500"
                              : "text-gray-600 border-gray-300 bg-white focus:ring-gray-500"
                          } rounded`}
                        />
                        <label
                          htmlFor="recurring"
                          className={`text-sm font-medium ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
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
                              className={`w-full border ${
                                isDark
                                  ? "border-gray-700 focus:border-gray-600 text-white bg-gray-800"
                                  : "border-gray-200 focus:border-gray-400 text-gray-900 bg-white"
                              } rounded-lg px-3 py-2 text-sm focus:ring-0 transition-colors`}
                            >
                              {RECURRENCE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <div>
                              <label
                                className={`text-xs ${
                                  isDark ? "text-gray-400" : "text-gray-500"
                                } mb-1 block`}
                              >
                                Every
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={taskData.recurrenceInterval}
                                onChange={(e) =>
                                  handleInputChange(
                                    "recurrenceInterval",
                                    parseInt(e.target.value) || 1
                                  )
                                }
                                className={`w-full border ${
                                  isDark
                                    ? "border-gray-700 focus:border-gray-600 text-white bg-gray-800"
                                    : "border-gray-200 focus:border-gray-400 text-gray-900 bg-white"
                                } rounded-lg px-3 py-2 text-sm focus:ring-0 transition-colors`}
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
                  className={`flex-1 px-4 py-2.5 text-sm font-medium ${
                    isDark
                      ? "text-gray-300 hover:bg-gray-800"
                      : "text-gray-700 hover:bg-gray-50"
                  } transition-colors rounded-lg`}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!taskData.title.trim()}
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditTaskModal;
