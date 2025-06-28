import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { EventsStore, SubscriptionGroup } from './types';
import { initialState } from './state';
import { createEventsActions } from './actions';
import { createEventsSelectors } from './selectors';
import { createEventsSubscriptions } from './subscriptions';

// Define the set/get function types for immer
type ImmerSet = (
  nextStateOrUpdater:
    | EventsStore
    | Partial<EventsStore>
    | ((state: EventsStore) => void),
  shouldReplace?: boolean
) => void;

type ImmerGet = () => EventsStore;

export const useEventsStore = create<EventsStore>()(
  immer((set: ImmerSet, get: ImmerGet) => ({
    ...initialState,

    // Actions
    ...createEventsActions(set, get),

    // Subscriptions
    ...createEventsSubscriptions(set, get),
  }))
);

// Export selectors as a separate hook for better performance
export const useEventsSelectors = () => {
  const state = useEventsStore();
  return createEventsSelectors(state);
};

// Export types
export * from './types';

// Cleanup function for when the store is no longer needed
export const cleanupEventsStore = () => {
  const store = useEventsStore.getState();

  // Unsubscribe from all realtime subscriptions
  Object.values(
    store.subscriptions as Record<string, SubscriptionGroup>
  ).forEach((subscription) => {
    if (subscription && typeof subscription.unsubscribe === 'function') {
      subscription.unsubscribe();
    }
  });

  // Reset store state
  store.reset();
};