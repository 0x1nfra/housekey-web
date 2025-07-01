import React from "react";
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

/*
FIXME:
1. change to dayjs
2. move types to type folders
*/

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
        return "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400";
      case "event":
        return "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400";
      case "shopping":
        return "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400";
      case "member":
        return "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
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
      className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
          <Activity size={20} className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
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
              className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
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
                <p className="text-sm text-gray-900 dark:text-white">
                  <span className="font-medium">{activity.member}</span>{" "}
                  {activity.action}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity size={24} className="text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No recent activity. Start by adding an event or task!
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default ActivityFeed;
