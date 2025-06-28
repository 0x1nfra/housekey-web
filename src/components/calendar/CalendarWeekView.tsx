import React from 'react';
import { motion } from 'framer-motion';
import { format, addDays, isSameDay } from 'date-fns';
import { CalendarItem } from '../../store/events/types';
import { useEventsStore } from '../../store/events';

interface CalendarWeekViewProps {
  startDate: string;
  items: Record<string, CalendarItem[]>;
  onDateClick: (date: string) => void;
}

const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({ 
  startDate, 
  items,
  onDateClick
}) => {
  const { selectedDate } = useEventsStore();
  
  // Generate array of 7 days starting from startDate
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(startDate), i);
    return format(date, 'yyyy-MM-dd');
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Week header */}
      <div className="grid grid-cols-7 border-b border-gray-100">
        {weekDays.map((day) => {
          const date = new Date(day);
          const isToday = isSameDay(date, new Date());
          const isSelected = day === selectedDate;
          
          return (
            <div 
              key={day}
              onClick={() => onDateClick(day)}
              className={`p-4 text-center cursor-pointer transition-colors ${
                isToday 
                  ? 'bg-indigo-50' 
                  : isSelected 
                  ? 'bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="text-sm font-medium text-gray-500">
                {format(date, 'EEE')}
              </div>
              <div className={`text-lg font-semibold ${
                isToday ? 'text-indigo-600' : 'text-gray-900'
              }`}>
                {format(date, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Week content */}
      <div className="grid grid-cols-7 divide-x divide-gray-100 min-h-[500px]">
        {weekDays.map((day) => {
          const dayItems = items[day] || [];
          
          return (
            <div key={day} className="overflow-y-auto max-h-[500px]">
              {dayItems.length === 0 ? (
                <div className="p-2 text-center text-gray-400 text-xs">No items</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {dayItems.map((item, index) => (
                    <motion.div
                      key={`${item.type}-${item.id}`}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-2 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className="w-1 h-full self-stretch rounded-full"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            {item.all_day ? (
                              <span className="text-xs bg-indigo-100 text-indigo-800 px-1 rounded">
                                All day
                              </span>
                            ) : item.start_time ? (
                              <span className="text-xs text-gray-500">
                                {item.start_time}
                              </span>
                            ) : null}
                            
                            <h5 className="text-sm font-medium text-gray-900 truncate">
                              {item.title}
                            </h5>
                          </div>
                          
                          {item.assigned_to_name && (
                            <div className="text-xs text-gray-500 truncate">
                              {item.assigned_to_name}
                            </div>
                          )}
                        </div>
                        
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                          style={{ backgroundColor: item.color }}
                        ></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarWeekView;