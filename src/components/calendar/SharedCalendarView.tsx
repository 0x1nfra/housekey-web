import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';

interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  assignedTo: string[];
  type: 'appointment' | 'chore' | 'activity';
  recurring: boolean;
  location?: string;
}

interface SharedCalendarViewProps {
  onEventCreate: (date: Date) => void;
}

const SharedCalendarView: React.FC<SharedCalendarViewProps> = ({ onEventCreate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Mock events data
  const events: Event[] = [
    {
      id: '1',
      title: 'Soccer Practice',
      startTime: '2024-01-15T16:00:00Z',
      endTime: '2024-01-15T17:30:00Z',
      assignedTo: ['Emma'],
      type: 'activity',
      recurring: true,
      location: 'Community Center'
    },
    {
      id: '2',
      title: 'Dentist Appointment',
      startTime: '2024-01-16T14:30:00Z',
      endTime: '2024-01-16T15:30:00Z',
      assignedTo: ['Sarah'],
      type: 'appointment',
      recurring: false,
      location: 'Downtown Dental'
    }
  ];

  const familyMembers = [
    { id: '1', name: 'Sarah', color: 'bg-indigo-500' },
    { id: '2', name: 'Mike', color: 'bg-emerald-500' },
    { id: '3', name: 'Emma', color: 'bg-amber-500' }
  ];

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(new Date(event.startTime), date)
    );
  };

  const getMemberColor = (memberName: string) => {
    const member = familyMembers.find(m => m.name === memberName);
    return member?.color || 'bg-gray-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Calendar Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateMonth('prev')}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronLeft size={16} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateMonth('next')}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {familyMembers.map(member => (
                <div key={member.id} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${member.color}`} />
                  <span className="text-sm text-gray-600">{member.name}</span>
                </div>
              ))}
            </div>
            
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
          {(['month', 'week', 'day'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors capitalize ${
                viewMode === mode
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
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
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-4">
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isDayToday = isToday(day);

            return (
              <motion.div
                key={day.toISOString()}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                onClick={() => onEventCreate(day)}
                className={`min-h-[120px] p-3 border border-gray-100 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors ${
                  !isCurrentMonth ? 'opacity-50' : ''
                } ${isDayToday ? 'bg-indigo-50 border-indigo-200' : 'hover:bg-gray-50'}`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isDayToday ? 'text-indigo-700' : 'text-gray-900'
                }`}>
                  {format(day, 'd')}
                </div>

                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded text-white truncate ${
                        getMemberColor(event.assignedTo[0])
                      }`}
                    >
                      {event.title}
                    </div>
                  ))}
                  
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 3} more
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

export default SharedCalendarView;