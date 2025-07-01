import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import ToggleSwitch from "./ui/ToggleSwitch";
import SettingsSection from "./ui/SettingsSection";

const AppPreferencesTab: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  const handleDarkModeToggle = () => {
    toggleDarkMode();
  };

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
      </div>
    </div>
  );
};

export default AppPreferencesTab;
