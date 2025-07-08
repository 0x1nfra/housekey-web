import React from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { TaskPriority } from "../../../types/tasks";

interface BulkActionsProps {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkPriorityUpdate: (priority: TaskPriority) => void;
  onClearSelection: () => void;
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  onBulkDelete,
  onBulkPriorityUpdate,
}) => {
  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-indigo-200 rounded-xl p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-indigo-900">
            {selectedCount} task{selectedCount !== 1 ? "s" : ""} selected
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onBulkPriorityUpdate(TaskPriority.URGENT)}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
            >
              Urgent
            </button>
            <button
              onClick={() => onBulkPriorityUpdate(TaskPriority.HIGH)}
              className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
            >
              High
            </button>
            <button
              onClick={() => onBulkPriorityUpdate(TaskPriority.MEDIUM)}
              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
            >
              Medium
            </button>
            <button
              onClick={() => onBulkPriorityUpdate(TaskPriority.LOW)}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
            >
              Low
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onBulkDelete}
            className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors flex items-center gap-1"
          >
            <Trash2 size={14} color="red" />
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default BulkActions;
