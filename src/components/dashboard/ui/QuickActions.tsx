"use client";

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar, CheckSquare, ShoppingCart, X } from "lucide-react";

interface QuickAction {
  type: string;
  icon: React.ElementType;
  label: string;
  color: string;
}

const QuickActions: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<QuickAction | null>(
    null
  );

  const quickActionTypes: QuickAction[] = [
    {
      type: "event",
      icon: Calendar,
      label: "Add Event",
      color: "bg-blue-100 text-blue-700",
    },
    {
      type: "task",
      icon: CheckSquare,
      label: "Create Task",
      color: "bg-sage-green-light text-deep-charcoal",
    },
    {
      type: "shopping",
      icon: ShoppingCart,
      label: "Add to List",
      color: "bg-amber-100 text-amber-700",
    },
  ];

  const handleActionClick = (action: QuickAction) => {
    setSelectedAction(action);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAction(null);
  };

  const renderModalContent = () => {
    if (!selectedAction) return null;

    switch (selectedAction.type) {
      case "event":
        return (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Event title"
              className="input-field"
            />
            <div className="grid grid-cols-2 gap-4">
              <input type="date" className="input-field" />
              <input type="time" className="input-field" />
            </div>
            <select className="input-field">
              <option>Assign to family member</option>
              <option>Sarah</option>
              <option>Mike</option>
              <option>Emma</option>
            </select>
          </div>
        );

      case "task":
        return (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Task description"
              className="input-field"
            />
            <div className="grid grid-cols-2 gap-4">
              <select className="input-field">
                <option>Assign to</option>
                <option>Sarah</option>
                <option>Mike</option>
                <option>Emma</option>
              </select>
              <select className="input-field">
                <option>Priority</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <input type="date" className="input-field" />
          </div>
        );

      case "shopping":
        return (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Item name"
              className="input-field"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Quantity"
                className="input-field"
              />
              <select className="input-field">
                <option>Weekly Groceries</option>
                <option>Hardware Store</option>
                <option>Pharmacy</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white border border-gray-100 rounded-lg shadow-soft p-6 hover:shadow-medium hover:-translate-y-1 transition-all duration-300"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-sage-green-light rounded-lg flex items-center justify-center">
            <Plus size={20} className="text-deep-charcoal" />
          </div>
          <div>
            <h3 className="font-chivo font-semibold text-deep-charcoal">
              Quick Actions
            </h3>
            <p className="text-sm text-charcoal-muted font-lora">
              Add something new in seconds
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActionTypes.map((action) => (
            <motion.button
              key={action.type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleActionClick(action)}
              className="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-sage-green hover:bg-sage-green-light transition-all duration-300 ease-out"
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.color}`}
              >
                <action.icon size={24} />
              </div>
              <span className="font-chivo font-medium text-deep-charcoal text-sm">
                {action.label}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md border border-gray-100 shadow-strong"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-chivo font-semibold text-deep-charcoal">
                  {selectedAction?.label}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-sage-green-light transition-colors"
                >
                  <X size={20} className="text-charcoal-muted" />
                </button>
              </div>

              {renderModalContent()}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCloseModal}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseModal}
                  className="btn-primary flex-1"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default QuickActions;
