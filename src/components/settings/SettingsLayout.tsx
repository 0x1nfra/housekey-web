"use client";

import type React from "react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { useSettingsStore } from "../../store/settings";
import { useHubStore } from "../../store/hub";
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
    { id: "preferences", label: "App Preferences", icon: Settings },
    { id: "profile", label: "Profile", icon: User },
    { id: "hub", label: "Hub", icon: Home },
    { id: "invitations", label: "Invitations", icon: Inbox },
  ];

  return (
    <div className="space-y-8">
      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-6"
        >
          <div className="flex items-center justify-between">
            <p className="text-red-700 font-content">{error}</p>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 transition-colors duration-300"
            >
              <X size={18} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                whileHover={{ y: -2 }}
                className={`flex items-center gap-3 py-4 px-2 border-b-2 font-medium text-sm transition-all duration-300 whitespace-nowrap font-interface ${
                  activeTab === tab.id
                    ? "border-sage-green text-sage-green"
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

      {/* Tab Content */}
      <div className="pb-16">{children}</div>
    </div>
  );
};

export default SettingsLayout;
