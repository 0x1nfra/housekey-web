import type React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Edit3, Trash2 } from "lucide-react";
import { type ShoppingItem } from "../../types/shopping";
import { getMemberAvatar, getCategoryColor } from "./utils/shoppingUtils";
import { useAuthStore } from "../../store/auth";

interface ShoppingPendingItemsProps {
  pendingItems: ShoppingItem[];
  loading: boolean;
  handleItemComplete: (itemId: string) => Promise<void>;
  handleItemDelete: (itemId: string) => Promise<void>;
  openEditModal: (item: ShoppingItem) => void;
}

const ShoppingPendingItems: React.FC<ShoppingPendingItemsProps> = ({
  pendingItems,
  loading,
  handleItemComplete,
  handleItemDelete,
  openEditModal,
}) => {
  const { user, profile } = useAuthStore((state) => ({
    user: state.user,
    profile: state.profile,
  }));

  return (
    <div className="card-content">
      <h3 className="font-semibold text-deep-charcoal mb-4 font-interface text-lg">
        To Buy ({pendingItems.length})
      </h3>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-5 h-5 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-1" />
                  <div className="h-2 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {pendingItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="flex items-center gap-3 p-4 bg-warm-off-white rounded-lg hover:bg-gray-100 transition-all duration-300 group"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleItemComplete(item.id)}
                  className="w-6 h-6 border-2 border-gray-300 rounded-full hover:border-sage-green transition-all duration-300 flex items-center justify-center group-hover:border-sage-green"
                >
                  <Check
                    size={14}
                    className="text-transparent group-hover:text-sage-green transition-colors duration-300"
                  />
                </motion.button>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-deep-charcoal font-interface">
                      {item.name}
                    </span>
                    {item.quantity > 1 && (
                      <span className="px-2 py-1 bg-sage-green-light text-deep-charcoal text-xs rounded-full font-medium font-interface">
                        {item.quantity}x
                      </span>
                    )}
                    {item.category && (
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium font-interface border ${getCategoryColor(
                          item.category
                        )}`}
                      >
                        {item.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-charcoal-muted font-content">
                    <span className="text-lg">{getMemberAvatar("User")}</span>
                    <span>
                      <span className="font-semibold">{profile?.name}</span>
                    </span>
                    {item.note && (
                      <>
                        <span>•</span>
                        <span>{item.note}</span>
                      </>
                    )}
                  </div>
                </div>

                {user && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openEditModal(item)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-charcoal-muted hover:text-deep-charcoal hover:bg-sage-green-light rounded-lg transition-all duration-300"
                    title="Edit item"
                  >
                    <Edit3 size={14} />
                  </motion.button>
                )}

                {user && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleItemDelete(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300"
                    title="Delete item"
                  >
                    <Trash2 size={14} />
                  </motion.button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {pendingItems.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-sage-green-light rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-deep-charcoal" />
          </div>
          <p className="text-charcoal-muted font-content text-lg">
            All items completed! 🎉
          </p>
        </div>
      )}
    </div>
  );
};

export default ShoppingPendingItems;
