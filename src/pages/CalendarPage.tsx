import React, { useState } from "react";
import { motion } from "framer-motion";
import SharedCalendarView from "../components/calendar/SharedCalendarView";
import EventCreationModal from "../components/calendar/EventCreationModal";
import { useCalendarData } from "../components/calendar/hooks/useCalendarData";
import { useEventsStore } from "../store/events";
import { useHubStore } from "../store/hubStore";
import { X } from "lucide-react";

const CalendarPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { currentHub } = useHubStore();
  const { createEvent } = useEventsStore();
  const { error, clearError } = useCalendarData();

  const handleEventCreate = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleEventSave = async (eventData: any) => {
    if (!currentHub) {
      console.error("No current hub selected");
      return;
    }

    try {
      await createEvent(currentHub.id, {
        title: eventData.title,
        description: eventData.notes,
        start_date: new Date(eventData.date + 'T' + eventData.startTime).toISOString(),
        end_date: new Date(eventData.date + 'T' + eventData.endTime).toISOString(),
        location: eventData.location,
        attendees: eventData.assignedTo || [],
        all_day: false,
        event_type: eventData.type,
        reminders: eventData.recurring ? [{
          user_id: currentHub.created_by, // Default to hub creator for now
          reminder_time: new Date(new Date(eventData.date + 'T' + eventData.startTime).getTime() - 15 * 60 * 1000).toISOString(), // 15 minutes before
          reminder_type: 'in_app' as const,
        }] : undefined,
      });
      
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating event:", error);
    }
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

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <p className="text-red-700">{error}</p>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}

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