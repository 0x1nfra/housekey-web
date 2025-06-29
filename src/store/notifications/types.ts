import { RealtimeChannel } from "@supabase/supabase-js";

export type NotificationType = "event" | "task" | "system";
export type NotificationPriority = "low" | "medium" | "high";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  user_id: string;
  actor_id?: string;
  actor_name?: string;
  actor_email?: string;
  related_id?: string;
  related_type?: string;
  priority: NotificationPriority;
  actionable: boolean;
  metadata?: Record<string, unknown>;
  hub_id: string;
}

export interface NotificationsState {
  // Notifications data
  notifications: Notification[];
  unreadCount: number;

  // UI State
  loading: {
    fetch: boolean;
    update: boolean;
    delete: boolean;
  };
  error: string | null;

  // Filters
  filters: {
    type?: NotificationType;
    read?: boolean;
  };

  // Pagination
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };

  // Current context
  currentHub: string | null;

  // Realtime subscriptions
  subscriptions: Record<string, SubscriptionGroup>;

  // Auth
  currentUserId: string | null;
}

export interface SubscriptionGroup {
  notifications: RealtimeChannel;
  unsubscribe: () => void;
}

export interface NotificationsActions {
  // Data fetching
  fetchNotifications: (userId: string, reset?: boolean) => Promise<void>;
  fetchUnreadCount: (userId: string) => Promise<void>;

  // CRUD operations
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAllRead: (userId: string) => Promise<void>;

  // Filter management
  setFilters: (filters: Partial<NotificationsState["filters"]>) => void;
  clearFilters: () => void;

  // Pagination
  loadMore: () => Promise<void>;

  // Subscription management
  subscribeToNotifications: (userId: string) => void;
  unsubscribeFromNotifications: (userId: string) => void;

  // Utility
  clearError: () => void;
  reset: () => void;
}

export interface NotificationsStoreWithAuth extends NotificationsStore {
  currentUserId?: string | null;
}

export type NotificationsStore = NotificationsState & NotificationsActions;

// Helper types for function signatures
export type SetStateFunction = (
  fn: (state: NotificationsState) => void
) => void;
export type GetStateFunction = () => NotificationsStore;

export interface Result<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Notification icon mapping
export const NOTIFICATION_ICONS = {
  event: "Calendar",
  task: "CheckSquare",
  system: "Bell",
} as const;

// Notification color mapping
export const NOTIFICATION_COLORS = {
  event: "bg-indigo-100 text-indigo-600",
  task: "bg-emerald-100 text-emerald-600",
  system: "bg-purple-100 text-purple-600",
} as const;

// Priority color mapping
export const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-red-100 text-red-600",
} as const;

// Define the set/get function types for immer
export type ImmerSet = (
  nextStateOrUpdater:
    | NotificationsStore
    | Partial<NotificationsStore>
    | ((state: NotificationsStore) => void),
  shouldReplace?: boolean
) => void;

export type ImmerGet = () => NotificationsStore;
