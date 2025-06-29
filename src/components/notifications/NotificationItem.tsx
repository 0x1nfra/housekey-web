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
import { useNotificationsStore } from "../../store/notifications";
import { Notification, NOTIFICATION_COLORS } from "../../store/notifications/types";
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
    return NOTIFICATION_COLORS[notification.type];
  };

  const handleClick = () => {
    console.log('Notification clicked:', notification);
    
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate to related item if applicable
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
        default:
          // No specific navigation
          break;
      }
    }

    // Close dropdown if provided
    if (onClose) {
      onClose();
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Marking notification as read:', notification.id);
    markAsRead(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Deleting notification:', notification.id);
    deleteNotification(notification.id);
  };

  const Icon = getNotificationIcon();
  const colorClass = getNotificationColor();
  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      whileHover={{ backgroundColor: "rgb(249, 250, 251)" }}
      onClick={handleClick}
      className={`p-4 cursor-pointer transition-colors ${
        notification.read ? "bg-white" : "bg-blue-50"
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
                notification.read ? "text-gray-700" : "text-gray-900"
              }`}
            >
              {notification.title}
            </h4>
            <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
              {timeAgo}
            </span>
          </div>

          <p
            className={`text-xs ${
              notification.read ? "text-gray-500" : "text-gray-700"
            } line-clamp-2 mt-0.5`}
          >
            {notification.message}
          </p>

          {!compact && notification.actor_name && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
              <User size={12} />
              <span>{notification.actor_name}</span>
            </div>
          )}

          {!compact && (
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock size={12} />
                <span>{new Date(notification.created_at).toLocaleString()}</span>
              </div>

              <div className="flex items-center gap-1">
                {!notification.read && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleMarkAsRead}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Mark as read"
                  >
                    <Check size={14} />
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDelete}
                  className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Delete notification"
                >
                  <Trash2 size={14} />
                </motion.button>

                {notification.actionable && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClick}
                    className="p-1 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
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