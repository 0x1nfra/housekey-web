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
      className="space-y-6 sm:space-y-8 p-4 sm:p-6"
    >
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-deep-charcoal font-chivo mb-2">
          App Preferences
        </h2>
        <p className="text-sm sm:text-base text-charcoal-muted font-lora">
          Customize how the app looks and feels for your best experience
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        <SettingsSection
          title="Appearance"
          description="Customize the visual theme and interface elements"
          icon={<Palette size={20} className="text-deep-charcoal" />}
        >
          <div className="space-y-4 sm:space-y-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-gray-100 last:border-b-0 gap-3 sm:gap-0">
              <div className="flex-1">
                <h4 className="text-base font-medium text-deep-charcoal font-chivo mb-1">
                  Dark Mode
                </h4>
                <p className="text-sm text-charcoal-muted font-lora">
                  Switch between light and dark themes for comfortable viewing
                </p>
              </div>
              <div className="flex justify-end sm:justify-start">
                <ToggleSwitch
                  checked={darkMode}
                  onChange={handleDarkModeToggle}
                  icons={{
                    checked: <Moon size={14} />,
                    unchecked: <Sun size={14} />,
                  }}
                />
              </div>
            </div>

            {/* Future settings can be added here */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 border-b border-gray-100 last:border-b-0 gap-3 sm:gap-0 opacity-50">
              <div className="flex-1">
                <h4 className="text-base font-medium text-deep-charcoal font-chivo mb-1">
                  Compact Mode
                </h4>
                <p className="text-sm text-charcoal-muted font-lora">
                  Reduce spacing for more content on screen
                </p>
              </div>
              <div className="flex justify-end sm:justify-start">
                <ToggleSwitch
                  checked={false}
                  onChange={() => {}}
                  disabled={true}
                />
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Coming Soon Section */}
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
              <h3 className="text-lg font-medium text-deep-charcoal font-chivo mb-2">
                More Options Coming Soon
              </h3>
              <p className="text-charcoal-muted font-lora max-w-md mx-auto text-sm sm:text-base">
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
