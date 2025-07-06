import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { type Task } from "../../../../store/tasks/types";
import { useHubStore } from "../../../../store/hub";
import { useTasksStore } from "../../../../store/tasks";
import { shallow } from "zustand/shallow";
import { TaskFormFields } from "./components/TaskFormFields";
import { CategoryForm } from "./components/CategoryForm";
import { useEditTaskForm } from "./hooks/useEditTaskForm";

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  task: Task | null;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  onClose,
  onTaskUpdate,
  task,
}) => {
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const { taskData, handleInputChange, resetForm } = useEditTaskForm(
    isOpen,
    task
  );

  const { hubMembers } = useHubStore(
    (state) => ({ hubMembers: state.hubMembers }),
    shallow
  );

  const { categories, createCategory, fetchCategories } = useTasksStore(
    (state) => ({
      categories: state.categories,
      createCategory: state.createCategory,
      fetchCategories: state.fetchCategories,
    }),
    shallow
  );

  // Get available assignees (hub members)
  const availableAssignees = hubMembers
    .map((member) => ({
      name: member.user_profile?.name || "Unknown User",
      user_id: member.user_id,
    }))
    .filter((assignee) => assignee.name);

  const handleCreateCategory = async (categoryData: {
    name: string;
    color: string;
  }) => {
    await createCategory(categoryData);
    setShowCategoryForm(false);
    await fetchCategories();
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
    onClose();
  };

  const handleClose = () => {
    resetForm();
    setShowCategoryForm(false);
    onClose();
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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Edit Task
                </h2>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={18} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <TaskFormFields
                taskData={taskData}
                onInputChange={handleInputChange}
                availableAssignees={availableAssignees}
                categories={categories}
                onCreateCategory={() => setShowCategoryForm(true)}
              />

              <CategoryForm
                isVisible={showCategoryForm}
                onCreateCategory={handleCreateCategory}
                onCancel={() => setShowCategoryForm(false)}
              />

              {/* Footer */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!taskData.title.trim()}
                  className="flex-1 px-4 py-2.5 bg-sage-green hover:bg-sage-green-hover text-deep-charcoal text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditTaskModal;
