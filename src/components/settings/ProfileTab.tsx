import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Save, RotateCcw } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { shallow } from "zustand/shallow";
import SettingsSection from "./ui/SettingsSection";
import { getInitials } from "../../utils/userUtils";

const ProfileTab: React.FC = () => {
  // const { user, profile, loading, error } = useAuthStore(
  //   (state) => ({
  //     user: state.user,
  //     profile: state.profile,
  //     loading: state.loading,
  //     error: state.error,
  //   }),
  //   shallow
  // );
  const { profile, loading } = useAuthStore(
    (state) => ({
      user: state.user,
      profile: state.profile,
      loading: state.loading,
      error: state.error,
    }),
    shallow
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update functionality
    alert(
      "Profile update functionality will be implemented in a future update"
    );
    setHasChanges(false);
  };

  const handleReset = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
      });
    }
    setHasChanges(false);
  };

  if (!profile) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
        <div className="space-y-6">
          <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
          <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Profile Settings
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Avatar */}
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-300 text-2xl font-semibold">
            {getInitials(profile.name)}
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {profile.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {profile.email}
            </p>
            {/* TODO: add function to change avatar */}
            {/* <button
              type="button"
              className="mt-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              Change Avatar
            </button> */}
          </div>
        </div>

        <SettingsSection
          title="Personal Information"
          description="Update your personal details"
          icon={<User size={20} className="text-indigo-600" />}
        >
          <div className="space-y-4 py-3">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Full Name
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="pl-10 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10 w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-70 disabled:bg-gray-100 dark:disabled:bg-gray-700"
                  disabled
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email address cannot be changed
              </p>
            </div>
          </div>
        </SettingsSection>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            disabled={loading || !hasChanges}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RotateCcw size={16} />
            Reset Changes
          </motion.button>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading || !hasChanges}
            className="flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Save size={16} />
            Save Profile
            {hasChanges && (
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            )}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default ProfileTab;
