import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";
import { useNotificationsStore } from "../../../store/notifications";
import { useAuthStore } from "../../../store/authStore";
import { shallow } from "zustand/shallow";

interface NotificationBadgeProps {
  className?: string;
  size?: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  className = "",
  size = 20,
}) => {
  const { user } = useAuthStore(
    (state) => ({
      user: state.user,
    }),
    shallow
  );

  const { unreadCount, fetchUnreadCount } = useNotificationsStore(
    (state) => ({
      unreadCount: state.unreadCount,
      fetchUnreadCount: state.fetchUnreadCount,
    }),
    shallow
  );

  // Fetch unread count on mount
  useEffect(() => {
    if (user) {
      fetchUnreadCount(user.id).catch((error) => {
        console.error("Failed to fetch unread count:", error);
      });
    }
  }, [user, fetchUnreadCount]);

  return (
    <div className={`relative ${className}`}>
      <Bell size={size} />
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBadge;
