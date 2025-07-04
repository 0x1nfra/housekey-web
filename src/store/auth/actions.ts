import { supabase } from "../../lib/supabase";
import { SetStateFunction, GetStateFunction } from "./types";

/*
FIXME:  
1. update all calls to RPC
2. add state for errors/robust error handling
3. add logging to Sentry
4. split this store to match similiar to shopping store structure
5. add avatar/emoji to user profile data
*/

export const createAuthActions = (
  set: SetStateFunction,
  get: GetStateFunction
) => ({
  // New cleanup actions
  clearUserSession: () => {
    // Clear all localStorage items related to user session
    localStorage.removeItem("currentHubId");
    // Add any other localStorage keys you want to clear
    // localStorage.removeItem("userPreferences");
    // localStorage.removeItem("lastVisitedPage");

    // Reset auth state
    set((state) => {
      state.user = null;
      state.profile = null;
      state.error = null;
    });
  },

  resetAllStores: () => {
    // Import and reset hub store
    // We'll import this dynamically to avoid circular dependencies
    // FIXME: add resetStore()
    // import("./hubStore").then(({ useHubStore }) => {
    //   useHubStore.getState().resetStore();
    // });

    // Reset auth store
    get().clearUserSession();
  },

  // Actions
  signUp: async (email: string, password: string, name: string) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        set((state) => {
          state.loading = false;
          state.error = authError.message;
        });
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        set((state) => {
          state.loading = false;
          state.error = "Failed to create user account";
        });
        return { success: false, error: "Failed to create user account" };
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          id: authData.user.id,
          name,
          email,
        });

      if (profileError) {
        set((state) => {
          state.loading = false;
          state.error = profileError.message;
        });
        return { success: false, error: profileError.message };
      }

      // Fetch the created profile
      await get().fetchUserProfile(authData.user.id);

      set((state) => {
        state.user = authData.user;
        state.loading = false;
        state.error = null;
      });

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set((state) => {
        state.loading = false;
        state.error = errorMessage;
      });
      return { success: false, error: errorMessage };
    }
  },

  signIn: async (email: string, password: string) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

    try {
      // Clear any existing session data first
      get().clearUserSession();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set((state) => {
          state.loading = false;
          state.error = error.message;
        });
        return { success: false, error: error.message };
      }

      if (!data.user) {
        set((state) => {
          state.loading = false;
          state.error = "Failed to sign in";
        });
        return { success: false, error: "Failed to sign in" };
      }

      // Fetch user profile
      await get().fetchUserProfile(data.user.id);

      set((state) => {
        state.user = data.user;
        state.loading = false;
        state.error = null;
      });

      // Initialize hub store for the new user
      try {
        const { useHubStore } = await import("../hub");
        await useHubStore.getState().initializeHubs();
      } catch (error) {
        console.error("Error initializing hub store:", error);
      }

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set((state) => {
        state.loading = false;
        state.error = errorMessage;
      });
      return { success: false, error: errorMessage };
    }
  },

  signOut: async () => {
    set((state) => {
      state.loading = true;
    });

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        set((state) => {
          state.loading = false;
          state.error = error.message;
        });
        return;
      }

      // Clear all user data and localStorage
      get().resetAllStores();

      set((state) => {
        state.loading = false;
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set((state) => {
        state.loading = false;
        state.error = errorMessage;
      });
    }
  },

  initializeAuth: async () => {
    try {
      // Get initial session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error getting session:", error);
        set((state) => {
          state.initialized = true;
        });
        return;
      }

      if (session?.user) {
        await get().fetchUserProfile(session.user.id);
        set((state) => {
          state.user = session.user;
        });

        // Initialize hub store for the authenticated user
        import("../hub").then(({ useHubStore }) => {
          useHubStore.getState().initializeHubs();
        });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          try {
            // Clear any existing data first
            get().clearUserSession();

            await get().fetchUserProfile(session.user.id);
            set((state) => {
              state.user = session.user;
            });

            // Initialize hub store for the new user
            import("../hub").then(({ useHubStore }) => {
              useHubStore.getState().initializeHubs();
            });
          } catch (error) {
            console.error("Error fetching profile on auth change:", error);
          }
        } else if (event === "SIGNED_OUT") {
          // Reset all stores when user signs out
          get().resetAllStores();
        }
      });

      set((state) => {
        state.initialized = true;
      });
    } catch (error) {
      console.error("Error initializing auth:", error);
      set((state) => {
        state.initialized = true;
      });
    }
  },

  fetchUserProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }

      set((state) => {
        state.profile = data;
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  },

  clearError: () => set((state) => {
    state.error = null;
  }),

  // Utility
  reset: () => set((state) => {
    state.user = null;
    state.profile = null;
    state.loading = false;
    state.error = null;
    state.initialized = false;
  }),
});
