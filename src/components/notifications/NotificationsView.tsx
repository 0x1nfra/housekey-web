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
  AlertCircle,
} from "lucide-react";
import { useNotificationsStore } from "../../store/notifications";
import { useHubStore } from "../../store/hub";
import { shallow } from "zustand/shallow";
import { NotificationType } from "../../store/notifications/types";
import NotificationItem from "./ui/NotificationItem";

/*
TODO:
- hook up to functions
- load dynamic data from db
- break down ui components
*/

const NotificationsView: React.FC = () => {
  const { user } = useAuthStore((state) => ({ user: state.user }), shallow);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    filters,
    fetchNotifications,
    fetchUnreadCount,
    markAllAsRead,
    deleteAllNotifications,
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
      deleteAllNotifications: state.deleteAllNotifications,
      setFilters: state.setFilters,
      clearFilters: state.clearFilters,
      loadMore: state.loadMore,
      clearError: state.clearError,
      pagination: state.pagination,
    }),
    shallow
  );

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
    if (user) await markAllAsRead(user.id);
  };

  const handleDeleteAll = async () => {
    if (user) await deleteAllNotifications(user.id);
  };

  const handleRefresh = () => {
    if (user) {
      fetchNotifications(user.id, true);
      fetchUnreadCount(user.id);
    }
  };

  const handleLoadMore = () => loadMore();

  const hasActiveFilters =
    filters.type !== undefined || filters.read !== undefined;

  // Static class mappings to avoid dynamic Tailwind classes
  const typeColorClasses = {
    gray: {
      active: "bg-gray-600 text-white",
      inactive: "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
    },
    indigo: {
      active: "bg-indigo-600 text-white",
      inactive: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800"
    },
    emerald: {
      active: "bg-emerald-600 text-white",
      inactive: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800"
    },
    purple: {
      active: "bg-purple-600 text-white",
      inactive: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800"
    },
    blue: {
      active: "bg-blue-600 text-white",
      inactive: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800"
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Filter:
              </span>
            </div>

            {/* Type filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: "All", type: undefined, base: "gray" },
                {
                  label: "Events",
                  type: "event",
                  base: "indigo",
                  Icon: Calendar,
                },
                {
                  label: "Tasks",
                  type: "task",
                  base: "emerald",
                  Icon: CheckSquare,
                },
                { label: "System", type: "system", base: "purple", Icon: Bell },
              ].map(({ label, type, base, Icon }) => {
                const active = filters.type === type;
                const colorClasses = typeColorClasses[base as keyof typeof typeColorClasses] || typeColorClasses.gray;
                const classes = active ? colorClasses.active : colorClasses.inactive;
                return (
                  <button
                    key={label}
                    onClick={() => handleTypeFilter(type)}
                    className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors flex items-center gap-1 ${classes}`}
                  >
                    {Icon && <Icon size={12} />}
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Read/unread filters */}
            <div className="flex gap-2">
              {[
                { label: "All", value: undefined },
                { label: "Unread", value: false },
                { label: "Read", value: true },
              ].map(({ label, value }) => {
                const active = filters.read === value;
                const baseColor = value === false ? "blue" : "gray";
                const colorClasses = typeColorClasses[baseColor as keyof typeof typeColorClasses] || typeColorClasses.gray;
                const classes = active ? colorClasses.active : colorClasses.inactive;
                return (
                  <button
                    key={label}
                    onClick={() => handleReadFilter(value)}
                    className={`px-3 py-1.5 text-xs rounded-full font-medium transition-colors ${classes}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white flex items-center gap-1"
              >
                <X size={12} />
                Clear Filters
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRefresh}
              disabled={loading.fetch}
              className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCcw
                size={12}
                className={loading.fetch ? "animate-spin" : ""}
              />
              Refresh
            </motion.button>

            {unreadCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleMarkAllAsRead}
                disabled={loading.update}
                className="px-3 py-1.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <CheckCheck size={12} />
                Mark All Read
              </motion.button>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDeleteAll}
              disabled={loading.delete}
              className="px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              <Trash2 size={12} />
              Clear All
            </motion.button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
          </h3>
        </div>

        {loading.fetch && notifications.length === 0 ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              <AnimatePresence initial={false}>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </AnimatePresence>
            </div>

            {pagination.hasMore && (
              <div className="p-4 text-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLoadMore}
                  disabled={loading.fetch}
                  className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  {loading.fetch ? "Loading..." : "Load More"}
                </motion.button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={24} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No notifications
            </h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
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

export default NotificationsView;
