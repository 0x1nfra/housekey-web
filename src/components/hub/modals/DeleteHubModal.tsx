import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface DeleteHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  hubName: string;
  loading: boolean;
}

const DeleteHubModal: React.FC<DeleteHubModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  hubName,
  loading,
}) => {
  const [confirmText, setConfirmText] = useState("");
  const isConfirmed = confirmText === hubName;

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-xl dark:shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                <AlertTriangle
                  size={24}
                  className="text-red-600 dark:text-red-400"
                />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Delete Hub
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                Are you sure you want to delete{" "}
                <strong className="text-gray-900 dark:text-gray-100">
                  {hubName}
                </strong>
                ? This will permanently delete:
              </p>

              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                <li>• All hub data and settings</li>
                <li>• All member access</li>
                <li>• All associated tasks and events</li>
                <li>• All shopping lists and items</li>
              </ul>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Type{" "}
                  <strong className="text-gray-900 dark:text-gray-100">
                    {hubName}
                  </strong>{" "}
                  to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-red-500 dark:focus:border-red-400 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder={hubName}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: isConfirmed ? 1.02 : 1 }}
                  whileTap={{ scale: isConfirmed ? 0.98 : 1 }}
                  onClick={handleConfirm}
                  disabled={loading || !isConfirmed}
                  className="flex-1 px-4 py-3 bg-red-600 dark:bg-red-600 hover:bg-red-700 dark:hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Deleting..." : "Delete Hub"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DeleteHubModal;
