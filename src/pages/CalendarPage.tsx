import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SharedCalendarView from '../components/calendar/SharedCalendarView';
import EventCreationModal from '../components/calendar/EventCreationModal';

const CalendarPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleEventCreate = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleEventSave = (eventData: any) => {
    console.log('Saving event:', eventData);
    setIsModalOpen(false);
  };

  return (
    <div className="px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Family Calendar
            </h1>
            <p className="text-gray-600">
              Keep everyone in sync with shared scheduling
            </p>
          </div>
        </div>

        <SharedCalendarView onEventCreate={handleEventCreate} />

        <EventCreationModal
          isOpen={isModalOpen}
          defaultDate={selectedDate}
          onEventSave={handleEventSave}
          onClose={() => setIsModalOpen(false)}
        />
      </motion.div>
    </div>
  );
};

export default CalendarPage;