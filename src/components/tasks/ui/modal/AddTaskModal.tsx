import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Users, Tag } from "lucide-react";
import {
  getPriorityLabel,
  getPriorityColor,
} from "../../../../store/tasks/types";
import { useHubStore } from "../../../../store/hubStore";
import { useAuthStore } from "../../../../store/authStore";
import { shallow } from "zustand/shallow";
import { TaskPriority } from "../../../../types/tasks";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreate: (taskData: any) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onTaskCreate,
}) => {
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: TaskPriority.MEDIUM,
    category: "",
    recurring: false,
    recurrencePattern: "weekly" as "daily" | "weekly" | "monthly",
    estimatedTime: "",
    notes: "",
  });

  const { hubMembers } = useHubStore();
  const { profile } = useAuthStore(
    (state) => ({
      profile: state.profile,
    }),
    shallow
  );

  const taskCategories = [
    "Cleaning",
    "Cooking",
    "Pet Care",
    "Yard Work",
    "Shopping",
    "Maintenance",
    "Organization",
    "Other",
  ];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTaskCreate(taskData);

    // Reset form
    setTaskData({
      title: "",
      description: "",
      assignedTo: "",
      dueDate: "",
      priority: TaskPriority.MEDIUM,
      category: "",
      recurring: false,
      recurrencePattern: "weekly",
      estimatedTime: "",
      notes: "",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Create New Task
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Task Title */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={taskData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter task title"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Description
                </label>
                <textarea
                  value={taskData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Add task details..."
                />
              </div>

              {/* Assign To and Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Assign To
                  </label>
                  <div className="relative">
                    <Users
                      size={20}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <select
                      value={taskData.assignedTo}
                      onChange={(e) =>
                        handleInputChange("assignedTo", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    >
                      <option value="">Unassigned</option>
                      {availableAssignees.map((assignee) => (
                        <option key={assignee.email} value={assignee.email}>
                          {assignee.name} ({assignee.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Due Date
                  </label>
                  <div className="relative">
                    <Calendar
                      size={20}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="date"
                      value={taskData.dueDate}
                      onChange={(e) =>
                        handleInputChange("dueDate", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Priority
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {priorityOptions.map((priority) => (
                    <button
                      key={priority.value}
                      type="button"
                      onClick={() =>
                        handleInputChange("priority", priority.value)
                      }
                      className={`p-3 border rounded-lg transition-colors ${
                        taskData.priority === priority.value
                          ? "border-indigo-300 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${priority.color}`}
                      >
                        <span className="text-sm font-bold">!</span>
                      </div>
                      <span className="text-sm font-medium">
                        {priority.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category and Estimated Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Category
                  </label>
                  <div className="relative">
                    <Tag
                      size={20}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <select
                      value={taskData.category}
                      onChange={(e) =>
                        handleInputChange("category", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    >
                      <option value="">Select category</option>
                      {taskCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Estimated Time
                  </label>
                  <select
                    value={taskData.estimatedTime}
                    onChange={(e) =>
                      handleInputChange("estimatedTime", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="">Select duration</option>
                    <option value="15min">15 minutes</option>
                    <option value="30min">30 minutes</option>
                    <option value="1hour">1 hour</option>
                    <option value="2hours">2 hours</option>
                    <option value="halfday">Half day</option>
                    <option value="fullday">Full day</option>
                  </select>
                </div>
              </div>

              {/* Recurring Task */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={taskData.recurring}
                    onChange={(e) =>
                      handleInputChange("recurring", e.target.checked)
                    }
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="recurring"
                    className="text-sm font-medium text-gray-700"
                  >
                    Recurring Task
                  </label>
                </div>

                {taskData.recurring && (
                  <select
                    value={taskData.recurrencePattern}
                    onChange={(e) =>
                      handleInputChange("recurrencePattern", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Additional Notes
                </label>
                <textarea
                  value={taskData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Any special instructions or notes..."
                />
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!taskData.title}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
