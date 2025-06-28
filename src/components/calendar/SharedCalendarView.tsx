import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useCalendarData } from "./hooks/useCalendarData";
import { useEventsStore } from "../../store/events";
import { format, isToday, isSameDay } from "date-fns";

interface SharedCalendarViewProps {
  onEventCreate: (date: Date) => void;
}

const SharedCalendarView: React.FC<SharedCalendarViewProps> = ({
  onEventCreate,
}) => {
  const { calendarMonth, loading, selectedDate } = useCalendarData();
  const { setSelectedDate, setCalendarView, calendarView } = useEventsStore();
  
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    onEventCreate(new Date(date));
  };

  const getMemberColor = (memberName: string) => {
    const colors = [
      "bg-indigo-500",
      "bg-emerald-500", 
      "bg-amber-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-blue-500"
    ];
    
    // Simple hash function to assign consistent colors
    let hash = 0;
    for (let i = 0; i < memberName.length; i++) {
      hash = memberName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (loading.fetch) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-7 gap-4 mb-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-6 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 35 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!calendarMonth) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center text-gray-500">
          Unable to load calendar data
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateMonth("prev")}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateMonth("next")}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onEventCreate(new Date())}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Add Event
            </motion.button>
          </div>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center gap-2">
          {(["month", "week", "day"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setCalendarView(mode)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors capitalize ${
                calendarView === mode
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-4 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-4">
          {calendarMonth.weeks.flatMap(week => 
            week.days.map((day, index) => {
              const isDayToday = day.isToday;
              const isSelected = day.isSelected;

              return (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  onClick={() => handleDateClick(day.date)}
                  className={`min-h-[120px] p-3 border border-gray-100 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors ${
                    !day.isCurrentMonth ? "opacity-50" : ""
                  } ${
                    isDayToday
                      ? "bg-indigo-50 border-indigo-200"
                      : isSelected
                      ? "bg-blue-50 border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`text-sm font-medium mb-2 ${
                      isDayToday ? "text-indigo-700" : "text-gray-900"
                    }`}
                  >
                    {format(new Date(day.date), "d")}
                  </div>

                  <div className="space-y-1">
                    {day.events.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded text-white truncate ${getMemberColor(
                          event.creator_name || "Unknown"
                        )}`}
                        title={`${event.title} - ${event.creator_name || "Unknown"}`}
                      >
                        {event.all_day ? (
                          event.title
                        ) : (
                          `${format(new Date(event.start_date), "HH:mm")} ${event.title}`
                        )}
                      </div>
                    ))}

                    {day.events.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{day.events.length - 3} more
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedCalendarView;