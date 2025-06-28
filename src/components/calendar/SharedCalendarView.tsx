import React, { useState, useEffect } from "react";
import { useCalendarData } from "./hooks/useCalendarData";
import { useEventsStore } from "../../store/events";
import CalendarFilters from "./CalendarFilters";
import CalendarDayView from "./CalendarDayView";
import CalendarWeekView from "./CalendarWeekView";
import CalendarMonthView from "./CalendarMonthView";
import CalendarHeader from "./CalendarHeader";
import EventPreviewModal from "./modals/EventPreviewModal";
import EventCreationModal from "./EventCreationModal";
import { CalendarItem } from "../../store/events/types";
import dayjs from "dayjs";

const SharedCalendarView: React.FC = () => {
  const {
    calendarMonth,
    selectedDateItems,
    weekItems,
    loading,
    selectedDate,
    calendarView,
  } = useCalendarData();

  const { setSelectedDate, setCalendarView } = useEventsStore();
  const { deleteEvent, updateEvent, createEvent, currentHub } = useEventsStore(
    (state) => ({
      deleteEvent: state.deleteEvent,
      updateEvent: state.updateEvent,
      createEvent: state.createEvent,
      currentHub: state.currentHub,
    })
  );

  const [currentDate, setCurrentDate] = useState(new Date(selectedDate));
  const [selectedEvent, setSelectedEvent] = useState<CalendarItem | null>(null);
  const [showEventPreview, setShowEventPreview] = useState(false);
  const [showEventCreationModal, setShowEventCreationModal] = useState(false);
  const [eventModalDate, setEventModalDate] = useState<Date>(new Date());

  useEffect(() => {
    setCurrentDate(new Date(selectedDate));
  }, [selectedDate]);

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
    setSelectedDate(date.toISOString().split("T")[0]);
  };

  const handleViewChange = (view: "month" | "week" | "day") => {
    setCalendarView(view);
  };

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
  };

  const handleEventClick = (item: CalendarItem) => {
    setSelectedEvent(item);
    setShowEventPreview(true);
  };

  const handleCloseEventPreview = () => {
    setShowEventPreview(false);
    setSelectedEvent(null);
  };

  const handleEventEdit = (event: CalendarItem) => {
    setShowEventPreview(false);
    setSelectedEvent(event);
    setEventModalDate(new Date(event.date));
    setShowEventCreationModal(true);
  };

  const handleTimeSlotClick = (date: string, hour: number, minute: number) => {
    // Create a date object with the clicked time
    const clickedDate = dayjs(date)
      .hour(hour)
      .minute(minute)
      .second(0)
      .toDate();

    setEventModalDate(clickedDate);
    setSelectedEvent(null);
    setShowEventCreationModal(true);
  };

  // Get the start date for the week view (Sunday)
  const getWeekStartDate = () => {
    // Use the current date to get the start of the week (Sunday)
    const date = dayjs(currentDate);
    return date.startOf("week").format("YYYY-MM-DD");
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

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <CalendarHeader
        currentView={calendarView}
        currentDate={currentDate}
        onViewChange={handleViewChange}
        onDateChange={handleDateChange}
        onCreateEvent={() => {
          setEventModalDate(currentDate);
          setSelectedEvent(null);
          setShowEventCreationModal(true);
        }}
      />

      {/* Filters */}
      <CalendarFilters />

      {/* Calendar View */}
      {calendarView === "month" && calendarMonth && (
        <CalendarMonthView
          calendarMonth={calendarMonth}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />
      )}

      {calendarView === "week" && (
        <CalendarWeekView
          startDate={getWeekStartDate()}
          items={weekItems}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
          onEventEdit={handleEventEdit}
          onTimeSlotClick={handleTimeSlotClick}
        />
      )}

      {calendarView === "day" && (
        <CalendarDayView
          date={selectedDate}
          items={selectedDateItems}
          onEventClick={handleEventClick}
          onEventEdit={handleEventEdit}
          onTimeSlotClick={handleTimeSlotClick}
        />
      )}

      {/* Event Preview Modal */}
      {selectedEvent && (
        <EventPreviewModal
          event={selectedEvent}
          isOpen={showEventPreview}
          onClose={handleCloseEventPreview}
          onEdit={handleEventEdit}
          onDelete={async (eventId) => {
            handleCloseEventPreview();
            if (selectedEvent.type === "event") {
              await deleteEvent(eventId);
            }
          }}
        />
      )}

      {/* Event Creation/Edit Modal */}
      <EventCreationModal
        isOpen={showEventCreationModal}
        defaultDate={eventModalDate}
        existingEvent={selectedEvent}
        onEventSave={async (eventData) => {
          // Validate date and time formats
          const isValidDate = (dateStr: string) =>
            /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
          const isValidTime = (timeStr: string) =>
            /^\d{2}:\d{2}$/.test(timeStr);
          if (
            !isValidDate(eventData.date) ||
            !isValidTime(eventData.startTime) ||
            !isValidTime(eventData.endTime)
          ) {
            alert(
              "Invalid date or time format. Please use YYYY-MM-DD for date and HH:MM for time."
            );
            return;
          }
          // If we have a selected event, we're editing
          if (selectedEvent && selectedEvent.type === "event") {
            await updateEvent(selectedEvent.id, {
              title: eventData.title,
              description: eventData.notes,
              start_date: new Date(
                eventData.date + "T" + eventData.startTime
              ).toISOString(),
              end_date: new Date(
                eventData.date + "T" + eventData.endTime
              ).toISOString(),
              location: eventData.location,
              attendees: eventData.assignedTo || [],
              all_day: false,
              event_type: eventData.type,
            });
          } else {
            // Otherwise we're creating a new event
            if (!currentHub) {
              alert(
                "No hub selected. Please select a hub before creating an event."
              );
              return;
            }
            if (currentDate) {
              await createEvent(currentHub, {
                title: eventData.title,
                description: eventData.notes,
                start_date: new Date(
                  eventData.date + "T" + eventData.startTime
                ).toISOString(),
                end_date: new Date(
                  eventData.date + "T" + eventData.endTime
                ).toISOString(),
                location: eventData.location,
                attendees: eventData.assignedTo || [],
                all_day: false,
                event_type: eventData.type,
              });
            }
          }
          setShowEventCreationModal(false);
          setSelectedEvent(null);
        }}
        onClose={() => {
          setShowEventCreationModal(false);
          setSelectedEvent(null);
        }}
      />
    </div>
  );
};

export default SharedCalendarView;
