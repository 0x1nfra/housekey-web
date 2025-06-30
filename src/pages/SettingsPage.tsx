import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import SettingsLayout from "../components/settings/SettingsLayout";
import AppPreferencesTab from "../components/settings/AppPreferencesTab";
import ProfileTab from "../components/settings/ProfileTab";
import HubSettings from "../components/hub/HubSettings";
import InvitationsList from "../components/hub/InvitationsList";
import NotificationsTab from "../components/settings/NotificationsTab";
import PrivacyTab from "../components/settings/PrivacyTab";
import { useHubStore } from "../store/hubStore";
import { useSettingsStore } from "../store/settings";
import { shallow } from "zustand/shallow";

const SettingsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setActiveTab } = useSettingsStore(
    (state) => ({
      setActiveTab: state.setActiveTab,
    }),
    shallow
  );

  const { switchHub } = useHubStore(
    (state) => ({ switchHub: state.switchHub }),
    shallow
  );

  // Get tab from URL or default to 'preferences'
  const initialTab = searchParams.get("tab") || "preferences";
  const [activeTab, setActiveTabState] = useState(initialTab);

  // Sync URL with active tab
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTabState(tabFromUrl);
    } else if (!tabFromUrl && activeTab !== "preferences") {
      setSearchParams({ tab: activeTab });
    }
  }, [searchParams, activeTab, setSearchParams]);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTabState(tab);
    setSearchParams({ tab });
    setActiveTab(tab as any);
  };

  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "preferences":
        return <AppPreferencesTab />;
      case "profile":
        return <ProfileTab />;
      case "hub":
        return (
          <HubSettings
            activeTab={searchParams.get("subtab") || "general"}
            action={searchParams.get("action") || undefined}
          />
        );
      case "invitations":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Your Invitations
              </h3>
              <p className="text-sm text-gray-500">
                Hub invitations you've received from other users
              </p>
            </div>

            <InvitationsList onHubSwitch={switchHub} />
          </motion.div>
        );
      case "notifications":
        return <NotificationsTab />;
      case "privacy":
        return <PrivacyTab />;
      default:
        return <AppPreferencesTab />;
    }
  };

  return (
    <div className="px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-gray-100">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your family hub experience
          </p>
        </div>

        <SettingsLayout activeTab={activeTab} onTabChange={handleTabChange}>
          {renderTabContent()}
        </SettingsLayout>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
