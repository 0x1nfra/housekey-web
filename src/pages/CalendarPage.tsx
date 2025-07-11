"use client";

import type React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import SharedCalendarView from "../components/calendar/SharedCalendarView";
import EventCreationModal from "../components/calendar/EventCreationModal";
import { useCalendarData } from "../components/calendar/hooks/useCalendarData";
import { useEventsStore } from "../store/events";
import { useHubStore } from "../store/hub";
import { useAuthStore } from "../store/auth";
import dayjs from "dayjs";
import { Calendar, X } from "lucide-react";

const CalendarPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { currentHub } = useHubStore();
  const { createEvent } = useEventsStore();
  const { error, clearError } = useCalendarData();
  const { user } = useAuthStore();

  const handleEventCreate = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  const handleEventSave = async (eventData: any) => {
    if (!currentHub) {
      console.error("No current hub selected");
      return;
    }
    if (!user) {
      console.error("No user found");
      return;
    }

    try {
      await createEvent(currentHub.id, {
        title: eventData.title,
        description: eventData.notes,
        start_date: dayjs(
          `${eventData.date}T${eventData.startTime}`
        ).toISOString(),
        end_date: dayjs(`${eventData.date}T${eventData.endTime}`).toISOString(),
        location: eventData.location,
        attendees: eventData.assignedTo || [],
        all_day: false,
        event_type: eventData.type,
        reminders: eventData.recurring
          ? [
              {
                user_id: user.id,
                reminder_time: dayjs(`${eventData.date}T${eventData.startTime}`)
                  .subtract(15, "minutes")
                  .toISOString(),
                reminder_type: "in_app" as const,
              },
            ]
          : undefined,
      });

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6 sm:space-y-8"
      >
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sage-green-light rounded-xl flex items-center justify-center">
              <Calendar size={20} className="sm:size-6 text-deep-charcoal" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-deep-charcoal font-interface mb-1 sm:mb-2">
                Family Calendar
              </h1>
              <p className="text-sm sm:text-base text-charcoal-muted font-content">
                Keep everyone in sync with shared scheduling and events
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 sm:p-6 bg-red-50 border border-red-200 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <p className="text-red-700 font-content text-sm sm:text-base">
                {error}
              </p>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 transition-colors duration-300 p-1"
              >
                <X size={18} />
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
