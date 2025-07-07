import type React from "react";
import { motion } from "framer-motion";
import { Plus, Edit3, Trash2 } from "lucide-react";
import { type ShoppingList } from "./hooks/useShoppingData";
import { useHubSelectors } from "../../store/hub";

interface ShoppingListHeaderProps {
  currentList: ShoppingList;
  setShowAddItemModal: (show: boolean) => void;
  setShowEditModal: (show: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;
}

const ShoppingListHeader: React.FC<ShoppingListHeaderProps> = ({
  currentList,
  setShowAddItemModal,
  setShowEditModal,
  setShowDeleteModal,
}) => {
  const hubSelectors = useHubSelectors();

  return (
    <div className="border-b border-gray-100 dark:border-gray-700 mb-4 card-header">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-deep-charcoal font-interface">
            {currentList.name}
          </h2>
          {hubSelectors.isCurrentUserManagerOrOwner() && (
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowEditModal(true)}
                className="p-1 text-charcoal-muted hover:text-deep-charcoal hover:bg-sage-green-light rounded-lg transition-all duration-300"
                title="Edit list"
              >
                <Edit3 size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteModal(true)}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300"
                title="Delete list"
              >
                <Trash2 size={16} />
              </motion.button>
            </div>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddItemModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Add Item
        </motion.button>
      </div>

      {currentList.description && (
        <p className="text-sm text-charcoal-muted mb-4 font-content leading-relaxed">
          {currentList.description}
        </p>
      )}
    </div>
  );
};

export default ShoppingListHeader;
