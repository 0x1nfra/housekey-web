import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  ImmerGet,
  ImmerSet,
  NotificationsStore,
  SubscriptionGroup,
} from "./types";
import { initialState } from "./state";
import { createNotificationsActions } from "./actions";
import { createNotificationsSelectors } from "./selectors";
import { createNotificationsSubscriptions } from "./subscriptions";
import { useAuthStore } from "../authStore";

export const useNotificationsStore = create<NotificationsStore>()(
  immer((set: ImmerSet, get: ImmerGet) => ({
    ...initialState,
    currentUserId: useAuthStore.getState().user?.id ?? null,

    // Actions
    ...createNotificationsActions(set, get),

    // Subscriptions
    ...createNotificationsSubscriptions(set, get),
  }))
);

// Subscribe to auth store changes and update currentUserId in notifications store
useAuthStore.subscribe((authState) => {
  useNotificationsStore.setState({ currentUserId: authState.user?.id ?? null });
});

// Export selectors as a separate hook for better performance
export const useNotificationsSelectors = () => {
  return useNotificationsStore((state) => createNotificationsSelectors(state));
};

// Export types
export * from "./types";

// Cleanup function for when the store is no longer needed
export const cleanupNotificationsStore = () => {
  const store = useNotificationsStore.getState();

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
