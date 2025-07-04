"use client";

import type React from "react";
import { Moon, Sun, Palette } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import ToggleSwitch from "./ui/ToggleSwitch";
import SettingsSection from "./ui/SettingsSection";
import { motion } from "framer-motion";

const AppPreferencesTab: React.FC = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  const handleDarkModeToggle = () => {
    toggleDarkMode();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-deep-charcoal font-interface mb-2">
          App Preferences
        </h2>
        <p className="text-charcoal-muted font-content">
          Customize how the app looks and feels for your best experience
        </p>
      </div>

      <div className="space-y-8">
        <SettingsSection
          title="Appearance"
          description="Customize the visual theme and interface elements"
          icon={<Palette size={20} className="text-sage-green" />}
        >
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
              <div>
                <h4 className="text-base font-medium text-deep-charcoal font-interface mb-1">
                  Dark Mode
                </h4>
                <p className="text-sm text-charcoal-muted font-content">
                  Switch between light and dark themes for comfortable viewing
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

            <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 opacity-50">
              <div>
                <h4 className="text-base font-medium text-deep-charcoal font-interface mb-1">
                  Compact Mode
                </h4>
                <p className="text-sm text-charcoal-muted font-content">
                  Reduce spacing for more content on screen
                </p>
              </div>
              <ToggleSwitch
                checked={false}
                onChange={() => {}}
                disabled={true}
              />
            </div>

            <div className="flex items-center justify-between py-4 opacity-50">
              <div>
                <h4 className="text-base font-medium text-deep-charcoal font-interface mb-1">
                  Animations
                </h4>
                <p className="text-sm text-charcoal-muted font-content">
                  Enable smooth transitions and micro-interactions
                </p>
              </div>
              <ToggleSwitch
                checked={true}
                onChange={() => {}}
                disabled={true}
              />
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Interface"
          description="Adjust interface behavior and preferences"
          icon={<Sun size={20} className="text-sage-green" />}
        >
          <div className="py-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-sage-green-light rounded-full flex items-center justify-center mx-auto mb-4">
                <Sun size={24} className="text-sage-green" />
              </div>
              <h3 className="text-lg font-medium text-deep-charcoal font-interface mb-2">
                More Options Coming Soon
              </h3>
              <p className="text-charcoal-muted font-content max-w-md mx-auto">
                Additional interface customization options will be available in
                future updates, including font size controls, layout
                preferences, and accessibility settings.
              </p>
            </div>
          </div>
        </SettingsSection>
      </div>
    </motion.div>
  );
};

export default AppPreferencesTab;
