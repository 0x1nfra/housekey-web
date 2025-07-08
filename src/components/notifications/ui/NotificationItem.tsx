"use client";

import type React from "react";
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
import type { Notification } from "../../../store/notifications/types";
import { formatDistanceToNow } from "date-fns";

interface NotificationItemProps {
  notification: Notification;
  compact?: boolean;
  onClose?: () => void;
}

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

  const getNotificationColor = () => {
    switch (notification.type) {
      case "event":
        return "bg-blue-100 text-blue-700";
      case "task":
        return "bg-sage-green-light text-deep-charcoal";
      case "system":
      default:
        return "bg-gray-100 text-charcoal-muted";
    }
  };

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
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ backgroundColor: "var(--sage-green-light)" }}
      onClick={handleClick}
      className={`p-4 cursor-pointer transition-all duration-300 ease-out rounded-lg ${
        notification.read
          ? "bg-white"
          : "bg-sage-green-light border-l-4 border-sage-green"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}
        >
          <Icon size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h4
              className={`font-chivo font-medium text-sm ${
                notification.read ? "text-charcoal-muted" : "text-deep-charcoal"
              }`}
            >
              {notification.title}
            </h4>
            <span className="text-xs text-charcoal-muted whitespace-nowrap flex-shrink-0 font-chivo">
              {timeAgo}
            </span>
          </div>

          <p
            className={`text-sm mb-3 line-clamp-2 font-lora ${
              notification.read ? "text-charcoal-muted" : "text-deep-charcoal"
            }`}
          >
            {renderNotificationMessage(notification)}
          </p>

          {!compact && notification.actor_name && (
            <div className="flex items-center gap-2 mb-3 text-xs text-charcoal-muted">
              <User size={14} />
              <span className="font-chivo">{notification.actor_name}</span>
            </div>
          )}

          {!compact && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-charcoal-muted">
                <Clock size={14} />
                <span className="font-chivo">
                  {new Date(notification.created_at).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {!notification.read && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleMarkAsRead}
                    className="p-2 text-sage-green hover:bg-sage-green hover:text-deep-charcoal rounded-lg transition-all duration-300 ease-out"
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDelete}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300 ease-out"
                  title="Delete notification"
                >
                  <Trash2 size={16} />
                </motion.button>

                {notification.actionable && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClick}
                    className="p-2 text-deep-charcoal hover:bg-sage-green-light rounded-lg transition-all duration-300 ease-out"
                    title="View details"
                  >
                    <ExternalLink size={16} />
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
