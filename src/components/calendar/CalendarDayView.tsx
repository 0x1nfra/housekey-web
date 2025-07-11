import React from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { CalendarItem } from "../../store/events/types";
import { Clock, MapPin, User, Tag, Trash2, Edit } from "lucide-react";
import { useEventsStore } from "../../store/events";

interface CalendarDayViewProps {
  date: string;
  items: CalendarItem[];
  onEventClick?: (event: CalendarItem) => void;
  onEventEdit?: (event: CalendarItem) => void;
  onTimeSlotClick?: (date: string, hour: number, minute: number) => void;
}

const HOUR_HEIGHT = 60; // Height in pixels for each hour
const HOURS = Array.from({ length: 24 }, (_, i) => i); // 12 AM (0) to 11 PM (23)

const CalendarDayView: React.FC<CalendarDayViewProps> = ({
  date,
  items,
  onEventClick,
  onEventEdit,
  onTimeSlotClick,
}) => {
  const { deleteEvent } = useEventsStore();

  const handleTimeSlotClick = (e: React.MouseEvent, hour: number) => {
    // Only trigger if clicking directly on the time slot (not on an event)
    if (e.currentTarget === e.target && onTimeSlotClick) {
      onTimeSlotClick(date, hour, 0);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent(eventId);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleEditEvent = (e: React.MouseEvent, item: CalendarItem) => {
    e.stopPropagation();
    if (onEventEdit) {
      onEventEdit(item);
    }
  };

  // Format time for display
  const formatTimeLabel = (hour: number) => {
    return dayjs().hour(hour).minute(0).format("h a");
  };

  // Calculate position and height for an event
  const calculateEventPosition = (item: CalendarItem) => {
    if (!item.start_time) return { top: 0, height: HOUR_HEIGHT };

    const [hours, minutes] = item.start_time.split(":").map(Number);
    const startMinutes = hours * 60 + minutes;
    const startHour = 0; // 12 AM (0) is our first hour

    const topPosition = ((startMinutes - startHour * 60) / 60) * HOUR_HEIGHT;

    let height = HOUR_HEIGHT;
    if (item.end_time) {
      const [endHours, endMinutes] = item.end_time.split(":").map(Number);
      const totalEndMinutes = endHours * 60 + endMinutes;
      const durationMinutes = totalEndMinutes - startMinutes;
      height = (durationMinutes / 60) * HOUR_HEIGHT;
    }

    return { top: topPosition, height: Math.max(height, 30) }; // Minimum height of 30px
  };

  // Separate all-day events from timed events
  const allDayItems = items.filter((item) => item.all_day);
  const timedItems = items.filter((item) => !item.all_day);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {/* All-day events section */}
      {allDayItems.length > 0 && (
        <div className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            All-day Events
          </h3>
          <div className="space-y-2">
            {allDayItems.map((item) => (
              <motion.div
                key={`allday-${item.type}-${item.id}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg border-l-4 bg-white dark:bg-gray-800 shadow-sm"
                style={{ borderLeftColor: item.color }}
                onClick={() => onEventClick && onEventClick(item)}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.title}</h4>

                  {item.type === "event" && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleEditEvent(e, item)}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                        title="Edit event"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.type === "event") {
                            handleDeleteEvent(item.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                        title="Delete event"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {item.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {item.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2">
                  {item.assigned_to_name && (
                    <div className="flex items-center gap-1">
                      <User size={12} />
                      <span>{item.assigned_to_name}</span>
                    </div>
                  )}

                  {item.location && (
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Timed events section */}
      <div className="grid grid-cols-[80px_1fr] relative min-h-[800px]">
        {/* Time labels column */}
        <div className="border-r border-gray-100 dark:border-gray-700">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-[60px] border-b border-gray-100 dark:border-gray-700 px-2 flex items-start justify-end pt-1"
            >
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 pl-2">
                {formatTimeLabel(hour)}
              </span>
            </div>
          ))}
        </div>

        {/* Events column */}
        <div className="relative">
          {/* Hour grid lines */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-[60px] border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              onClick={(e) => handleTimeSlotClick(e, hour)}
            ></div>
          ))}

          {/* Events */}
          {timedItems.map((item) => {
            const { top, height } = calculateEventPosition(item);

            return (
              <motion.div
                key={`${item.type}-${item.id}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute left-0 right-0 mx-4 rounded-lg overflow-hidden shadow-sm border-l-4 z-10 bg-white dark:bg-gray-800"
                style={{
                  top: `${top}px`,
                  height: `${height}px`,
                  borderLeftColor: item.color,
                }}
                onClick={() => onEventClick && onEventClick(item)}
              >
                <div className="p-2 h-full flex flex-col">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {item.title}
                    </h4>

                    {item.type === "event" && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleEditEvent(e, item)}
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                          title="Edit event"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.type === "event") {
                              handleDeleteEvent(item.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30"
                          title="Delete event"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {item.start_time && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock size={10} />
                      {item.start_time}
                      {item.end_time ? ` - ${item.end_time}` : ""}
                    </div>
                  )}

                  {item.description && height > 60 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  {height > 80 && (
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400 mt-auto">
                      {item.assigned_to_name && (
                        <div className="flex items-center gap-1">
                          <User size={10} />
                          <span>{item.assigned_to_name}</span>
                        </div>
                      )}

                      {item.location && (
                        <div className="flex items-center gap-1">
                          <MapPin size={10} />
                          <span className="truncate max-w-[150px]">
                            {item.location}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarDayView;