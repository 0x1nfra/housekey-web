import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, MapPin, Users, Repeat } from "lucide-react";
import { format } from "date-fns";

interface EventCreationModalProps {
  isOpen: boolean;
  defaultDate: Date;
  onEventSave: (eventData: any) => void;
  onClose: () => void;
}

/*
FIXME:
1. change to dayjs
2. move types to type folders
*/

const EventCreationModal: React.FC<EventCreationModalProps> = ({
  isOpen,
  defaultDate,
  onEventSave,
  onClose,
}) => {
  const [eventData, setEventData] = useState({
    title: "",
    date: format(defaultDate, "yyyy-MM-dd"),
    startTime: "09:00",
    endTime: "10:00",
    assignedTo: [] as string[],
    location: "",
    type: "activity" as "appointment" | "chore" | "activity",
    recurring: false,
    recurrencePattern: "weekly" as "daily" | "weekly" | "monthly",
    notes: "",
  });

  const familyMembers = [
    { id: "1", name: "Sarah", avatar: "👩‍💼" },
    { id: "2", name: "Mike", avatar: "👨‍💻" },
    { id: "3", name: "Emma", avatar: "👧" },
  ];

  const eventTypes = [
    {
      value: "appointment",
      label: "Appointment",
      icon: Calendar,
      color: "bg-indigo-100 text-indigo-700",
    },
    {
      value: "activity",
      label: "Activity",
      icon: Users,
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      value: "chore",
      label: "Chore",
      icon: Clock,
      color: "bg-amber-100 text-amber-700",
    },
  ];

  const handleInputChange = (field: string, value: any) => {
    setEventData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMemberToggle = (memberName: string) => {
    setEventData((prev) => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(memberName)
        ? prev.assignedTo.filter((name) => name !== memberName)
        : [...prev.assignedTo, memberName],
    }));
  };

  const handleSave = () => {
    onEventSave(eventData);
    // Reset form
    setEventData({
      title: "",
      date: format(new Date(), "yyyy-MM-dd"),
      startTime: "09:00",
      endTime: "10:00",
      assignedTo: [],
      location: "",
      type: "activity",
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
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Create New Event
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Event Title */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={eventData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter event title"
                />
              </div>

              {/* Event Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Event Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {eventTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => handleInputChange("type", type.value)}
                      className={`p-3 border rounded-lg transition-colors ${
                        eventData.type === type.value
                          ? "border-indigo-300 bg-indigo-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2 ${type.color}`}
                      >
                        <type.icon size={16} />
                      </div>
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={eventData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={eventData.startTime}
                    onChange={(e) =>
                      handleInputChange("startTime", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={eventData.endTime}
                    onChange={(e) =>
                      handleInputChange("endTime", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Assign to Family Members */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Assign to Family Members
                </label>
                <div className="flex flex-wrap gap-3">
                  {familyMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleMemberToggle(member.name)}
                      className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                        eventData.assignedTo.includes(member.name)
                          ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-lg">{member.avatar}</span>
                      <span className="font-medium">{member.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Location
                </label>
                <div className="relative">
                  <MapPin
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={eventData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
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
                    className="text-sm font-medium text-gray-700"
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Notes
                </label>
                <textarea
                  value={eventData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Add any additional notes..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
                Create Event
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventCreationModal;
