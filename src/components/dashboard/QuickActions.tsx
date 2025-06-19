import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, CheckSquare, ShoppingCart, X } from 'lucide-react';

interface QuickAction {
  type: string;
  icon: React.ElementType;
  label: string;
  color: string;
}

const QuickActions: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<QuickAction | null>(null);

  const quickActionTypes: QuickAction[] = [
    {
      type: 'event',
      icon: Calendar,
      label: 'Add Event',
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      type: 'task',
      icon: CheckSquare,
      label: 'Create Task',
      color: 'bg-emerald-100 text-emerald-600'
    },
    {
      type: 'shopping',
      icon: ShoppingCart,
      label: 'Add to List',
      color: 'bg-amber-100 text-amber-600'
    }
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
      case 'event':
        return (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Event title"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                type="time"
                className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <select className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              <option>Assign to family member</option>
              <option>Sarah</option>
              <option>Mike</option>
              <option>Emma</option>
            </select>
          </div>
        );

      case 'task':
        return (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Task description"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <div className="grid grid-cols-2 gap-4">
              <select className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option>Assign to</option>
                <option>Sarah</option>
                <option>Mike</option>
                <option>Emma</option>
              </select>
              <select className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                <option>Priority</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        );

      case 'shopping':
        return (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Item name"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Quantity"
                className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
              <select className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500">
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
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Plus size={20} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Quick Actions</h3>
            <p className="text-sm text-gray-500">Add something new in seconds</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActionTypes.map((action) => (
            <motion.button
              key={action.type}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleActionClick(action)}
              className="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.color}`}>
                <action.icon size={24} />
              </div>
              <span className="font-medium text-gray-900 text-sm">{action.label}</span>
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
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedAction?.label}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {renderModalContent()}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
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