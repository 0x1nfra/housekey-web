import { NotificationsState, Notification, NotificationType } from './types';
import { formatDistanceToNow } from 'date-fns';

export const createNotificationsSelectors = (state: NotificationsState) => ({
  // Basic selectors
  getAllNotifications: (): Notification[] => state.notifications,
  
  getUnreadCount: (): number => state.unreadCount,
  
  getNotificationById: (id: string): Notification | undefined =>
    state.notifications.find(notification => notification.id === id),
  
  // Filtered selectors
  getUnreadNotifications: (): Notification[] =>
    state.notifications.filter(notification => !notification.read),
  
  getReadNotifications: (): Notification[] =>
    state.notifications.filter(notification => notification.read),
  
  getNotificationsByType: (type: NotificationType): Notification[] =>
    state.notifications.filter(notification => notification.type === type),
  
  getNotificationsByPriority: (priority: 'high' | 'medium' | 'low'): Notification[] =>
    state.notifications.filter(notification => notification.priority === priority),
  
  getActionableNotifications: (): Notification[] =>
    state.notifications.filter(notification => notification.actionable),
  
  // Computed selectors
  getRecentNotifications: (count: number = 5): Notification[] =>
    [...state.notifications]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, count),
  
  getGroupedNotifications: (): Record<string, Notification[]> => {
    const grouped: Record<string, Notification[]> = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };
    
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    state.notifications.forEach(notification => {
      const date = new Date(notification.created_at);
      
      if (date.toDateString() === now.toDateString()) {
        grouped.today.push(notification);
      } else if (date.toDateString() === yesterday.toDateString()) {
        grouped.yesterday.push(notification);
      } else if (date > weekAgo) {
        grouped.thisWeek.push(notification);
      } else {
        grouped.older.push(notification);
      }
    });
    
    return grouped;
  },
  
  // Utility selectors
  getFormattedTimeAgo: (notification: Notification): string => {
    return formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });
  },
  
  getNotificationStats: () => {
    const total = state.notifications.length;
    const unread = state.unreadCount;
    const read = total - unread;
    
    const byType = {
      event: state.notifications.filter(n => n.type === 'event').length,
      task: state.notifications.filter(n => n.type === 'task').length,
      shopping: state.notifications.filter(n => n.type === 'shopping').length,
      system: state.notifications.filter(n => n.type === 'system').length,
    };
    
    const byPriority = {
      high: state.notifications.filter(n => n.priority === 'high').length,
      medium: state.notifications.filter(n => n.priority === 'medium').length,
      low: state.notifications.filter(n => n.priority === 'low').length,
    };
    
    return {
      total,
      unread,
      read,
      byType,
      byPriority,
    };
  },
  
  // Loading selectors
  isLoading: (type?: keyof NotificationsState['loading']) => {
    if (type) {
      return state.loading[type];
    }
    return Object.values(state.loading).some(loading => loading);
  },
  
  // Pagination selectors
  hasMoreNotifications: () => state.pagination.hasMore,
  
  getCurrentPage: () => Math.floor(state.pagination.offset / state.pagination.limit) + 1,
});