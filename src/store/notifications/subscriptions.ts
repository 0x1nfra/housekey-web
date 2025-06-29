import { supabase } from '../../lib/supabase';
import {
  NotificationsState,
  Notification,
  SetStateFunction,
  GetStateFunction,
  SubscriptionGroup,
} from './types';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export const createNotificationsSubscriptions = (
  set: SetStateFunction,
  get: GetStateFunction
) => ({
  subscribeToNotifications: (userId: string) => {
    const state = get();

    // Don't create duplicate subscriptions
    if (state.subscriptions[userId]) {
      return;
    }

    try {
      // Subscribe to notifications changes for this user
      const notificationsSubscription = supabase
        .channel(`notifications_${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          (payload: RealtimePostgresChangesPayload<Notification>) => {
            try {
              console.log('Notification change:', payload);

              set((state: NotificationsState) => {
                if (payload.eventType === 'INSERT') {
                  // Add new notification
                  const newNotification = payload.new;
                  
                  // Play sound for new notifications
                  if (typeof window !== 'undefined') {
                    try {
                      const audio = new Audio('/notification.mp3');
                      audio.volume = 0.5;
                      audio.play().catch(e => console.log('Audio play prevented by browser policy'));
                    } catch (e) {
                      console.log('Audio play error:', e);
                    }
                  }
                  
                  // Update state
                  state.notifications.unshift(newNotification);
                  if (!newNotification.read) {
                    state.unreadCount += 1;
                  }
                } else if (payload.eventType === 'UPDATE') {
                  // Update existing notification
                  const updatedNotification = payload.new;
                  const oldNotification = payload.old;
                  
                  // Update unread count if read status changed
                  if (!oldNotification.read && updatedNotification.read) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                  } else if (oldNotification.read && !updatedNotification.read) {
                    state.unreadCount += 1;
                  }
                  
                  // Update notification in the list
                  const index = state.notifications.findIndex(n => n.id === updatedNotification.id);
                  if (index !== -1) {
                    state.notifications[index] = updatedNotification;
                  }
                } else if (payload.eventType === 'DELETE') {
                  // Remove deleted notification
                  const deletedNotification = payload.old;
                  
                  // Update unread count if an unread notification was deleted
                  if (!deletedNotification.read) {
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                  }
                  
                  // Remove from list
                  state.notifications = state.notifications.filter(n => n.id !== deletedNotification.id);
                }
              });
            } catch (error) {
              console.error('Error handling notification subscription update:', error);
              set((state: NotificationsState) => {
                state.error = 'Failed to process notification update. Please refresh the page.';
              });
            }
          }
        )
        .subscribe();

      // Store subscription references
      const subscriptionGroup: SubscriptionGroup = {
        notifications: notificationsSubscription,
        unsubscribe: () => {
          try {
            notificationsSubscription.unsubscribe();
          } catch (error) {
            console.error('Error unsubscribing from notification subscriptions:', error);
          }
        },
      };

      set((state: NotificationsState) => {
        state.subscriptions[userId] = subscriptionGroup;
      });
    } catch (error) {
      console.error('Error setting up subscriptions for user:', userId, error);
      set((state: NotificationsState) => {
        state.error = 'Failed to set up real-time updates. Some features may not work properly.';
      });
    }
  },

  unsubscribeFromNotifications: (userId: string) => {
    try {
      const state = get();
      const subscription = state.subscriptions[userId] as SubscriptionGroup | undefined;

      if (subscription) {
        subscription.unsubscribe();

        set((state: NotificationsState) => {
          const newSubscriptions = { ...state.subscriptions };
          delete newSubscriptions[userId];
          state.subscriptions = newSubscriptions;
        });
      }
    } catch (error) {
      console.error('Error unsubscribing from notifications:', userId, error);
      set((state: NotificationsState) => {
        state.error = 'Failed to clean up real-time connections. Please refresh the page.';
      });
    }
  },

  unsubscribeAll: () => {
    try {
      const state = get();

      Object.values(state.subscriptions).forEach((subscription: unknown) => {
        try {
          if (
            subscription &&
            typeof subscription === 'object' &&
            'unsubscribe' in subscription &&
            typeof subscription.unsubscribe === 'function'
          ) {
            subscription.unsubscribe();
          }
        } catch (error) {
          console.error('Error unsubscribing from individual subscription:', error);
        }
      });

      set((state: NotificationsState) => {
        state.subscriptions = {};
      });
    } catch (error) {
      console.error('Error unsubscribing from all subscriptions:', error);
      set((state: NotificationsState) => {
        state.error = 'Failed to clean up all real-time connections. Please refresh the page.';
      });
    }
  },
});