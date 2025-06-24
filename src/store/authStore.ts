import { create } from "zustand";
import { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

interface AuthActions {
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; error?: string }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
  fetchUserProfile: (userId: string) => Promise<void>;
  // New actions for cleanup
  clearUserSession: () => void;
  resetAllStores: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  profile: null,
  loading: false,
  error: null,
  initialized: false,

  // New cleanup actions
  clearUserSession: () => {
    // Clear all localStorage items related to user session
    localStorage.removeItem("currentHubId");
    // Add any other localStorage keys you want to clear
    // localStorage.removeItem("userPreferences");
    // localStorage.removeItem("lastVisitedPage");

    // Reset auth state
    set({
      user: null,
      profile: null,
      error: null,
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
    set({ loading: true, error: null });

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        set({ loading: false, error: authError.message });
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        set({ loading: false, error: "Failed to create user account" });
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
        set({ loading: false, error: profileError.message });
        return { success: false, error: profileError.message };
      }

      // Fetch the created profile
      await get().fetchUserProfile(authData.user.id);

      set({
        user: authData.user,
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });

    try {
      // Clear any existing session data first
      get().clearUserSession();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ loading: false, error: error.message });
        return { success: false, error: error.message };
      }

      if (!data.user) {
        set({ loading: false, error: "Failed to sign in" });
        return { success: false, error: "Failed to sign in" };
      }

      // Fetch user profile
      await get().fetchUserProfile(data.user.id);

      set({
        user: data.user,
        loading: false,
        error: null,
      });

      // Initialize hub store for the new user
      import("./hubStore").then(({ useHubStore }) => {
        useHubStore.getState().initializeHubs();
      });

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  signOut: async () => {
    set({ loading: true });

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        set({ loading: false, error: error.message });
        return;
      }

      // Clear all user data and localStorage
      get().resetAllStores();

      set({ loading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      set({ loading: false, error: errorMessage });
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
        set({ initialized: true });
        return;
      }

      if (session?.user) {
        await get().fetchUserProfile(session.user.id);
        set({ user: session.user });

        // Initialize hub store for the authenticated user
        import("./hubStore").then(({ useHubStore }) => {
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
            set({ user: session.user });

            // Initialize hub store for the new user
            import("./hubStore").then(({ useHubStore }) => {
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

      set({ initialized: true });
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({ initialized: true });
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

      set({ profile: data });
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  },

  clearError: () => set({ error: null }),
}));
