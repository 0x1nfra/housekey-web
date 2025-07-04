import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { HubStore, SubscriptionGroup } from './types';
import { initialState } from './state';
import { createHubActions } from './actions';
import { createHubSubscriptions } from './subscriptions';
import { createHubSelectors } from './selectors';

// Define the set/get function types for immer
type ImmerSet = (
  nextStateOrUpdater:
    | HubStore
    | Partial<HubStore>
    | ((state: HubStore) => void),
  shouldReplace?: boolean
) => void;

type ImmerGet = () => HubStore;

export const useHubStore = create<HubStore>()(
  devtools(
    immer((set: ImmerSet, get: ImmerGet) => ({
      ...initialState,
      
      // Actions
      ...createHubActions(set, get),
      
      // Subscriptions
      ...createHubSubscriptions(set, get),
    })),
    {
      name: 'hub-store'
    }
  )
);

// Export selectors as a separate hook for better performance
export const useHubSelectors = () => {
  const state = useHubStore();
  return createHubSelectors(state);
};

export * from './types';

// Cleanup function for when the store is no longer needed
export const cleanupHubStore = () => {
  const store = useHubStore.getState();

  // Unsubscribe from all realtime subscriptions
  Object.values(
    store.subscriptions as Record<string, SubscriptionGroup>
  ).forEach((subscription) => {
    if (subscription && typeof subscription.unsubscribe === "function") {
      subscription.unsubscribe();
    }
  });

  // Reset store state
  store.reset();
};
