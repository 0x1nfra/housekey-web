import { supabase } from '../../lib/supabase';
import {
  TasksState,
  Task,
  SetStateFunction,
  GetStateFunction,
  SubscriptionGroup,
} from './types';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export const createTasksSubscriptions = (
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
      // Subscribe to task changes for this hub
      const tasksSubscription = supabase
        .channel(`tasks_${hubId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `hub_id=eq.${hubId}`,
          },
          (payload: RealtimePostgresChangesPayload<Task>) => {
            try {
              console.log('Task change:', payload);

              set((state: TasksState) => {
                const currentTasks = state.tasks[hubId] || [];

                if (payload.eventType === 'INSERT') {
                  return {
                    ...state,
                    tasks: {
                      ...state.tasks,
                      [hubId]: [payload.new, ...currentTasks],
                    },
                  };
                } else if (payload.eventType === 'UPDATE') {
                  return {
                    ...state,
                    tasks: {
                      ...state.tasks,
                      [hubId]: currentTasks.map((task) =>
                        task.id === payload.new.id ? payload.new : task
                      ),
                    },
                  };
                } else if (payload.eventType === 'DELETE') {
                  return {
                    ...state,
                    tasks: {
                      ...state.tasks,
                      [hubId]: currentTasks.filter(
                        (task) => task.id !== payload.old.id
                      ),
                    },
                    selectedTasks: state.selectedTasks.filter(
                      (taskId) => taskId !== payload.old.id
                    ),
                  };
                }

                return state;
              });
            } catch (error) {
              console.error('Error handling task subscription update:', error);
              set((state: TasksState) => ({
                ...state,
                error: 'Failed to process task update. Please refresh the page.',
              }));
            }
          }
        )
        .subscribe();

      // Store subscription reference
      const subscriptionGroup: SubscriptionGroup = {
        tasks: tasksSubscription,
        unsubscribe: () => {
          try {
            tasksSubscription.unsubscribe();
          } catch (error) {
            console.error('Error unsubscribing from task subscriptions:', error);
          }
        },
      };

      set((state: TasksState) => ({
        ...state,
        subscriptions: {
          ...state.subscriptions,
          [hubId]: subscriptionGroup,
        },
      }));
    } catch (error) {
      console.error('Error setting up subscriptions for hub:', hubId, error);
      set((state: TasksState) => ({
        ...state,
        error: 'Failed to set up real-time updates. Some features may not work properly.',
      }));
    }
  },

  unsubscribeFromHub: (hubId: string) => {
    try {
      const state = get();
      const subscription = state.subscriptions[hubId] as
        | SubscriptionGroup
        | undefined;

      if (subscription) {
        subscription.unsubscribe();

        set((state: TasksState) => {
          const newSubscriptions = { ...state.subscriptions };
          delete newSubscriptions[hubId];
          return { ...state, subscriptions: newSubscriptions };
        });
      }
    } catch (error) {
      console.error('Error unsubscribing from hub:', hubId, error);
      set((state: TasksState) => ({
        ...state,
        error: 'Failed to clean up real-time connections. Please refresh the page.',
      }));
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

      set((state: TasksState) => ({ ...state, subscriptions: {} }));
    } catch (error) {
      console.error('Error unsubscribing from all subscriptions:', error);
      set((state: TasksState) => ({
        ...state,
        error: 'Failed to clean up all real-time connections. Please refresh the page.',
      }));
    }
  },
});