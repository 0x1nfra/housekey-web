import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ExternalLink, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotificationsStore } from "../../store/notifications";
import { useAuthStore } from "../../store/auth";
import NotificationItem from "./ui/NotificationItem";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAllAsRead,
  } = useNotificationsStore();

  // Fetch notifications when component mounts or user changes
  useEffect(() => {
    if (user?.id && isOpen) {
      fetchNotifications(user.id);
    }
  }, [user?.id, isOpen, fetchNotifications]);

  // Get recent notifications (last 5)
  const recentNotifications = notifications.slice(0, 5);

  const handleMarkAllAsRead = async () => {
    if (user?.id) {
      await markAllAsRead(user.id);
    }
  };

  const handleViewAll = () => {
    navigate("/notifications");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 font-interface">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <p className="text-sm text-gray-600">
                      {unreadCount} unread notification
                      {unreadCount !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm text-sage-green hover:text-sage-green-dark font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-sage-green/10 transition-colors"
                  >
                    <Eye size={14} />
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading.fetch ? (
                <div className="p-4">
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center gap-3 p-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : recentNotifications.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {recentNotifications.map((notification) => (
                    <div key={notification.id} className="p-2">
                      <NotificationItem
                        notification={notification}
                        compact={true}
                        onClose={onClose}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell size={20} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No notifications yet</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {recentNotifications.length > 0 && (
              <div className="p-3 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={handleViewAll}
                  className="w-full text-center text-sm text-charcoal-light hover:text-deep-charcoal font-medium flex items-center justify-center gap-1 py-2 rounded hover:bg-sage-green/10 transition-colors"
                >
                  <ExternalLink size={14} />
                  View all notifications
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;
