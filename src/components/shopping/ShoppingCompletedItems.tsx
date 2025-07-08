import type React from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { type ShoppingItem } from "../../types/shopping";
import { useAuthStore } from "../../store/auth";

interface ShoppingCompletedItemsProps {
  completedItems: ShoppingItem[];
  handleItemComplete: (itemId: string) => Promise<void>;
}

const ShoppingCompletedItems: React.FC<ShoppingCompletedItemsProps> = ({
  completedItems,
  handleItemComplete,
}) => {
  const { profile } = useAuthStore((state) => ({
    profile: state.profile,
  }));

  return (
    <div className="card-footer">
      <h3 className="font-semibold text-deep-charcoal mb-4 font-interface text-lg">
        Completed ({completedItems.length})
      </h3>

      <div className="space-y-2">
        {completedItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-3 p-3 bg-warm-off-white rounded-lg opacity-75 hover:opacity-100 transition-opacity duration-300"
          >
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-sage-green rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-deep-charcoal" />
            </div>

            <div className="flex-1">
              <span className="text-charcoal-muted line-through font-interface">
                {item.name}
              </span>
              {item.completed_by && (
                <span className="text-xs text-charcoal-muted ml-1 font-content">
                  by{" "}
                  <span className="font-semibold">
                    {profile?.name}
                  </span>
                </span>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleItemComplete(item.id)}
              className="p-1 text-charcoal-muted hover:text-deep-charcoal hover:bg-sage-green-light rounded-lg transition-all duration-300"
              title="Mark as incomplete"
            >
              <X size={14} />
            </motion.button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShoppingCompletedItems;
