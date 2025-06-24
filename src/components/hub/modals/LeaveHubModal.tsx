import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface LeaveHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  hubName: string;
  loading: boolean;
}

const LeaveHubModal: React.FC<LeaveHubModalProps> = ({
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
                <AlertTriangle size={24} className="text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Leave Hub</h2>
                <p className="text-sm text-gray-500">
                  You will lose access to this hub
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to leave <strong>{hubName}</strong>? You
                will no longer have access to:
              </p>

              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• Hub data and settings</li>
                <li>• Member discussions and updates</li>
                <li>• Tasks and event schedules</li>
                <li>• Shared shopping lists</li>
              </ul>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Type <strong>{hubName}</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder={hubName}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: isConfirmed ? 1.02 : 1 }}
                  whileTap={{ scale: isConfirmed ? 0.98 : 1 }}
                  onClick={handleConfirm}
                  disabled={loading || !isConfirmed}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Leaving..." : "Leave Hub"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LeaveHubModal;
