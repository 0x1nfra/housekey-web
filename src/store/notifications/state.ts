import { NotificationsState } from './types';

export const initialState: NotificationsState = {
  // Notifications data
  notifications: [],
  unreadCount: 0,
  
  // UI State
  loading: {
    fetch: false,
    update: false,
    delete: false,
  },
  error: null,
  
  // Filters
  filters: {},
  
  // Pagination
  pagination: {
    limit: 20,
    offset: 0,
    hasMore: true,
  },
  
  // Current context
  currentHub: null,
  
  // Realtime subscriptions
  subscriptions: {},
};