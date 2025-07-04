import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import dayjs from "dayjs";
import { useHubStore } from "../../store/hub";
import { EventType, EVENT_TYPES, CalendarItem } from "../../store/events/types";
import { getInitials } from "../../utils/userUtils";

interface EventCreationModalProps {
  isOpen: boolean;
  defaultDate: Date;
  existingEvent?: CalendarItem | null;
  onEventSave: (eventData: any) => void;
  onClose: () => void;
}

const EventCreationModal: React.FC<EventCreationModalProps> = ({
  isOpen,
  defaultDate,
  existingEvent,
  onEventSave,
  onClose,
}) => {
  const { hubMembers } = useHubStore();

  const [eventData, setEventData] = useState({
    title: "",
    date: dayjs(defaultDate).format("YYYY-MM-DD"),
    startTime: "09:00",
    endTime: "10:00",
    assignedTo: [] as string[],
    location: "",
    type: "FAMILY" as EventType,
    recurring: false,
    recurrencePattern: "weekly" as "daily" | "weekly" | "monthly" | "yearly",
    notes: "",
  });

  // Initialize form with existing event data if editing
  useEffect(() => {
    if (existingEvent) {
      const startDate = dayjs(existingEvent.date);

      setEventData({
        title: existingEvent.title,
        date: startDate.format("YYYY-MM-DD"),
        startTime: existingEvent.start_time || "09:00",
        endTime: existingEvent.end_time || "10:00",
        assignedTo: existingEvent.assigned_to
          ? [existingEvent.assigned_to]
          : [],
        location: existingEvent.location || "",
        type: (existingEvent.event_type as EventType) || "FAMILY",
        recurring: false, // Set based on your data model
        recurrencePattern: "weekly",
        notes: existingEvent.description || "",
      });
    } else {
      // Reset form for new event
      const formattedDate = dayjs(defaultDate).format("YYYY-MM-DD");
      let startTime = "09:00";
      let endTime = "10:00";

      // If defaultDate includes time information, use it
      if (defaultDate instanceof Date && !isNaN(defaultDate.getTime())) {
        const dateObj = dayjs(defaultDate);
        if (dateObj.hour() !== 0 || dateObj.minute() !== 0) {
          startTime = dateObj.format("HH:mm");
          endTime = dateObj.add(1, "hour").format("HH:mm");
        }
      }

      setEventData({
        title: "",
        date: formattedDate,
        startTime: startTime,
        endTime: endTime,
        assignedTo: [] as string[],
        location: "",
        type: "FAMILY" as EventType,
        recurring: false,
        recurrencePattern: "weekly" as
          | "daily"
          | "weekly"
          | "monthly"
          | "yearly",
        notes: "",
      });
    }
  }, [existingEvent, defaultDate, isOpen]);

  // Get available assignees (hub members)
  const availableAssignees = hubMembers.map((member) => ({
    id: member.user_id,
    name: member.user_profile?.name || "Unknown User",
    avatar: getInitials(member.user_profile?.name || "U"),
  }));

  const eventTypeOptions = Object.entries(EVENT_TYPES).map(([key, value]) => ({
    value: key as EventType,
    label: value.label,
    color: value.color,
  }));

  const handleInputChange = (field: string, value: any) => {
    setEventData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMemberToggle = (memberId: string) => {
    setEventData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(memberId)
        ? prev.assignedTo.filter((id) => id !== memberId)
        : [...prev.assignedTo, memberId],
    }));
  };

  const handleSave = () => {
    onEventSave(eventData);
    // Reset form
    setEventData({
      title: "",
      date: dayjs(new Date()).format("YYYY-MM-DD"),
      startTime: "09:00",
      endTime: "10:00",
      assignedTo: [],
      location: "",
      type: "FAMILY",
      recurring: false,
      recurrencePattern: "weekly",
      notes: "",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {existingEvent ? "Edit Event" : "Create New Event"}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Event Title */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={eventData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter event title"
                />
              </div>

              {/* Event Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Event Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {eventTypeOptions.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleInputChange("type", type.value)}
                      className={`p-3 border rounded-lg transition-colors ${
                        eventData.type === type.value
                          ? "border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                      }`}
                      style={{
                        borderColor:
                          eventData.type === type.value
                            ? type.color
                            : undefined,
                        backgroundColor:
                          eventData.type === type.value
                            ? `${type.color}15`
                            : undefined,
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 text-white"
                        style={{ backgroundColor: type.color }}
                      >
                        {type.value.charAt(0)}
                      </div>
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={eventData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={eventData.startTime}
                    onChange={(e) =>
                      handleInputChange("startTime", e.target.value)
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={eventData.endTime}
                    onChange={(e) =>
                      handleInputChange("endTime", e.target.value)
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Assign to Family Members */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Assign to Family Members
                </label>
                <div className="flex flex-wrap gap-3">
                  {availableAssignees.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleMemberToggle(member.id)}
                      className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                        eventData.assignedTo.includes(member.id)
                          ? "border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300"
                          : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-medium text-gray-700 dark:text-gray-300">
                        {member.avatar}
                      </div>
                      <span className="font-medium">{member.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={eventData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 pl-10 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="Enter location (optional)"
                  />
                </div>
              </div>

              {/* Recurring Event */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={eventData.recurring}
                    onChange={(e) =>
                      handleInputChange("recurring", e.target.checked)
                    }
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="recurring"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Recurring Event
                  </label>
                </div>

                {eventData.recurring && (
                  <select
                    value={eventData.recurrencePattern}
                    onChange={(e) =>
                      handleInputChange("recurrencePattern", e.target.value)
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Notes
                </label>
                <textarea
                  value={eventData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Add any additional notes..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={!eventData.title}
                className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {existingEvent ? "Save Changes" : "Create Event"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventCreationModal;
