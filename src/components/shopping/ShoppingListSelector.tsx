import type React from "react";
import { motion } from "framer-motion";
import { Plus, List, BarChart3 } from "lucide-react";
import { type ShoppingList, type QuickStats } from "./hooks/useShoppingData";

interface ShoppingListSelectorProps {
  lists: ShoppingList[];
  currentList: ShoppingList | null;
  setCurrentList: (list: ShoppingList) => void;
  quickStats: QuickStats | null;
  setShowCreateModal: (show: boolean) => void;
  setShowStatsModal: (show: boolean) => void;
}

const ShoppingListSelector: React.FC<ShoppingListSelectorProps> = ({
  lists,
  currentList,
  setCurrentList,
  quickStats,
  setShowCreateModal,
  setShowStatsModal,
}) => {
  return (
    <div className="flex flex-wrap gap-3 items-center justify-between">
      <div className="flex flex-wrap gap-2">
        {lists.map((list) => (
          <motion.button
            key={list.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentList(list)}
            className={`px-3 py-2 rounded-xl font-medium font-interface transition-all duration-300 ${
              currentList?.id === list.id
                ? "bg-sage-green text-deep-charcoal shadow-md"
                : "bg-warm-off-white border border-gray-200 text-deep-charcoal hover:border-sage-green hover:bg-sage-green-light"
            }`}
          >
            <div className="flex items-center gap-2">
              <List size={16} />
              <span>{list.name}</span>
              {quickStats && currentList?.id === list.id && (
                <span className="text-xs opacity-75 bg-deep-charcoal text-warm-off-white px-2 py-1 rounded-full">
                  {quickStats.pendingItems}
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {currentList && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowStatsModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <BarChart3 size={16} />
            Stats
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          New List
        </motion.button>
      </div>
    </div>
  );
};

export default ShoppingListSelector;
