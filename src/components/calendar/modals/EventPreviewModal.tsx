import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Edit,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  User,
  Tag,
} from "lucide-react";
import { CalendarItem } from "../../../store/events/types";
import dayjs from "dayjs";
import { useEventsStore } from "../../../store/events";

interface EventPreviewModalProps {
  event: CalendarItem;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: CalendarItem) => void;
  onDelete: (eventId: string) => void;
}

const EventPreviewModal: React.FC<EventPreviewModalProps> = ({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { deleteEvent } = useEventsStore();

  const handleDelete = async () => {
    if (event.type === "event") {
      try {
        await deleteEvent(event.id);
        onClose();
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    } else {
      // Handle task deletion
      onDelete(event.id);
    }
  };

  const handleEdit = () => {
    onEdit(event);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-100 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with color indicator */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: event.color }}
                >
                  {event.type === "event" ? (
                    <Calendar size={20} />
                  ) : (
                    <Tag size={20} />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate max-w-[250px]">
                    {event.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {event.type === "event"
                      ? event.event_type
                      : `Task - Priority ${event.priority}`}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Event/Task Details */}
            <div className="space-y-4">
              {/* Date and Time */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Calendar size={18} className="text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {dayjs(event.date).format("dddd, MMMM D, YYYY")}
                  </p>
                  {event.all_day ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">All day</p>
                  ) : event.start_time ? (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {event.start_time}
                      {event.end_time ? ` - ${event.end_time}` : ""}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{event.description}</p>
                </div>
              )}

              {/* Location */}
              {event.location && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <MapPin size={18} className="text-gray-500 dark:text-gray-400" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">{event.location}</p>
                </div>
              )}

              {/* Assigned To */}
              {event.assigned_to_name && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <User size={18} className="text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {event.type === "event" ? "Created by" : "Assigned to"}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {event.assigned_to_name}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEdit}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Edit size={16} />
                Edit
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDelete}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Trash2 size={16} />
                Delete
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventPreviewModal;