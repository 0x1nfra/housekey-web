"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { Settings } from "lucide-react";
import SettingsLayout from "../components/settings/SettingsLayout";
import AppPreferencesTab from "../components/settings/AppPreferencesTab";
import ProfileTab from "../components/settings/ProfileTab";
import HubSettings from "../components/hub/HubSettings";
import InvitationsList from "../components/hub/InvitationsList";
import NotificationsTab from "../components/settings/NotificationsTab";
import PrivacyTab from "../components/settings/PrivacyTab";
import { useHubStore } from "../store/hub";
import { type SettingsState, useSettingsStore } from "../store/settings";
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

  const initialTab = searchParams.get("tab") || "preferences";
  const [activeTab, setActiveTabState] = useState(initialTab);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTabState(tabFromUrl);
    } else if (!tabFromUrl && activeTab !== "preferences") {
      setSearchParams({ tab: activeTab });
    }
  }, [searchParams, activeTab, setSearchParams]);

  const handleTabChange = (tab: SettingsState["activeTab"] | string) => {
    setActiveTabState(tab);
    setSearchParams({ tab });
    const validTabs = [
      "preferences",
      "profile",
      "hub",
      "invitations",
      "notifications",
      "privacy",
    ];
    if (validTabs.includes(tab)) {
      setActiveTab(tab as SettingsState["activeTab"]);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      // case "preferences":
      //   return <AppPreferencesTab />;
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
              <h3 className="text-lg font-semibold text-deep-charcoal font-interface">
                Your Invitations
              </h3>
              <p className="text-sm text-charcoal-muted font-content">
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
        return <ProfileTab />;
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6 sm:space-y-8"
      >
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sage-green-light rounded-xl flex items-center justify-center">
              <Settings size={20} className="sm:size-6 text-deep-charcoal" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-deep-charcoal font-interface mb-1 sm:mb-2">
                Settings
              </h1>
              <p className="text-sm sm:text-base text-charcoal-muted font-content">
                Customize your family hub experience and preferences
              </p>
            </div>
          </div>
        </div>

        <SettingsLayout activeTab={activeTab} onTabChange={handleTabChange}>
          {renderTabContent()}
        </SettingsLayout>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
