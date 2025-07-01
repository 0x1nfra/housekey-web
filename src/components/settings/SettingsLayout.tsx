import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useSettingsStore } from "../../store/settings";
import { useAuthStore } from "../../store/authStore";
import { shallow } from "zustand/shallow";
// import { X, Settings, User, Home, Bell, Shield, Inbox } from "lucide-react";
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
    // TODO: add these tabs
    // { id: "notifications", label: "Notifications", icon: Bell },
    // { id: "privacy", label: "Privacy", icon: Shield },
  ];

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={clearError}
              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
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
