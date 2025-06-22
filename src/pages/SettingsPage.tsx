import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Shield, Users, Home } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { getInitials } from "../utils/userUtils";
import { useSearchParams } from "react-router-dom";
import HubSettings from "../components/hub/HubSettings";

const SettingsPage: React.FC = () => {
  const { user, profile } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const tabs = [
    { id: 'profile', label: 'Profile', icon: Users },
    { id: 'hubs', label: 'Hubs', icon: Home },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  ];

  const settingsSections = [
    {
      title: "Notifications",
      icon: Bell,
      color: "bg-indigo-100 text-indigo-600",
      settings: [
        {
          name: "Task Reminders",
          description: "Get notified about upcoming tasks",
          enabled: true,
        },
        {
          name: "Calendar Events",
          description: "Notifications for scheduled events",
          enabled: true,
        },
        {
          name: "Shopping Updates",
          description: "When items are added to lists",
          enabled: false,
        },
        {
          name: "Family Activity",
          description: "Updates on family member actions",
          enabled: true,
        },
      ],
    },
    {
      title: "Privacy & Security",
      icon: Shield,
      color: "bg-emerald-100 text-emerald-600",
      settings: [
        {
          name: "Location Sharing",
          description: "Share location with family members",
          enabled: false,
        },
        {
          name: "Activity Visibility",
          description: "Show your activity to family",
          enabled: true,
        },
        {
          name: "Data Backup",
          description: "Automatic cloud backup",
          enabled: true,
        },
        {
          name: "Two-Factor Auth",
          description: "Extra security for your account",
          enabled: false,
        },
      ],
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-8">
            {/* Profile Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Profile Information
              </h2>

              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-3xl">
                  {profile?.name ? getInitials(profile.name) : <span>👤</span>}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {profile?.name || "User"}
                  </h3>
                  <p className="text-gray-600">Family Manager</p>
                  <p className="text-sm text-gray-500">
                    {profile?.email || user?.email || "no-email@example.com"}
                  </p>
                </div>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">127</div>
                  <div className="text-sm text-gray-600">Tasks Completed</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-emerald-600">45</div>
                  <div className="text-sm text-gray-600">Events Created</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-amber-600">89</div>
                  <div className="text-sm text-gray-600">Items Added</div>
                </div>
              </div>
            </motion.div>

            {/* App Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                App Preferences
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Theme
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option>Light</option>
                    <option>Dark</option>
                    <option>Auto</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Language
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>German</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Time Format
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option>12-hour</option>
                    <option>24-hour</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Start of Week
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option>Sunday</option>
                    <option>Monday</option>
                  </select>
                </div>
              </div>
            </motion.div>
          </div>
        );

      case 'hubs':
        return (
          <HubSettings 
            activeTab={searchParams.get('subtab') || 'general'} 
            action={searchParams.get('action') || undefined}
          />
        );

      case 'notifications':
      case 'privacy':
        const section = settingsSections.find(s => 
          s.title.toLowerCase().includes(activeTab === 'notifications' ? 'notification' : 'privacy')
        );
        
        if (!section) return null;

        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${section.color}`}>
                <section.icon size={20} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                {section.title}
              </h2>
            </div>

            <div className="space-y-4">
              {section.settings.map((setting, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {setting.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {setting.description}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked={setting.enabled}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Customize your family hub experience</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </motion.div>
    </div>
  );
};

export default SettingsPage;