"use client";

import type React from "react";
import { motion } from "framer-motion";
import { Clock, CheckSquare, TrendingUp } from "lucide-react";

interface Event {
  id: string;
  title: string;
  time: string;
  assignedTo: string;
  type: "appointment" | "activity" | "reminder";
}

interface Task {
  id: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
}

interface ActivityProps {
  events: Event[];
  tasks: Task[];
}

const Activity: React.FC<ActivityProps> = ({ events, tasks }) => {
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Chart Container - spans 2 columns */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="lg:col-span-2 bg-white border border-gray-100 rounded-lg shadow-soft p-6"
      >
        <h3 className="font-semibold text-deep-charcoal font-chivo mb-4">
          Hub Activity Overview
        </h3>

        {/* Mock chart area */}
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
          <div className="text-center">
            <TrendingUp size={48} className="text-sage-green mx-auto mb-2" />
            <p className="text-charcoal-muted font-lora">
              Activity chart would go here
            </p>
          </div>
        </div>
      </motion.div>

      {/* Activity Table Container - spans 1 column */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white border border-gray-100 rounded-lg shadow-soft p-6"
      >
        <h3 className="font-semibold text-deep-charcoal font-chivo mb-4">
          Recent Activity
        </h3>

        <div className="space-y-3">
          {events.slice(0, 3).map((event) => (
            <div
              key={event.id}
              className="bg-warm-off-white flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
            >
              <Clock size={16} className="text-charcoal-muted" />
              <div className="bglex-1 min-w-0">
                <p className="font-medium text-deep-charcoal text-sm font-chivo truncate">
                  {event.title}
                </p>
                <p className="text-xs text-charcoal-muted font-lora">
                  {formatTime(event.time)} • {event.assignedTo}
                </p>
              </div>
            </div>
          ))}

          {tasks.slice(0, 2).map((task) => (
            <div
              key={task.id}
              className="bg-warm-off-white  flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
            >
              <CheckSquare size={16} className="text-charcoal-muted" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-deep-charcoal text-sm font-chivo truncate">
                  {task.title}
                </p>
                <p className="text-xs text-charcoal-muted font-lora">
                  {task.assignedTo} • {task.priority} priority
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Activity;
