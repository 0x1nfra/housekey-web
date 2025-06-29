import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { NotificationsStore, SubscriptionGroup } from './types';
import { initialState } from './state';
import { createNotificationsActions } from './actions';
import { createNotificationsSelectors } from './selectors';
import { createNotificationsSubscriptions } from './subscriptions';
import { useAuthStore } from '../authStore';

// Define the set/get function types for immer
type ImmerSet = (
  nextStateOrUpdater:
    | NotificationsStore
    | Partial<NotificationsStore>
    | ((state: NotificationsStore) => void),
  shouldReplace?: boolean
) => void;

type ImmerGet = () => NotificationsStore;

// Create middleware to access auth store
const withAuth = (config: any) => (set: ImmerSet, get: ImmerGet, api: any) => {
  return config(
    set,
    () => ({
      ...get(),
      currentUserId: useAuthStore.getState().user?.id,
    }),
    api
  );
};

export const useNotificationsStore = create<NotificationsStore>()(
  immer(
    withAuth((set: ImmerSet, get: ImmerGet) => ({
      ...initialState,

      // Actions
      ...createNotificationsActions(set, get),

      // Subscriptions
      ...createNotificationsSubscriptions(set, get),
    }))
  )
);

// Export selectors as a separate hook for better performance
export const useNotificationsSelectors = () => {
  return createNotificationsSelectors(useNotificationsStore.getState());
};

// Export types
export * from './types';

// Cleanup function for when the store is no longer needed
export const cleanupNotificationsStore = () => {
  const store = useNotificationsStore.getState();

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