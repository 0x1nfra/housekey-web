import { supabase } from "../../lib/supabase";
import {
  NotificationsState,
  // Notification,
  SetStateFunction,
  GetStateFunction,
  // Result,
  // NotificationsStore,
  SubscriptionGroup,
  NotificationsStore,
} from "./types";

export const createNotificationsActions = (
  set: SetStateFunction,
  get: GetStateFunction
) => ({
  // Data fetching
  fetchNotifications: async (userId: string, reset: boolean = false) => {
    const state = get();
    const { filters } = state;

    // Reset pagination if requested
    if (reset) {
      set((state) => {
        state.pagination = {
          ...state.pagination,
          offset: 0,
          hasMore: true,
        };
      });
    }

    // Don't fetch if we know there are no more results
    if (!reset && !state.pagination.hasMore) {
      return;
    }

    set((state) => {
      state.loading.fetch = true;
      state.error = null;
    });

    try {
      const { limit, offset } = reset
        ? { ...state.pagination, offset: 0 }
        : state.pagination;

      const { data, error } = await supabase.rpc("get_user_notifications", {
        p_user_id: userId,
        p_limit: limit,
        p_offset: offset,
        p_type: filters.type || null,
        p_read: filters.read !== undefined ? filters.read : null,
      });

      if (error) throw error;

      set((state) => {
        // If reset, replace notifications, otherwise append
        state.notifications = reset
          ? data || []
          : [...state.notifications, ...(data || [])];

        // Update pagination
        state.pagination = {
          ...state.pagination,
          offset: state.pagination.offset + state.pagination.limit,
          hasMore: (data || []).length === state.pagination.limit,
        };

        state.loading.fetch = false;
      });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      set((state) => {
        state.error =
          error instanceof Error
            ? error.message
            : "Failed to fetch notifications";
        state.loading.fetch = false;
      });
    }
  },

  fetchUnreadCount: async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc(
        "get_unread_notification_count",
        {
          p_user_id: userId,
        }
      );

      if (error) throw error;

      set((state) => {
        state.unreadCount = data || 0;
      });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      // Don't set error state here to avoid disrupting the UI
    }
  },

  // CRUD operations
  markAsRead: async (notificationId: string) => {
    set((state) => {
      state.loading.update = true;
      state.error = null;
    });

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;

      // Optimistically update state
      set((state) => {
        const notification = state.notifications.find(
          (n) => n.id === notificationId
        );

        if (notification && !notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
          state.notifications = state.notifications.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          );
        }

        state.loading.update = false;
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      set((state) => {
        state.error =
          error instanceof Error
            ? error.message
            : "Failed to mark notification as read";
        state.loading.update = false;
      });
    }
  },

  markAllAsRead: async (userId: string) => {
    set((state) => {
      state.loading.update = true;
      state.error = null;
    });

    try {
      const { error } = await supabase.rpc("mark_all_notifications_read", {
        p_user_id: userId,
      });

      if (error) throw error;

      // Optimistically update state
      set((state) => {
        state.notifications = state.notifications.map((n) => ({
          ...n,
          read: true,
        }));
        state.unreadCount = 0;
        state.loading.update = false;
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      set((state) => {
        state.error =
          error instanceof Error
            ? error.message
            : "Failed to mark all notifications as read";
        state.loading.update = false;
      });
    }
  },

  deleteNotification: async (notificationId: string) => {
    set((state) => {
      state.loading.delete = true;
      state.error = null;
    });

    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;

      // Optimistically update state
      set((state) => {
        const notification = state.notifications.find(
          (n) => n.id === notificationId
        );

        if (notification && !notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }

        state.notifications = state.notifications.filter(
          (n) => n.id !== notificationId
        );
        state.loading.delete = false;
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
      set((state) => {
        state.error =
          error instanceof Error
            ? error.message
            : "Failed to delete notification";
        state.loading.delete = false;
      });
    }
  },

  deleteAllRead: async (userId: string) => {
    set((state) => {
      state.loading.delete = true;
      state.error = null;
    });

    try {
      const { error } = await supabase.rpc("delete_old_read_notifications", {
        p_user_id: userId,
        p_days_old: 0, // Delete all read notifications regardless of age
      });

      if (error) throw error;

      // Optimistically update state
      set((state) => {
        state.notifications = state.notifications.filter((n) => !n.read);
        state.loading.delete = false;
      });
    } catch (error) {
      console.error("Error deleting read notifications:", error);
      set((state) => {
        state.error =
          error instanceof Error
            ? error.message
            : "Failed to delete read notifications";
        state.loading.delete = false;
      });
    }
  },

  deleteAllNotifications: async (userId: string) => {
    set((state) => {
      state.loading.delete = true;
      state.error = null;
    });

    try {
      const { error } = await supabase.rpc("delete_all_notifications", {
        p_user_id: userId,
      });

      if (error) throw error;

      // Update state
      set((state) => {
        state.notifications = [];
        state.unreadCount = 0;
        state.loading.delete = false;
      });
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      set((state) => {
        state.error =
          error instanceof Error
            ? error.message
            : "Failed to delete all notifications";
        state.loading.delete = false;
      });
    }
  },

  deleteNotificationsByType: async (userId: string, type: string) => {
    set((state) => {
      state.loading.delete = true;
      state.error = null;
    });

    try {
      const { error } = await supabase.rpc("delete_all_notifications_by_type", {
        p_user_id: userId,
        p_type: type,
      });

      if (error) throw error;

      // Update state
      set((state) => {
        // Remove notifications of the specified type
        state.notifications = state.notifications.filter(
          (n) => n.type !== type
        );

        // Recalculate unread count
        state.unreadCount = state.notifications.filter((n) => !n.read).length;
        state.loading.delete = false;
      });
    } catch (error) {
      console.error(`Error deleting ${type} notifications:`, error);
      set((state) => {
        state.error =
          error instanceof Error
            ? error.message
            : `Failed to delete ${type} notifications`;
        state.loading.delete = false;
      });
    }
  },

  // Filter management
  setFilters: (filters: Partial<NotificationsState["filters"]>) => {
    set((state) => {
      state.filters = { ...state.filters, ...filters };
      // Reset pagination when filters change
      state.pagination = {
        ...state.pagination,
        offset: 0,
        hasMore: true,
      };
    });

    // Refetch with new filters
    const { fetchNotifications } = get();
    const { currentUserId } = get() as NotificationsStore;

    if (currentUserId) {
      fetchNotifications(currentUserId, true);
    }
  },

  clearFilters: () => {
    set((state) => {
      state.filters = {};
      // Reset pagination when filters change
      state.pagination = {
        ...state.pagination,
        offset: 0,
        hasMore: true,
      };
    });

    // Refetch with cleared filters
    const { fetchNotifications } = get();
    const { currentUserId } = get() as NotificationsStore;

    if (currentUserId) {
      fetchNotifications(currentUserId, true);
    }
  },

  // Pagination
  loadMore: async () => {
    const { fetchNotifications } = get();
    const { currentUserId } = get() as NotificationsStore;

    if (currentUserId) {
      await fetchNotifications(currentUserId, false);
    }
  },

  // Utility
  clearError: () => {
    set((state) => {
      state.error = null;
    });
  },

  reset: () => {
    // Unsubscribe from all subscriptions
    const state = get();
    Object.values(state.subscriptions).forEach(
      (subscription: SubscriptionGroup) => {
        if (subscription && typeof subscription.unsubscribe === "function") {
          subscription.unsubscribe();
        }
      }
    );

    set((state) => {
      state.notifications = [];
      state.unreadCount = 0;
      state.loading = {
        fetch: false,
        update: false,
        delete: false,
      };
      state.error = null;
      state.filters = {};
      state.pagination = {
        limit: 20,
        offset: 0,
        hasMore: true,
      };
      state.currentHub = null;
      state.subscriptions = {};
    });
  },
});
