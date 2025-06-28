import React from "react";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { CalendarItem } from "../../store/events/types";
import { useEventsStore } from "../../store/events";
import { Clock, MapPin, User, Edit, Trash2 } from "lucide-react";

interface CalendarWeekViewProps {
  startDate: string;
  items: Record<string, CalendarItem[]>;
  onDateClick: (date: string) => void;
  onEventClick: (event: CalendarItem) => void;
  onEventEdit?: (event: CalendarItem) => void;
}

const HOUR_HEIGHT = 60; // Height in pixels for each hour
const HOURS = Array.from({ length: 24 }, (_, i) => i); // 12 AM (0) to 11 PM (23)

const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({
  startDate,
  items,
  onDateClick,
  onEventClick,
  onEventEdit,
}) => {
  const { selectedDate, deleteEvent } = useEventsStore();

  // Generate array of 7 days starting from startDate (Sunday)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = dayjs(startDate).add(i, "day");
    return date.format("YYYY-MM-DD");
  });

  // Format time for display
  const formatTimeLabel = (hour: number) => {
    return dayjs().hour(hour).minute(0).format("h A");
  };

  const handleDeleteEvent = async (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Week header */}
      <div className="grid grid-cols-8 border-b border-gray-100">
        {/* Empty cell for time column */}
        <div className="p-4 text-center border-r border-gray-100"></div>

        {/* Day headers */}
        {weekDays.map((day) => {
          const date = dayjs(day);
          const isToday =
            date.format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD");
          const isSelected = day === selectedDate;

          return (
            <div
              key={day}
              onClick={() => onDateClick(day)}
              className={`p-4 text-center cursor-pointer transition-colors ${
                isToday
                  ? "bg-indigo-50"
                  : isSelected
                  ? "bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="text-sm font-medium text-gray-500">
                {date.format("ddd")}
              </div>
              <div
                className={`text-lg font-semibold ${
                  isToday ? "text-indigo-600" : "text-gray-900"
                }`}
              >
                {date.format("D")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Week grid */}
      <div className="relative">
        <div className="grid grid-cols-8">
          {/* Time labels column */}
          <div className="border-r border-gray-100">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-[60px] border-b border-gray-100 px-2 flex items-start justify-end pt-1"
              >
                <span className="text-xs text-gray-500 bg-white pl-2">
                  {formatTimeLabel(hour)}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, dayIndex) => (
            <div key={day} className="relative border-r border-gray-100">
              {/* Hour grid lines */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    const date = dayjs(day);
                    date.hour(hour).minute(0).second(0);
                    onDateClick(date.format("YYYY-MM-DD"));
                  }}
                ></div>
              ))}

              {/* Events for this day */}
              {items[day]?.map((item) => {
                const { top, height } = calculateEventPosition(item);

                return (
                  <motion.div
                    key={`${item.type}-${item.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute left-0 right-0 mx-1 rounded overflow-hidden shadow-sm border-l-4 z-10 bg-white group"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      borderLeftColor: item.color,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(item);
                    }}
                  >
                    <div className="p-1 text-xs overflow-hidden h-full">
                      <div className="flex justify-between items-center">
                        <div className="font-medium truncate">{item.title}</div>
                        {item.type === "event" && (
                          <div className="hidden group-hover:flex items-center gap-1">
                            <button
                              onClick={(e) => handleEditEvent(e, item)}
                              className="text-gray-500 hover:text-gray-700 p-0.5 rounded hover:bg-gray-100"
                              title="Edit event"
                            >
                              <Edit size={10} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteEvent(e, item.id)}
                              className="text-red-500 hover:text-red-700 p-0.5 rounded hover:bg-red-50"
                              title="Delete event"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        )}
                      </div>
                      {item.start_time && (
                        <div className="text-gray-500 truncate">
                          {item.start_time}
                          {item.end_time ? ` - ${item.end_time}` : ""}
                        </div>
                      )}
                      {height > 60 && item.location && (
                        <div className="flex items-center gap-1 text-gray-500 mt-1">
                          <MapPin size={8} />
                          <span className="truncate">{item.location}</span>
                        </div>
                      )}
                      {height > 80 && item.assigned_to_name && (
                        <div className="flex items-center gap-1 text-gray-500 mt-1">
                          <User size={8} />
                          <span className="truncate">
                            {item.assigned_to_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarWeekView;
