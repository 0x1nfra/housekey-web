import { User } from "@supabase/supabase-js";
import { RealtimeChannel } from "@supabase/supabase-js";

// User Settings
export interface UserSettings {
  id: string;
  user_id: string;
  dark_mode: boolean;
  time_format: '12' | '24';
  created_at: string;
  updated_at: string;
}

// Settings State
export interface SettingsState {
  settings: UserSettings | null;
  loading: {
    settings: boolean;
    update: boolean;
  };
  error: string | null;
  hasUnsavedChanges: boolean;
  activeTab: 'preferences' | 'profile' | 'hub' | 'invitations' | 'notifications' | 'privacy';
  subscriptions: Record<string, SubscriptionGroup>;
}

// Settings Store Actions
export interface SettingsActions {
  // Data fetching
  fetchUserSettings: () => Promise<void>;
  
  // CRUD operations
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
  saveSettings: () => Promise<void>;
  resetSettings: () => Promise<void>;
  
  // UI state management
  setActiveTab: (tab: SettingsState['activeTab']) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  
  // Subscription management
  subscribeToSettings: (userId: string) => void;
  unsubscribeFromSettings: (userId: string) => void;
  
  // Utility
  clearError: () => void;
  reset: () => void;
}

export interface SubscriptionGroup {
  settings: RealtimeChannel;
  unsubscribe: () => void;
}

export type SettingsStore = SettingsState & SettingsActions;

// Helper types for function signatures
export type SetStateFunction = (fn: (state: SettingsState) => void) => void;
export type GetStateFunction = () => SettingsStore;

export interface Result<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Define the set/get function types for immer
export type ImmerSet = (
  nextStateOrUpdater:
    | SettingsStore
    | Partial<SettingsStore>
    | ((state: SettingsStore) => void),
  shouldReplace?: boolean
) => void;

export type ImmerGet = () => SettingsStore;