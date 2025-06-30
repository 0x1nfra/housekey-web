import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSettingsStore } from '../../store/settings';
import { shallow } from 'zustand/shallow';

interface ThemeContextType {
  darkMode: boolean;
  timeFormat: '12' | '24';
  toggleDarkMode: () => void;
  setTimeFormat: (format: '12' | '24') => void;
}

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  timeFormat: '12',
  toggleDarkMode: () => {},
  setTimeFormat: () => {},
});

export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { settings, updateSettings, saveSettings, fetchUserSettings } = useSettingsStore(
    (state) => ({
      settings: state.settings,
      updateSettings: state.updateSettings,
      saveSettings: state.saveSettings,
      fetchUserSettings: state.fetchUserSettings,
    }),
    shallow
  );

  const [darkMode, setDarkMode] = useState(settings?.dark_mode || false);
  const [timeFormat, setTimeFormatState] = useState<'12' | '24'>(settings?.time_format || '12');

  // Initialize settings on mount
  useEffect(() => {
    fetchUserSettings();
  }, [fetchUserSettings]);

  // Update local state when settings change
  useEffect(() => {
    if (settings) {
      setDarkMode(settings.dark_mode);
      setTimeFormatState(settings.time_format);
    }
  }, [settings]);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    const newValue = !darkMode;
    setDarkMode(newValue);
    if (settings) {
      updateSettings({ dark_mode: newValue });
      saveSettings();
    }
  };

  const setTimeFormat = (format: '12' | '24') => {
    setTimeFormatState(format);
    if (settings) {
      updateSettings({ time_format: format });
      saveSettings();
    }
  };

  const value = {
    darkMode,
    timeFormat,
    toggleDarkMode,
    setTimeFormat,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;