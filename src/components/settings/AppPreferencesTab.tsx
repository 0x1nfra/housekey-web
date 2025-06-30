// import React, { useState, useEffect } from "react";
import React from "react";
// import { motion } from "framer-motion";
// import { Moon, Sun, Clock, RotateCcw, Save } from "lucide-react";
import { Moon, Sun } from "lucide-react";
import { useSettingsStore } from "../../store/settings";
import { useTheme } from "./ThemeProvider";
import { shallow } from "zustand/shallow";
import ToggleSwitch from "./ui/ToggleSwitch";
// import RadioGroup from "./ui/RadioGroup";
import SettingsSection from "./ui/SettingsSection";

const AppPreferencesTab: React.FC = () => {
  const {
    settings,
    // updateSettings,
    // saveSettings,
    // resetSettings,
    // hasUnsavedChanges,
  } = useSettingsStore(
    (state) => ({
      settings: state.settings,
      updateSettings: state.updateSettings,
      saveSettings: state.saveSettings,
      resetSettings: state.resetSettings,
      hasUnsavedChanges: state.hasUnsavedChanges,
    }),
    shallow
  );

  // const { loading } = useSettingsStore(
  //   (state) => ({
  //     loading: state.loading,
  //   }),
  //   shallow
  // );

  // TODO: add time format
  // const { darkMode, timeFormat, toggleDarkMode, setTimeFormat } = useTheme();
  const { darkMode, toggleDarkMode } = useTheme();

  // const handleDarkModeToggle = (checked: boolean) => {
  //   toggleDarkMode();
  // };

  const handleDarkModeToggle = () => {
    toggleDarkMode();
  };

  // TODO: add time format
  // const handleTimeFormatChange = (value: string) => {
  //   const format = value as "12" | "24";
  //   setTimeFormat(format);
  // };

  // const handleSave = async () => {
  //   await saveSettings();
  // };

  // const handleReset = async () => {
  //   if (
  //     window.confirm("Are you sure you want to reset all settings to default?")
  //   ) {
  //     await resetSettings();
  //   }
  // };

  if (!settings) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-6">
          <div className="h-24 bg-gray-100 rounded-lg"></div>
          <div className="h-24 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        App Preferences
      </h2>

      <div className="space-y-6">
        <SettingsSection
          title="Appearance"
          description="Customize how the app looks"
          icon={<Sun size={20} className="text-amber-600" />}
        >
          <div className="flex items-center justify-between py-3">
            <div>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Dark Mode
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Switch between light and dark themes
              </p>
            </div>
            <ToggleSwitch
              checked={darkMode}
              onChange={handleDarkModeToggle}
              icons={{
                checked: <Moon size={14} />,
                unchecked: <Sun size={14} />,
              }}
            />
          </div>
        </SettingsSection>

        {/* <SettingsSection
          title="Time Format"
          description="Choose how times are displayed throughout the app"
          icon={<Clock size={20} className="text-blue-600" />}
        >
          <RadioGroup
            name="timeFormat"
            value={timeFormat}
            onChange={handleTimeFormatChange}
            options={[
              { value: "12", label: "12-hour (1:30 PM)" },
              { value: "24", label: "24-hour (13:30)" },
            ]}
          />
        </SettingsSection> */}
      </div>

      {/* FIXME: do we need this? */}
      {/* Action Buttons */}
      {/* <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleReset}
          disabled={loading.update}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <RotateCcw size={16} />
          Reset to Defaults
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={loading.update || !hasUnsavedChanges}
          className="flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          Save Changes
          {hasUnsavedChanges && (
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          )}
        </motion.button>
      </div> */}
    </div>
  );
};

export default AppPreferencesTab;
