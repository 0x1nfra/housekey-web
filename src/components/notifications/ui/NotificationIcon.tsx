"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Trash2 } from "lucide-react";
import { useNotificationsStore } from "../../../store/notifications";
import { useAuthStore } from "../../../store/auth";
import { shallow } from "zustand/shallow";
import NotificationItem from "./NotificationItem";

const NotificationIcon: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user } = useAuthStore(
    (state) => ({
      user: state.user,
    }),
    shallow
  );

  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    fetchUnreadCount,
    markAllAsRead,
    clearAllNotifications,
  } = useNotificationsStore(
    (state) => ({
      notifications: state.notifications,
      unreadCount: state.unreadCount,
      loading: state.loading,
      fetchNotifications: state.fetchNotifications,
      fetchUnreadCount: state.fetchUnreadCount,
      markAllAsRead: state.markAllAsRead,
      clearAllNotifications: state.clearAllNotifications,
    }),
    shallow
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      fetchUnreadCount(user.id);
    }
  }, [user, fetchUnreadCount]);

  const handleToggle = async () => {
    if (!isOpen && user) {
      await fetchNotifications(user.id);
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAllAsRead = async () => {
    if (user) {
      await markAllAsRead(user.id);
    }
  };

  const handleClearAll = async () => {
    if (user) {
      await clearAllNotifications(user.id);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        className="relative p-2 text-charcoal-muted hover:text-deep-charcoal hover:bg-sage-green-light rounded-lg transition-colors"
      >
        <Bell size={24} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1 font-chivo font-medium"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-medium border border-gray-100 z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-chivo font-semibold text-deep-charcoal">
                  Notifications
                </h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleMarkAllAsRead}
                      className="p-1 text-sage-green hover:bg-sage-green-light rounded transition-colors"
                      title="Mark all as read"
                    >
                      <Check size={16} />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleClearAll}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    title="Clear all"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4">
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : notifications.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {notifications.slice(0, 10).map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      compact
                      onClose={() => setIsOpen(false)}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Bell
                    size={32}
                    className="mx-auto text-charcoal-muted mb-3"
                  />
                  <p className="text-charcoal-muted font-lora">
                    No notifications yet
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-100">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center text-sm font-chivo font-medium text-sage-green hover:text-deep-charcoal transition-colors"
                >
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationIcon;
