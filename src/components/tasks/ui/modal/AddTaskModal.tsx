import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { TaskData } from "../../../../types/tasks";
import { useTasksStore } from "../../../../store/tasks";
import { useHubStore } from "../../../../store/hub";
import { shallow } from "zustand/shallow";
import { TaskFormFields } from "./components/TaskFormFields";
import { CategoryForm } from "./components/CategoryForm";
import { useTaskForm } from "./hooks/useTaskForm";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreate: (taskData: TaskData) => void;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onTaskCreate,
}) => {
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const { taskData, handleInputChange, resetForm } = useTaskForm(isOpen);

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
    if (!taskData.title.trim()) return;

    onTaskCreate(taskData);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    setShowCategoryForm(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Create Task
              </h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Form */}
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

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 h-11 px-4 border border-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!taskData.title.trim()}
                  className="flex-1 h-11 px-4 bg-sage-green hover:bg-sage-green-hover disabled:bg-gray-300 text-deep-charcoal rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  Create Task
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddTaskModal;
