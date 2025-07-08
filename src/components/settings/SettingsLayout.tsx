"use client";

import type React from "react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useSettingsStore } from "../../store/settings";
import { useAuthStore } from "../../store/auth";
import { shallow } from "zustand/shallow";
import { X, Settings, User, Home, Inbox } from "lucide-react";

interface SettingsLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
}) => {
  const { fetchUserSettings, clearError } = useSettingsStore(
    (state) => ({
      fetchUserSettings: state.fetchUserSettings,
      clearError: state.clearError,
    }),
    shallow
  );

  const { error } = useSettingsStore(
    (state) => ({
      error: state.error,
    }),
    shallow
  );

  const { user } = useAuthStore(
    (state) => ({
      user: state.user,
    }),
    shallow
  );

  useEffect(() => {
    if (user) {
      fetchUserSettings();
    }
  }, [user, fetchUserSettings]);

  const tabs = [
    // {
    //   id: "preferences",
    //   label: "App Preferences",
    //   shortLabel: "App",
    //   icon: Settings,
    // },
    { id: "profile", label: "Profile", shortLabel: "Profile", icon: User },
    { id: "hub", label: "Hub", shortLabel: "Hub", icon: Home },
    {
      id: "invitations",
      label: "Invitations",
      shortLabel: "Invites",
      icon: Inbox,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6"
        >
          <div className="flex items-center justify-between">
            <p className="text-red-700 font-content text-sm sm:text-base">
              {error}
            </p>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 transition-colors duration-300 ml-4"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        {/* Mobile Tab Navigation - Horizontal Scroll */}
        <div className="sm:hidden">
          <nav className="flex space-x-1 overflow-x-auto scrollbar-hide px-1 pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition-all duration-300 whitespace-nowrap font-interface min-w-fit min-h-[44px] ${
                    activeTab === tab.id
                      ? "border-sage-green text-sage-green-muted bg-sage-green-light/20"
                      : "border-transparent text-charcoal-muted hover:text-deep-charcoal hover:border-gray-300"
                  }`}
                >
                  <Icon size={16} />
                  <span className="text-xs">{tab.shortLabel}</span>
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Desktop Tab Navigation */}
        <div className="hidden sm:block">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  whileHover={{ y: -2 }}
                  className={`flex items-center gap-3 py-4 px-2 border-b-2 font-medium text-sm transition-all duration-300 whitespace-nowrap font-interface ${
                    activeTab === tab.id
                      ? "border-sage-green text-sage-green-muted"
                      : "border-transparent text-charcoal-muted hover:text-deep-charcoal hover:border-gray-300"
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </motion.button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="pb-16 sm:pb-8">{children}</div>
    </div>
  );
};

export default SettingsLayout;
