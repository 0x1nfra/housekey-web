import { create } from 'zustand';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  name: string;
  email: string;
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
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
  fetchUserProfile: (userId: string) => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  profile: null,
  loading: false,
  error: null,
  initialized: false,

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
        set({ loading: false, error: 'Failed to create user account' });
        return { success: false, error: 'Failed to create user account' };
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
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
        error: null 
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      set({ loading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        set({ loading: false, error: error.message });
        return { success: false, error: error.message };
      }

      if (!data.user) {
        set({ loading: false, error: 'Failed to sign in' });
        return { success: false, error: 'Failed to sign in' };
      }

      // Fetch user profile
      await get().fetchUserProfile(data.user.id);

      set({ 
        user: data.user,
        loading: false,
        error: null 
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
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

      set({ 
        user: null,
        profile: null,
        loading: false,
        error: null 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      set({ loading: false, error: errorMessage });
    }
  },

  initializeAuth: async () => {
    try {
      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        set({ initialized: true });
        return;
      }

      if (session?.user) {
        await get().fetchUserProfile(session.user.id);
        set({ user: session.user });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await get().fetchUserProfile(session.user.id);
          set({ user: session.user });
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, profile: null });
        }
      });

      set({ initialized: true });
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ initialized: true });
    }
  },

  fetchUserProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      set({ profile: data });
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  },

  clearError: () => set({ error: null }),
}));