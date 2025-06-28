import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { CalendarMonth, CalendarItem } from '../../store/events/types';

interface CalendarMonthViewProps {
  calendarMonth: CalendarMonth;
  onDateClick: (date: string) => void;
  onEventClick: (event: CalendarItem) => void;
}

const CalendarMonthView: React.FC<CalendarMonthViewProps> = ({ 
  calendarMonth, 
  onDateClick,
  onEventClick
}) => {
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-4 p-6 pb-2">
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
      <div className="p-6 pt-2">
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
                  onClick={() => onDateClick(day.date)}
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
                    {day.events.slice(0, 2).map((event) => {
                      const calendarItem: CalendarItem = {
                        id: event.id,
                        title: event.title,
                        description: event.description,
                        date: day.date,
                        type: 'event',
                        event_type: event.event_type,
                        assigned_to: event.created_by,
                        assigned_to_name: event.creator_name,
                        color: getEventColor(event.event_type),
                        all_day: event.all_day,
                        start_time: event.all_day ? undefined : format(new Date(event.start_date), "HH:mm"),
                        end_time: event.all_day || !event.end_date ? undefined : format(new Date(event.end_date), "HH:mm"),
                        location: event.location
                      };
                      
                      return (
                        <div
                          key={`event-${event.id}`}
                          className={`text-xs p-1 rounded text-white truncate ${getEventColor(event.event_type)}`}
                          title={`${event.title} - ${event.creator_name || "Unknown"}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(calendarItem);
                          }}
                        >
                          {event.all_day ? (
                            event.title
                          ) : (
                            `${format(new Date(event.start_date), "HH:mm")} ${event.title}`
                          )}
                        </div>
                      );
                    })}

                    {/* Tasks */}
                    {day.tasks.slice(0, 2).map((task) => {
                      const calendarItem: CalendarItem = {
                        id: task.id,
                        title: task.title,
                        description: task.description,
                        date: day.date,
                        type: 'task',
                        assigned_to: task.assigned_to,
                        assigned_to_name: task.assigned_to_name,
                        priority: task.priority,
                        color: getTaskColor(task.priority),
                      };
                      
                      return (
                        <div
                          key={`task-${task.id}`}
                          className={`text-xs p-1 rounded text-white truncate ${getTaskColor(task.priority)}`}
                          title={`${task.title} - ${task.assigned_to_name || "Unassigned"}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick(calendarItem);
                          }}
                        >
                          <span className="mr-1">⚑</span> {task.title}
                        </div>
                      );
                    })}

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

export default CalendarMonthView;