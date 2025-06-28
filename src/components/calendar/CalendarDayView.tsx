import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { CalendarItem } from '../../store/events/types';
import { Clock, MapPin, User, Tag, Trash2 } from 'lucide-react';
import { useEventsStore } from '../../store/events';

interface CalendarDayViewProps {
  date: string;
  items: CalendarItem[];
}

const CalendarDayView: React.FC<CalendarDayViewProps> = ({ date, items }) => {
  const { deleteEvent } = useEventsStore();
  
  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(eventId);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
        <p className="text-gray-500">No items scheduled for this day</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="font-semibold text-gray-900">
          {format(new Date(date), 'EEEE, MMMM d, yyyy')}
        </h3>
      </div>

      <div className="divide-y divide-gray-100">
        {items.map((item) => (
          <motion.div
            key={`${item.type}-${item.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start gap-4">
              {/* Time column */}
              <div className="w-20 text-center">
                {item.all_day ? (
                  <span className="text-xs font-medium bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                    All Day
                  </span>
                ) : item.start_time ? (
                  <div className="text-sm font-medium text-gray-900">
                    {item.start_time}
                    {item.end_time && (
                      <>
                        <br />
                        <span className="text-gray-500">to {item.end_time}</span>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-sm font-medium text-gray-500">--:--</div>
                )}
              </div>

              {/* Color indicator */}
              <div
                className="w-1 self-stretch rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.type === 'event' ? item.event_type : `Priority ${item.priority}`}
                    </span>
                  </div>
                  
                  {item.type === 'event' && (
                    <button
                      onClick={() => handleDeleteEvent(item.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                      title="Delete event"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {item.description && (
                  <p className="text-sm text-gray-600 mt-1 mb-2">{item.description}</p>
                )}

                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-2">
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

                  {item.type === 'task' && item.priority && (
                    <div className="flex items-center gap-1">
                      <Tag size={12} />
                      <span>Priority {item.priority}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CalendarDayView;