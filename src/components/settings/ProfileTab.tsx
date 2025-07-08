"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Save,
  RotateCcw,
  Camera,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "../../store/auth";
import { shallow } from "zustand/shallow";
import SettingsSection from "./ui/SettingsSection";
import { getInitials } from "../../utils/userUtils";

const ProfileTab: React.FC = () => {
  const { profile, loading, updateProfile, error, clearError } = useAuthStore(
    (state) => ({
      profile: state.profile,
      loading: state.loading,
      updateProfile: state.updateProfile,
      error: state.error,
      clearError: state.clearError,
    }),
    shallow
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
      });
    }
  }, [profile]);

  // Clear messages after a few seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setHasChanges(true);
    // Clear any existing messages when user starts typing
    if (successMessage) setSuccessMessage("");
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasChanges || isSubmitting) return;

    setIsSubmitting(true);
    clearError();
    setSuccessMessage("");

    try {
      const result = await updateProfile({
        name: formData.name.trim(),
      });

      if (result.success) {
        setHasChanges(false);
        setSuccessMessage("Profile updated successfully!");
      } else {
        // Error is already set in the store by updateProfile
        console.error("Profile update failed:", result.error);
      }
    } catch (error) {
      console.error("Unexpected error during profile update:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
      });
    }
    setHasChanges(false);
    setSuccessMessage("");
    clearError();
  };

  if (!profile) {
    return (
      <div className="animate-pulse space-y-6 sm:space-y-8 p-4 sm:p-6">
        <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2 sm:w-1/4 mb-4 sm:mb-6"></div>
        <div className="space-y-4 sm:space-y-6">
          <div className="h-24 sm:h-32 bg-gray-100 rounded-xl"></div>
          <div className="h-20 sm:h-24 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 sm:space-y-8 p-4 sm:p-6"
    >
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-deep-charcoal font-chivo mb-2">
          Profile Settings
        </h2>
        <p className="text-sm sm:text-base text-charcoal-muted font-lora">
          Manage your personal information and account details
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800"
        >
          <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
          <span className="font-lora text-sm sm:text-base">
            {successMessage}
          </span>
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800"
        >
          <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
          <span className="font-lora text-sm sm:text-base">{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {/* Profile Avatar Section */}
        <div className="card">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-sage-green rounded-full flex items-center justify-center text-deep-charcoal text-2xl sm:text-3xl font-bold font-chivo">
                {getInitials(profile.name || "")}
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 bg-sage-green text-deep-charcoal rounded-full flex items-center justify-center shadow-md hover:bg-sage-green-hover transition-colors duration-300"
                title="Change avatar"
              >
                <Camera size={14} className="sm:size-4" />
              </motion.button>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-semibold text-deep-charcoal font-chivo mb-1">
                {profile.name}
              </h3>
              <p className="text-charcoal-muted font-lora mb-3 text-sm sm:text-base">
                {profile.email}
              </p>
              <p className="text-xs sm:text-sm text-charcoal-muted font-lora">
                Your profile picture helps others recognize you across the
                family hub
              </p>
            </div>
          </div>
        </div>

        <SettingsSection
          title="Personal Information"
          description="Update your personal details and contact information"
          icon={<User size={20} className="text-deep-charcoal" />}
        >
          <div className="space-y-4 sm:space-y-6 py-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-deep-charcoal font-chivo mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal-muted"
                />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field pl-12"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-deep-charcoal font-chivo mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal-muted"
                />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field pl-12 opacity-70 cursor-not-allowed"
                  disabled
                />
              </div>
              <p className="text-xs text-charcoal-muted font-lora mt-2">
                Email address cannot be changed for security reasons
              </p>
            </div>
          </div>
        </SettingsSection>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-gray-100">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            disabled={loading || isSubmitting || !hasChanges}
            className="btn-ghost w-full sm:w-auto"
          >
            <RotateCcw size={16} />
            Reset Changes
          </motion.button>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading || isSubmitting || !hasChanges}
            className="btn-primary relative w-full sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Profile
              </>
            )}
            {hasChanges && !isSubmitting && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-sage-green rounded-full animate-pulse"></span>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};

export default ProfileTab;
