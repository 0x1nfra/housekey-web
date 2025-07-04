import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { useShoppingStore } from "../../../store/shopping";
import { ShoppingList } from "../../../store/shopping/types";

interface DeleteListModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: ShoppingList | null;
}

const DeleteListModal: React.FC<DeleteListModalProps> = ({
  isOpen,
  onClose,
  list,
}) => {
  const [confirmText, setConfirmText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { deleteList, loading } = useShoppingStore();

  const isConfirmed = confirmText === list?.name;

  const handleSubmit = async () => {
    if (!list || !isConfirmed) return;

    setIsSubmitting(true);
    try {
      await deleteList(list.id);
      onClose();
    } catch (error) {
      console.error("Error deleting list:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && list && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Delete Shopping List
                </h2>
                <p className="text-sm text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete <strong>{list.name}</strong>?
                This will permanently delete:
              </p>

              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• All items in this list</li>
                <li>• All collaborator access</li>
                <li>• All list history and data</li>
              </ul>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Type <strong>{list.name}</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={list.name}
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: isConfirmed ? 1.02 : 1 }}
                  whileTap={{ scale: isConfirmed ? 0.98 : 1 }}
                  onClick={handleSubmit}
                  disabled={isSubmitting || !isConfirmed || loading.lists}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Deleting..." : "Delete List"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteListModal;
