import { supabase } from "../../lib/supabase";
import {
  SettingsState,
  UserSettings,
  SetStateFunction,
  GetStateFunction,
  SubscriptionGroup,
} from "./types";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export const createSettingsSubscriptions = (
  set: SetStateFunction,
  get: GetStateFunction
) => ({
  subscribeToSettings: (userId: string) => {
    const state = get();

    // Don't create duplicate subscriptions
    if (state.subscriptions[userId]) {
      return;
    }

    try {
      // Subscribe to settings changes for this user
      const settingsSubscription = supabase
        .channel(`settings_${userId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "user_settings",
            filter: `user_id=eq.${userId}`,
          },
          (payload: RealtimePostgresChangesPayload<UserSettings>) => {
            try {
              set((state: SettingsState) => {
                if (payload.eventType === "UPDATE") {
                  // Update existing settings
                  state.settings = payload.new;
                  state.hasUnsavedChanges = false;
                }
              });
            } catch (error) {
              console.error("Error handling settings subscription update:", error);
              set((state: SettingsState) => {
                state.error =
                  "Failed to process settings update. Please refresh the page.";
              });
            }
          }
        )
        .subscribe();

      // Store subscription references
      const subscriptionGroup: SubscriptionGroup = {
        settings: settingsSubscription,
        unsubscribe: () => {
          try {
            settingsSubscription.unsubscribe();
          } catch (error) {
            console.error(
              "Error unsubscribing from settings subscriptions:",
              error
            );
          }
        },
      };

      set((state: SettingsState) => {
        state.subscriptions[userId] = subscriptionGroup;
      });
    } catch (error) {
      console.error("Error setting up subscriptions for user:", userId, error);
      set((state: SettingsState) => {
        state.error =
          "Failed to set up real-time updates. Some features may not work properly.";
      });
    }
  },

  unsubscribeFromSettings: (userId: string) => {
    try {
      const state = get();
      const subscription = state.subscriptions[userId];

      if (subscription) {
        subscription.unsubscribe();

        set((state: SettingsState) => {
          const newSubscriptions = { ...state.subscriptions };
          delete newSubscriptions[userId];
          state.subscriptions = newSubscriptions;
        });
      }
    } catch (error) {
      console.error("Error unsubscribing from settings:", userId, error);
      set((state: SettingsState) => {
        state.error =
          "Failed to clean up real-time connections. Please refresh the page.";
      });
    }
  },
});