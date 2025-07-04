import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { HubStore } from './types';
import { initialState } from './state';
import { createHubActions } from './actions';
import { createHubSubscriptions } from './subscriptions';
import { createHubSelectors } from './selectors';

export const useHubStore = create<HubStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      ...createHubActions(set, get),
      ...createHubSubscriptions(set, get)
    }),
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

  // Reset store state
  store.reset();
};
