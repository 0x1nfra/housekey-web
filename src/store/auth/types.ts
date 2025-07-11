import { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export interface AuthActions {
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
  updateProfile: (updates: Partial<Pick<UserProfile, 'name' | 'avatarUrl'>>) => Promise<{ success: boolean; error?: string }>;
  // New actions for cleanup
  clearUserSession: () => void;
  resetAllStores: () => void;

  // Utility
  reset: () => void;
}

export type AuthStore = AuthState & AuthActions;

// Helper types for function signatures
export type SetStateFunction = (fn: (state: AuthState) => void) => void;
export type GetStateFunction = () => AuthStore;
