import React from 'react';
import { motion } from 'framer-motion';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { CalendarItem } from '../../store/events/types';
import { useEventsStore } from '../../store/events';

interface CalendarWeekViewProps {
  startDate: string;
  items: Record<string, CalendarItem[]>;
  onDateClick: (date: string) => void;
  onEventClick: (event: CalendarItem) => void;
}

const HOUR_HEIGHT = 60; // Height in pixels for each hour
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

const CalendarWeekView: React.FC<CalendarWeekViewProps> = ({ 
  startDate, 
  items,
  onDateClick,
  onEventClick
}) => {
  const { selectedDate } = useEventsStore();
  
  // Generate array of 7 days starting from startDate
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(startDate), i);
    return format(date, 'yyyy-MM-dd');
  });

  // Format time for display
  const formatTimeLabel = (hour: number) => {
    return format(new Date().setHours(hour, 0, 0, 0), 'h a');
  };

  // Calculate position and height for an event
  const calculateEventPosition = (item: CalendarItem) => {
    if (!item.start_time) return { top: 0, height: HOUR_HEIGHT };
    
    const [hours, minutes] = item.start_time.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const startHour = 6; // 6 AM is our first hour
    
    const topPosition = ((startMinutes - startHour * 60) / 60) * HOUR_HEIGHT;
    
    let height = HOUR_HEIGHT;
    if (item.end_time) {
      const [endHours, endMinutes] = item.end_time.split(':').map(Number);
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

      {/* Week grid */}
      <div className="relative">
        <div className="grid grid-cols-8">
          {/* Time labels column */}
          <div className="border-r border-gray-100">
            {HOURS.map((hour) => (
              <div 
                key={hour} 
                className="h-[60px] border-b border-gray-100 px-2 text-right"
              >
                <span className="text-xs text-gray-500 relative -top-2">
                  {formatTimeLabel(hour)}
                </span>
              </div>
            ))}
          </div>
          
          {/* Day columns */}
          {weekDays.map((day) => (
            <div key={day} className="relative">
              {/* Hour grid lines */}
              {HOURS.map((hour) => (
                <div 
                  key={hour} 
                  className="h-[60px] border-b border-gray-100"
                  onClick={() => {
                    const date = new Date(day);
                    date.setHours(hour, 0, 0, 0);
                    onDateClick(format(date, 'yyyy-MM-dd'));
                  }}
                ></div>
              ))}
              
              {/* Events for this day */}
              {items[day]?.map((item) => {
                if (item.all_day) return null; // Skip all-day events for now
                
                const { top, height } = calculateEventPosition(item);
                
                return (
                  <motion.div
                    key={`${item.type}-${item.id}`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute left-0 right-0 mx-1 rounded overflow-hidden shadow-sm border-l-4 z-10 bg-white"
                    style={{ 
                      top: `${top}px`, 
                      height: `${height}px`,
                      borderLeftColor: item.color
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(item);
                    }}
                  >
                    <div className="p-1 text-xs overflow-hidden h-full">
                      <div className="font-medium truncate">{item.title}</div>
                      {item.start_time && (
                        <div className="text-gray-500 truncate">
                          {item.start_time}{item.end_time ? ` - ${item.end_time}` : ''}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* All-day events row */}
        <div className="grid grid-cols-8 border-b border-gray-100 bg-gray-50">
          <div className="p-2 text-xs font-medium text-gray-500 border-r border-gray-100">
            All day
          </div>
          
          {weekDays.map((day) => {
            const allDayItems = items[day]?.filter(item => item.all_day) || [];
            
            return (
              <div key={`allday-${day}`} className="p-1">
                {allDayItems.map((item) => (
                  <div
                    key={`allday-${item.type}-${item.id}`}
                    className="text-xs p-1 mb-1 rounded text-white truncate"
                    style={{ backgroundColor: item.color }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(item);
                    }}
                  >
                    {item.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarWeekView;