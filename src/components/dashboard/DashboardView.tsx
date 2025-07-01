import React from "react";
import { motion } from "framer-motion";
import { Calendar, CheckSquare, Users, Clock } from "lucide-react";

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

interface Member {
  id: string;
  name: string;
  role: "parent" | "child" | "roommate";
  avatar: string;
  lastActive: string;
}

/*
TODO:
- hook up to functions
- load dynamic data from db
- break down ui components
*/

const DashboardView: React.FC = () => {
  const todayEvents: Event[] = [
    {
      id: "1",
      title: "Soccer Practice",
      time: "2024-01-15T16:00:00Z",
      assignedTo: "Emma",
      type: "activity",
    },
    {
      id: "2",
      title: "Dentist Appointment",
      time: "2024-01-15T14:30:00Z",
      assignedTo: "Mom",
      type: "appointment",
    },
  ];

  const pendingTasks: Task[] = [
    {
      id: "1",
      title: "Take out trash",
      assignedTo: "Dad",
      dueDate: "2024-01-15",
      priority: "high",
    },
    {
      id: "2",
      title: "Feed the cat",
      assignedTo: "Emma",
      dueDate: "2024-01-15",
      priority: "medium",
    },
  ];

  const householdMembers: Member[] = [
    {
      id: "1",
      name: "Sarah",
      role: "parent",
      avatar: "👩‍💼",
      lastActive: "2024-01-15T08:00:00Z",
    },
    {
      id: "2",
      name: "Mike",
      role: "parent",
      avatar: "👨‍💻",
      lastActive: "2024-01-15T07:30:00Z",
    },
    {
      id: "3",
      name: "Emma",
      role: "child",
      avatar: "👧",
      lastActive: "2024-01-15T07:45:00Z",
    },
  ];

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getPriorityColor = (priority: string) => {
    const base = {
      high: "text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400",
      medium:
        "text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400",
      low: "text-green-600 bg-green-50 dark:bg-green-500/10 dark:text-green-400",
      default: "text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-300",
    };
    return base[priority as keyof typeof base] || base.default;
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Today's Events */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center">
            <Calendar
              size={20}
              className="text-indigo-600 dark:text-indigo-400"
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Today's Events
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {todayEvents.length} scheduled
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {todayEvents.map((event) => (
            <div
              key={event.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {event.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(event.time)} • {event.assignedTo}
                </p>
              </div>
              <Clock size={16} className="text-gray-400 dark:text-gray-500" />
            </div>
          ))}

          {todayEvents.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
              No events scheduled for today
            </p>
          )}
        </div>
      </motion.div>

      {/* Pending Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg flex items-center justify-center">
            <CheckSquare
              size={20}
              className="text-emerald-600 dark:text-emerald-400"
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Pending Tasks
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {pendingTasks.length} remaining
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {pendingTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {task.title}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Assigned to {task.assignedTo}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
            </div>
          ))}

          {pendingTasks.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
              All tasks completed! 🎉
            </p>
          )}
        </div>
      </motion.div>

      {/* Family Members */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-lg flex items-center justify-center">
            <Users size={20} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Family Members
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {householdMembers.length} active
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {householdMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div className="text-2xl">{member.avatar}</div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white text-sm">
                  {member.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {member.role}
                </p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardView;
