import { supabase } from "../../lib/supabase";
import {
  SettingsState,
  UserSettings,
  SetStateFunction,
  GetStateFunction,
  Result,
} from "./types";

export const createSettingsActions = (
  set: SetStateFunction,
  get: GetStateFunction
) => ({
  // Data fetching
  fetchUserSettings: async () => {
    set((state) => {
      state.loading.settings = true;
      state.error = null;
    });

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // First check if settings exist
      const { data: existingSettings, error: fetchError } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 is "no rows returned" error, which is expected if no settings exist
        throw fetchError;
      }

      if (existingSettings) {
        // Settings exist, use them
        set((state) => {
          state.settings = existingSettings;
          state.loading.settings = false;
        });
      } else {
        // No settings exist, create default settings
        const { data: newSettings, error: insertError } = await supabase
          .from("user_settings")
          .insert({
            user_id: user.user.id,
            dark_mode: false,
            time_format: "12",
          })
          .select()
          .single();

        if (insertError) throw insertError;

        set((state) => {
          state.settings = newSettings;
          state.loading.settings = false;
        });
      }
    } catch (error) {
      console.error("Error fetching user settings:", error);
      set((state) => {
        state.error =
          error instanceof Error
            ? error.message
            : "Failed to fetch user settings";
        state.loading.settings = false;
      });
    }
  },

  // CRUD operations
  updateSettings: async (settings: Partial<UserSettings>) => {
    set((state) => {
      state.loading.update = true;
      state.error = null;
      
      // Update local state immediately for better UX
      if (state.settings) {
        state.settings = { ...state.settings, ...settings };
      }
      
      state.hasUnsavedChanges = true;
    });
  },

  saveSettings: async () => {
    const { settings } = get();
    if (!settings) return;

    set((state) => {
      state.loading.update = true;
      state.error = null;
    });

    try {
      const { error } = await supabase
        .from("user_settings")
        .update({
          dark_mode: settings.dark_mode,
          time_format: settings.time_format,
        })
        .eq("id", settings.id);

      if (error) throw error;

      set((state) => {
        state.loading.update = false;
        state.hasUnsavedChanges = false;
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      set((state) => {
        state.error =
          error instanceof Error ? error.message : "Failed to save settings";
        state.loading.update = false;
      });
    }
  },

  resetSettings: async () => {
    set((state) => {
      state.loading.update = true;
      state.error = null;
    });

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("user_settings")
        .update({
          dark_mode: false,
          time_format: "12",
        })
        .eq("user_id", user.user.id);

      if (error) throw error;

      // Fetch updated settings
      const { data: updatedSettings, error: fetchError } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.user.id)
        .single();

      if (fetchError) throw fetchError;

      set((state) => {
        state.settings = updatedSettings;
        state.loading.update = false;
        state.hasUnsavedChanges = false;
      });
      
      // Apply dark mode change to document
      document.documentElement.classList.remove('dark');
    } catch (error) {
      console.error("Error resetting settings:", error);
      set((state) => {
        state.error =
          error instanceof Error ? error.message : "Failed to reset settings";
        state.loading.update = false;
      });
    }
  },

  // UI state management
  setActiveTab: (tab: SettingsState["activeTab"]) => {
    set((state) => {
      state.activeTab = tab;
    });
  },

  setHasUnsavedChanges: (hasChanges: boolean) => {
    set((state) => {
      state.hasUnsavedChanges = hasChanges;
    });
  },

  // Utility
  clearError: () => {
    set((state) => {
      state.error = null;
    });
  },

  reset: () => {
    // Unsubscribe from all subscriptions
    const state = get();
    Object.values(state.subscriptions).forEach((subscription) => {
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    });

    set((state) => {
      state.settings = null;
      state.loading = {
        settings: false,
        update: false,
      };
      state.error = null;
      state.hasUnsavedChanges = false;
      state.activeTab = 'preferences';
      state.subscriptions = {};
    });
  },
});