import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useCalendarData } from "./hooks/useCalendarData";
import { useEventsStore } from "../../store/events";
import { format, isToday, isSameDay, startOfWeek } from "date-fns";
import CalendarFilters from "./CalendarFilters";
import CalendarDayView from "./CalendarDayView";
import CalendarWeekView from "./CalendarWeekView";

interface SharedCalendarViewProps {
  onEventCreate: (date: Date) => void;
}

const SharedCalendarView: React.FC<SharedCalendarViewProps> = ({
  onEventCreate,
}) => {
  const { 
    calendarMonth, 
    selectedDateItems, 
    weekItems,
    loading, 
    selectedDate, 
    calendarView 
  } = useCalendarData();
  
  const { setSelectedDate, setCalendarView } = useEventsStore();
  
  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));

  useEffect(() => {
    setCurrentDate(new Date(selectedDate));
  }, [selectedDate]);

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

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const navigateDay = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (direction === "prev") {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
    setSelectedDate(newDate.toISOString().split('T')[0]);
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    onEventCreate(new Date(date));
  };

  const getEventColor = (eventType: string) => {
    const colors: Record<string, string> = {
      PERSONAL: 'bg-blue-500',
      FAMILY: 'bg-green-500',
      WORK: 'bg-amber-500',
      APPOINTMENT: 'bg-red-500',
      SOCIAL: 'bg-purple-500',
      OTHER: 'bg-gray-500'
    };
    return colors[eventType] || colors.OTHER;
  };

  const getTaskColor = (priority: number) => {
    const colors = [
      'bg-gray-500',   // 0 (shouldn't happen)
      'bg-gray-500',   // 1 - Low
      'bg-green-500',  // 2 - Medium
      'bg-amber-500',  // 3 - High
      'bg-red-500',    // 4 - Urgent
    ];
    return colors[priority] || colors[0];
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

  // Render filters
  const renderFilters = () => (
    <CalendarFilters />
  );

  // Render month view
  const renderMonthView = () => {
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
                      {/* Events */}
                      {day.events.slice(0, 2).map((event) => (
                        <div
                          key={`event-${event.id}`}
                          className={`text-xs p-1 rounded text-white truncate ${getEventColor(event.event_type)}`}
                          title={`${event.title} - ${event.creator_name || "Unknown"}`}
                        >
                          {event.all_day ? (
                            event.title
                          ) : (
                            `${format(new Date(event.start_date), "HH:mm")} ${event.title}`
                          )}
                        </div>
                      ))}

                      {/* Tasks */}
                      {day.tasks.slice(0, 2).map((task) => (
                        <div
                          key={`task-${task.id}`}
                          className={`text-xs p-1 rounded text-white truncate ${getTaskColor(task.priority)}`}
                          title={`${task.title} - ${task.assigned_to_name || "Unassigned"}`}
                        >
                          <span className="mr-1">⚑</span> {task.title}
                        </div>
                      ))}

                      {/* Show count of additional items */}
                      {(day.events.length + day.tasks.length) > 4 && (
                        <div className="text-xs text-gray-500">
                          +{(day.events.length + day.tasks.length) - 4} more
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

  // Render week view
  const renderWeekView = () => {
    const weekStartDate = startOfWeek(new Date(selectedDate)).toISOString().split('T')[0];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">
              Week of {format(new Date(weekStartDate), "MMMM d, yyyy")}
            </h2>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateWeek("prev")}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateWeek("next")}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </div>
        </div>
        
        <CalendarWeekView 
          startDate={weekStartDate} 
          items={weekItems} 
          onDateClick={handleDateClick}
        />
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">
              {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
            </h2>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateDay("prev")}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateDay("next")}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </div>
        </div>
        
        <CalendarDayView date={selectedDate} items={selectedDateItems} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      {renderFilters()}
      
      {/* Calendar View */}
      {calendarView === 'month' && renderMonthView()}
      {calendarView === 'week' && renderWeekView()}
      {calendarView === 'day' && renderDayView()}
    </div>
  );
};

export default SharedCalendarView;