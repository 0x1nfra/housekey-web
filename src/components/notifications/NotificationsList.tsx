import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Filter,
  CheckCheck,
  Trash2,
  X,
  RefreshCcw,
  Calendar,
  CheckSquare,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { useNotificationsStore } from "../../store/notifications";
import { useAuthStore } from "../../store/authStore";
import { shallow } from "zustand/shallow";
import NotificationItem from "./NotificationItem";
import { NotificationType } from "../../store/notifications/types";

const NotificationsList: React.FC = () => {
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
    error,
    filters,
    fetchNotifications,
    fetchUnreadCount,
    markAllAsRead,
    deleteAllRead,
    setFilters,
    clearFilters,
    loadMore,
    clearError,
    pagination,
  } = useNotificationsStore(
    (state) => ({
      notifications: state.notifications,
      unreadCount: state.unreadCount,
      loading: state.loading,
      error: state.error,
      filters: state.filters,
      fetchNotifications: state.fetchNotifications,
      fetchUnreadCount: state.fetchUnreadCount,
      markAllAsRead: state.markAllAsRead,
      deleteAllRead: state.deleteAllRead,
      setFilters: state.setFilters,
      clearFilters: state.clearFilters,
      loadMore: state.loadMore,
      clearError: state.clearError,
      pagination: state.pagination,
    }),
    shallow
  );

  // Initialize notifications
  useEffect(() => {
    if (user) {
      fetchNotifications(user.id, true);
      fetchUnreadCount(user.id);
    }
  }, [user, fetchNotifications, fetchUnreadCount]);

  const handleTypeFilter = (type: NotificationType | undefined) => {
    setFilters({ type });
  };

  const handleReadFilter = (read: boolean | undefined) => {
    setFilters({ read });
  };

  const handleMarkAllAsRead = async () => {
    if (user) {
      await markAllAsRead(user.id);
    }
  };

  const handleDeleteAllRead = async () => {
    if (user) {
      await deleteAllRead(user.id);
    }
  };

  const handleRefresh = () => {
    if (user) {
      fetchNotifications(user.id, true);
      fetchUnreadCount(user.id);
    }
  };

  const handleLoadMore = () => {
    loadMore();
  };

  const hasActiveFilters = filters.type !== undefined || filters.read !== undefined;

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
            </div>

            {/* Type Filter */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleTypeFilter(undefined)}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                  filters.type === undefined
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleTypeFilter("event")}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors flex items-center gap-1 ${
                  filters.type === "event"
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                }`}
              >
                <Calendar size={12} />
                Events
              </button>
              <button
                onClick={() => handleTypeFilter("task")}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors flex items-center gap-1 ${
                  filters.type === "task"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                }`}
              >
                <CheckSquare size={12} />
                Tasks
              </button>
              <button
                onClick={() => handleTypeFilter("shopping")}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors flex items-center gap-1 ${
                  filters.type === "shopping"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                }`}
              >
                <ShoppingCart size={12} />
                Shopping
              </button>
              <button
                onClick={() => handleTypeFilter("system")}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors flex items-center gap-1 ${
                  filters.type === "system"
                    ? "bg-purple-600 text-white"
                    : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                }`}
              >
                <Bell size={12} />
                System
              </button>
            </div>

            {/* Read/Unread Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => handleReadFilter(undefined)}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                  filters.read === undefined
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleReadFilter(false)}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                  filters.read === false
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                Unread
              </button>
              <button
                onClick={() => handleReadFilter(true)}
                className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${
                  filters.read === true
                    ? "bg-gray-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Read
              </button>
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-gray-600 hover:text-gray-800 flex items-center gap-1"
              >
                <X size={12} />
                Clear Filters
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRefresh}
              disabled={loading.fetch}
              className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCcw size={12} className={loading.fetch ? "animate-spin" : ""} />
              Refresh
            </motion.button>

            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMarkAllAsRead}
                disabled={loading.update}
                className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <CheckCheck size={12} />
                Mark All Read
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDeleteAllRead}
              disabled={loading.delete}
              className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <Trash2 size={12} />
              Clear Read
            </motion.button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
          </h3>
        </div>

        {loading.fetch && notifications.length === 0 ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div>
            <div className="divide-y divide-gray-100">
              <AnimatePresence initial={false}>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Load More */}
            {pagination.hasMore && (
              <div className="p-4 text-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLoadMore}
                  disabled={loading.fetch}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {loading.fetch ? "Loading..." : "Load More"}
                </motion.button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={24} className="text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No notifications
            </h4>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              {hasActiveFilters
                ? "No notifications match your current filters. Try adjusting your filters or check back later."
                : "You don't have any notifications yet. Notifications will appear here when there's activity in your household."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsList;