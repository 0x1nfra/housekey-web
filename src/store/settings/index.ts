import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { SettingsStore, ImmerSet, ImmerGet } from "./types";
import { initialState } from "./state";
import { createSettingsActions } from "./actions";
import { createSettingsSelectors } from "./selectors";
import { createSettingsSubscriptions } from "./subscriptions";
import { useAuthStore } from "../authStore";

export const useSettingsStore = create<SettingsStore>()(
  immer((set: ImmerSet, get: ImmerGet) => ({
    ...initialState,

    // Actions
    ...createSettingsActions(set, get),

    // Subscriptions
    ...createSettingsSubscriptions(set, get),
  }))
);

// Subscribe to auth store changes to initialize settings when user logs in
useAuthStore.subscribe((state) => {
  const settingsState = useSettingsStore.getState();
  if (
    state.user &&
    !settingsState.settings &&
    !settingsState.loading.settings
  ) {
    useSettingsStore.getState().fetchUserSettings();
  }
});

// Export selectors as a separate hook for better performance
export const useSettingsSelectors = () => {
  return useSettingsStore((state) => createSettingsSelectors(state));
};

// Export types
export * from "./types";

// Cleanup function for when the store is no longer needed
export const cleanupSettingsStore = () => {
  const store = useSettingsStore.getState();

  // Unsubscribe from all realtime subscriptions
  Object.values(store.subscriptions).forEach((subscription) => {
    if (subscription && typeof subscription.unsubscribe === "function") {
      subscription.unsubscribe();
    }
  });

  // Reset store state
  store.reset();
};
