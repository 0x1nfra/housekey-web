import { supabase } from '../../lib/supabase';
import {
  EventsState,
  Event,
  EventReminder,
  SetStateFunction,
  GetStateFunction,
  SubscriptionGroup,
} from './types';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export const createEventsSubscriptions = (
  set: SetStateFunction,
  get: GetStateFunction
) => ({
  subscribeToHub: (hubId: string) => {
    const state = get();

    // Don't create duplicate subscriptions
    if (state.subscriptions[hubId]) {
      return;
    }

    try {
      // Subscribe to events changes for this hub
      const eventsSubscription = supabase
        .channel(`events_${hubId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'events',
            filter: `hub_id=eq.${hubId}`,
          },
          (payload: RealtimePostgresChangesPayload<Event>) => {
            try {
              console.log('Event change:', payload);

              set((state: EventsState) => {
                if (payload.eventType === 'INSERT') {
                  // Add new event
                  const newEvent = payload.new;
                  const existingIndex = state.events.findIndex(e => e.id === newEvent.id);
                  
                  if (existingIndex === -1) {
                    state.events.push(newEvent);
                    state.events.sort((a, b) => 
                      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
                    );
                  }
                } else if (payload.eventType === 'UPDATE') {
                  // Update existing event
                  const updatedEvent = payload.new;
                  const eventIndex = state.events.findIndex(e => e.id === updatedEvent.id);
                  
                  if (eventIndex !== -1) {
                    state.events[eventIndex] = updatedEvent;
                    state.events.sort((a, b) => 
                      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
                    );
                  }
                } else if (payload.eventType === 'DELETE') {
                  // Remove deleted event
                  const deletedEvent = payload.old;
                  state.events = state.events.filter(e => e.id !== deletedEvent.id);
                }
              });
            } catch (error) {
              console.error('Error handling event subscription update:', error);
              set((state: EventsState) => {
                state.error = 'Failed to process event update. Please refresh the page.';
              });
            }
          }
        )
        .subscribe();

      // Subscribe to event reminders changes
      const remindersSubscription = supabase
        .channel(`event_reminders_${hubId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'event_reminders',
          },
          (payload: RealtimePostgresChangesPayload<EventReminder>) => {
            try {
              console.log('Event reminder change:', payload);

              set((state: EventsState) => {
                if (payload.eventType === 'INSERT') {
                  // Add new reminder
                  const newReminder = payload.new;
                  const existingIndex = state.reminders.findIndex(r => r.id === newReminder.id);
                  
                  if (existingIndex === -1) {
                    state.reminders.push(newReminder);
                  }
                } else if (payload.eventType === 'UPDATE') {
                  // Update existing reminder
                  const updatedReminder = payload.new;
                  const reminderIndex = state.reminders.findIndex(r => r.id === updatedReminder.id);
                  
                  if (reminderIndex !== -1) {
                    state.reminders[reminderIndex] = updatedReminder;
                  }
                } else if (payload.eventType === 'DELETE') {
                  // Remove deleted reminder
                  const deletedReminder = payload.old;
                  state.reminders = state.reminders.filter(r => r.id !== deletedReminder.id);
                }
              });
            } catch (error) {
              console.error('Error handling reminder subscription update:', error);
              set((state: EventsState) => {
                state.error = 'Failed to process reminder update. Please refresh the page.';
              });
            }
          }
        )
        .subscribe();

      // Store subscription references
      const subscriptionGroup: SubscriptionGroup = {
        events: eventsSubscription,
        reminders: remindersSubscription,
        unsubscribe: () => {
          try {
            eventsSubscription.unsubscribe();
            remindersSubscription.unsubscribe();
          } catch (error) {
            console.error('Error unsubscribing from event subscriptions:', error);
          }
        },
      };

      set((state: EventsState) => {
        state.subscriptions[hubId] = subscriptionGroup;
      });
    } catch (error) {
      console.error('Error setting up subscriptions for hub:', hubId, error);
      set((state: EventsState) => {
        state.error = 'Failed to set up real-time updates. Some features may not work properly.';
      });
    }
  },

  unsubscribeFromHub: (hubId: string) => {
    try {
      const state = get();
      const subscription = state.subscriptions[hubId] as SubscriptionGroup | undefined;

      if (subscription) {
        subscription.unsubscribe();

        set((state: EventsState) => {
          const newSubscriptions = { ...state.subscriptions };
          delete newSubscriptions[hubId];
          state.subscriptions = newSubscriptions;
        });
      }
    } catch (error) {
      console.error('Error unsubscribing from hub:', hubId, error);
      set((state: EventsState) => {
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

      set((state: EventsState) => {
        state.subscriptions = {};
      });
    } catch (error) {
      console.error('Error unsubscribing from all subscriptions:', error);
      set((state: EventsState) => {
        state.error = 'Failed to clean up all real-time connections. Please refresh the page.';
      });
    }
  },
});