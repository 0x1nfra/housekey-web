import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit3 } from 'lucide-react';
import { useShoppingData } from '../hooks/useShoppingData';
import { UpdateItemData } from '../../../store/shopping/types';
import { ItemFormFields } from './components/ItemFormFields';
import { useItemForm } from './hooks/useItemForm';

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemEdit: (itemId: string, itemData: UpdateItemData) => Promise<void>;
  itemId: string;
  initialData?: {
    name: string;
    quantity: number;
    category: string;
    note: string;
  };
}

const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen,
  onClose,
  onItemEdit,
  itemId,
  initialData,
}) => {
  // Get dynamic suggestions from the store
  const { shoppingSuggestions } = useShoppingData();

  // Use custom form hook
  const {
    formData,
    showSuggestions,
    handleInputChange,
    setShowSuggestions,
    resetForm,
    handleSuggestionClick,
  } = useItemForm({ isOpen, initialData });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await onItemEdit(itemId, {
        name: formData.name,
        quantity: formData.quantity,
        category: formData.category,
        note: formData.note,
      });

      onClose();
    } catch (error) {
      console.error("Error updating item:", error);
      // Handle error (show toast, etc.)
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-100 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                <Edit3
                  size={20}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Edit Item
              </h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <ItemFormFields
                formData={formData}
                onInputChange={handleInputChange}
                showSuggestions={showSuggestions}
                onShowSuggestions={setShowSuggestions}
                suggestions={shoppingSuggestions}
                onSuggestionClick={handleSuggestionClick}
              />

              {/* Footer */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.name.trim()}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Item
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditItemModal;
