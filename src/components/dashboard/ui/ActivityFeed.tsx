"use client";

import type React from "react";
import { motion } from "framer-motion";
import {
  Activity,
  CheckCircle,
  Calendar,
  ShoppingCart,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  member: string;
  action: string;
  timestamp: Date;
  type: "task" | "event" | "shopping" | "member";
}

const ActivityFeed: React.FC = () => {
  const activities: ActivityItem[] = [
    {
      member: "Emma",
      action: 'completed "Feed the cat"',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      type: "task",
    },
    {
      member: "Mike",
      action: 'added "Soccer cleats" to shopping list',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      type: "shopping",
    },
    {
      member: "Sarah",
      action: 'scheduled "Family dinner at Grandma\'s"',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
      type: "event",
    },
    {
      member: "Emma",
      action: "joined the family hub",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      type: "member",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task":
        return CheckCircle;
      case "event":
        return Calendar;
      case "shopping":
        return ShoppingCart;
      case "member":
        return User;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "task":
        return "bg-sage-green-light text-deep-charcoal";
      case "event":
        return "bg-blue-100 text-blue-700";
      case "shopping":
        return "bg-amber-100 text-amber-700";
      case "member":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-charcoal-muted";
    }
  };

  const getMemberAvatar = (member: string) => {
    const avatars: { [key: string]: string } = {
      Sarah: "👩‍💼",
      Mike: "👨‍💻",
      Emma: "👧",
    };
    return avatars[member] || "👤";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="bg-white border border-gray-100 rounded-lg shadow-soft p-6 hover:shadow-medium hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Activity size={20} className="text-blue-700" />
        </div>
        <div>
          <h3 className="font-chivo font-semibold text-deep-charcoal">
            Recent Activity
          </h3>
          <p className="text-sm text-charcoal-muted font-lora">
            See what your family has been up to
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-start gap-4 p-4 rounded-lg transition-colors duration-300 ease-out bg-warm-off-white hover:bg-sage-green-light"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {getMemberAvatar(activity.member)}
                </div>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${getActivityColor(
                    activity.type
                  )}`}
                >
                  <Icon size={16} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-deep-charcoal font-lora">
                  <span className="font-chivo font-medium">
                    {activity.member}
                  </span>{" "}
                  {activity.action}
                </p>
                <p className="text-xs text-charcoal-muted mt-1 font-chivo">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-warm-off-white rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity size={24} className="text-charcoal-muted" />
          </div>
          <p className="text-charcoal-muted text-sm font-lora">
            No recent activity. Start by adding an event or task!
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ActivityFeed;
