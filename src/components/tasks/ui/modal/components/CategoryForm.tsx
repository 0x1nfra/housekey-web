import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CategoryFormProps {
  isVisible: boolean;
  onCreateCategory: (category: {
    name: string;
    color: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  isVisible,
  onCreateCategory,
  onCancel,
}) => {
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: "#DDEB9D",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newCategory.name.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateCategory(newCategory);
      setNewCategory({ name: "", color: "#3B82F6" });
    } catch (error) {
      console.error("Error creating category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setNewCategory({ name: "", color: "#3B82F6" });
    onCancel();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 border border-gray-200 rounded-lg bg-gray-50 overflow-hidden"
        >
          <div className="flex gap-2 mb-3">
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
              className="flex-1 h-9 border border-gray-300 rounded px-3 text-sm bg-warm-off-white focus:ring-2 focus:ring-sage-green-light focus:border-sage-green-light"
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
              className="w-9 h-9 border border-gray-300 rounded cursor-pointer"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !newCategory.name.trim()}
              className="px-3 py-1.5 bg-sage-green text-deep-charcoal text-xs rounded hover:bg-sage-green-light disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 text-gray-600 text-xs rounded hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
