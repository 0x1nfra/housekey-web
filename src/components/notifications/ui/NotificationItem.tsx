import React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckSquare,
  Bell,
  Check,
  Trash2,
  ExternalLink,
  Clock,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotificationsStore } from "../../../store/notifications";
import {
  Notification,
  NOTIFICATION_COLORS,
} from "../../../store/notifications/types";
import { formatDistanceToNow } from "date-fns";

interface NotificationItemProps {
  notification: Notification;
  compact?: boolean;
  onClose?: () => void;
}

// ... imports remain unchanged

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  compact = false,
  onClose,
}) => {
  const navigate = useNavigate();
  const { markAsRead, deleteNotification } = useNotificationsStore();

  const getNotificationIcon = () => {
    switch (notification.type) {
      case "event":
        return Calendar;
      case "task":
        return CheckSquare;
      case "system":
      default:
        return Bell;
    }
  };

  const getNotificationColor = () => NOTIFICATION_COLORS[notification.type];

  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.related_id && notification.related_type) {
      switch (notification.related_type) {
        case "event":
          navigate(`/calendar?event=${notification.related_id}`);
          break;
        case "task":
          navigate(`/tasks?task=${notification.related_id}`);
          break;
        case "hub_invitation":
          navigate(`/settings?tab=invitations`);
          break;
      }
    }

    if (onClose) onClose();
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  const Icon = getNotificationIcon();
  const colorClass = getNotificationColor();
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
  });

  const renderNotificationMessage = (notification: Notification) => {
    const { message, type } = notification;

    const messagePatterns = {
      task: {
        completed: {
          pattern: /^(.+) completed a task: (.+)$/,
          render: (m: RegExpMatchArray) => (
            <>
              {m[1]} completed a task: <strong>{m[2]}</strong>
            </>
          ),
        },
        assigned: {
          pattern: /^(.+) assigned you a task: (.+)$/,
          render: (m: RegExpMatchArray) => (
            <>
              {m[1]} assigned you a task: <strong>{m[2]}</strong>
            </>
          ),
        },
        dueToday: {
          pattern: /^Task "(.+)" is due today$/,
          render: (m: RegExpMatchArray) => (
            <>
              Task <strong>"{m[1]}"</strong> is due today
            </>
          ),
        },
      },
      event: {
        reminder: {
          pattern: /^Reminder: (.+) starts in (\d+) minutes?$/,
          render: (m: RegExpMatchArray) => (
            <>
              Reminder: <strong>{m[1]}</strong> starts in {m[2]} minutes
            </>
          ),
        },
        invitation: {
          pattern: /^(.+) invited you to "(.+)"$/,
          render: (m: RegExpMatchArray) => (
            <>
              {m[1]} invited you to <strong>"{m[2]}"</strong>
            </>
          ),
        },
      },
      system: {
        hubInvite: {
          pattern: /^(.+) invited you to join "(.+)" hub$/,
          render: (m: RegExpMatchArray) => (
            <>
              {m[1]} invited you to join <strong>"{m[2]}"</strong> hub
            </>
          ),
        },
      },
    };

    const typePatterns = messagePatterns[type as keyof typeof messagePatterns];
    if (typePatterns) {
      for (const { pattern, render } of Object.values(typePatterns)) {
        const match = message.match(pattern);
        if (match) return render(match);
      }
    }

    return message;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      whileHover={{ backgroundColor: "var(--tw-bg-opacity)" }}
      onClick={handleClick}
      className={`p-4 cursor-pointer transition-colors ${
        notification.read
          ? "bg-white dark:bg-gray-800"
          : "bg-blue-50 dark:bg-blue-900/20"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
        >
          <Icon size={16} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`font-medium text-sm ${
                notification.read
                  ? "text-gray-700 dark:text-gray-300"
                  : "text-gray-900 dark:text-white"
              }`}
            >
              {notification.title}
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
              {timeAgo}
            </span>
          </div>

          <p
            className={`text-xs mt-0.5 line-clamp-2 ${
              notification.read
                ? "text-gray-500 dark:text-gray-400"
                : "text-gray-700 dark:text-gray-200"
            }`}
          >
            {renderNotificationMessage(notification)}
          </p>

          {!compact && notification.actor_name && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <User size={12} />
              <span>{notification.actor_name}</span>
            </div>
          )}

          {!compact && (
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock size={12} />
                <span>
                  {new Date(notification.created_at).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {!notification.read && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleMarkAsRead}
                    className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
                    title="Mark as read"
                  >
                    <Check size={14} />
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDelete}
                  className="p-1 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                  title="Delete notification"
                >
                  <Trash2 size={14} />
                </motion.button>

                {notification.actionable && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClick}
                    className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-full transition-colors"
                    title="View details"
                  >
                    <ExternalLink size={14} />
                  </motion.button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationItem;
