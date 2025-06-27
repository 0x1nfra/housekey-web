import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { ShoppingStore, SubscriptionGroup } from "./types";
import { initialState } from "./state";
import { createShoppingActions } from "./actions";
import { createShoppingSelectors } from "./selectors";
import { createShoppingSubscriptions } from "./subscriptions";

export const useShoppingStore = create<ShoppingStore>()(
  immer((set, get) => ({
    ...initialState,

    // Actions
    ...createShoppingActions(set, get),

    // Subscriptions
    ...createShoppingSubscriptions(set, get),
  }))
);

// Export selectors as a separate hook for better performance
export const useShoppingSelectors = () => {
  const state = useShoppingStore();
  return createShoppingSelectors(state);
};

// Export types
export * from "./types";

// Cleanup function for when the store is no longer needed
export const cleanupShoppingStore = () => {
  const store = useShoppingStore.getState();

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
