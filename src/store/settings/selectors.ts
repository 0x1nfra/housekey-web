import { SettingsState } from './types';

export const createSettingsSelectors = (state: SettingsState) => ({
  // Basic selectors
  getSettings: () => state.settings,
  
  getDarkMode: () => state.settings?.dark_mode || false,
  
  getTimeFormat: () => state.settings?.time_format || '12',
  
  getActiveTab: () => state.activeTab,
  
  getHasUnsavedChanges: () => state.hasUnsavedChanges,
  
  // Loading selectors
  isLoading: (type?: keyof SettingsState['loading']) => {
    if (type) {
      return state.loading[type];
    }
    return Object.values(state.loading).some(loading => loading);
  },
  
  // Error selectors
  getError: () => state.error,
  
  hasError: () => !!state.error,
});