"use client";

import type React from "react";
import { motion } from "framer-motion";
import { Calendar, CheckSquare, Users, Clock, TrendingUp } from "lucide-react";

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

interface DashboardViewProps {
  designVariation: "A" | "B";
}

const DashboardView: React.FC<DashboardViewProps> = ({ designVariation }) => {
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

  const getCardClasses = () => {
    return designVariation === "A"
      ? "bg-white border border-gray-100 rounded-lg shadow-soft p-6"
      : "bg-blue border border-gray-200 rounded-lg shadow-soft p-6";
  };

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // const getPriorityColor = (priority: string) => {
  //   const base = {
  //     high: "text-red-600 bg-red-50",
  //     medium: "text-amber-600 bg-amber-50",
  //     low: "text-green-600 bg-green-50",
  //     default: "text-gray-600 bg-gray-50",
  //   };
  //   return base[priority as keyof typeof base] || base.default;
  // };

  // Stats data for the new design
  const stats = [
    {
      id: "events",
      title: "Today's Events",
      value: todayEvents.length.toString(),
      change: "+2 from yesterday",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      id: "tasks",
      title: "Pending Tasks",
      value: pendingTasks.length.toString(),
      change: "-1 from yesterday",
      icon: CheckSquare,
      color: "text-sage-green-dark",
      bgColor: "bg-sage-green-light",
    },
    {
      id: "members",
      title: "Active Members",
      value: householdMembers.length.toString(),
      change: "All online",
      icon: Users,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      id: "completion",
      title: "Task Completion",
      value: "87%",
      change: "+5% this week",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid - 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            className={getCardClasses()}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}
              >
                <stat.icon size={20} className={stat.color} />
              </div>
            </div>
            <div>
              <p className="text-sm text-charcoal-muted font-chivo mb-1">
                {stat.title}
              </p>
              <p className="text-3xl font-semibold text-deep-charcoal font-chivo mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-sage-green-dark font-lora">
                {stat.change}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid - 3 columns */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart Container - spans 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className={`lg:col-span-2 ${getCardClasses()}`}
        >
          <h3 className="font-semibold text-deep-charcoal font-chivo mb-4">
            Family Activity Overview
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
          className={getCardClasses()}
        >
          <h3 className="font-semibold text-deep-charcoal font-chivo mb-4">
            Recent Activity
          </h3>

          <div className="space-y-3">
            {todayEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
              >
                <Clock size={16} className="text-charcoal-muted" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-deep-charcoal text-sm font-chivo truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-charcoal-muted font-lora">
                    {formatTime(event.time)} • {event.assignedTo}
                  </p>
                </div>
              </div>
            ))}

            {pendingTasks.slice(0, 2).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
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
    </div>
  );
};

export default DashboardView;
