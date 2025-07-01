import { SettingsState } from './types';

export const initialState: SettingsState = {
  // Settings data
  settings: null,
  
  // UI State
  loading: {
    settings: false,
    update: false,
  },
  error: null,
  hasUnsavedChanges: false,
  activeTab: 'preferences',
  
  // Realtime subscriptions
  subscriptions: {},
};