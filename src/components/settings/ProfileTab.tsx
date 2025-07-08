"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Save, RotateCcw, Camera, CheckCircle, AlertCircle } from "lucide-react";
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
      <div className="animate-pulse space-y-8">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-6">
          <div className="h-32 bg-gray-100 rounded-xl"></div>
          <div className="h-24 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-deep-charcoal font-interface mb-2">
          Profile Settings
        </h2>
        <p className="text-charcoal-muted font-content">
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
          <CheckCircle size={20} className="text-green-600" />
          <span className="font-content">{successMessage}</span>
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
          <AlertCircle size={20} className="text-red-600" />
          <span className="font-content">{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Avatar Section */}
        <div className="card">
          <div className="card-content">
            <div className="flex items-center gap-8">
              <div className="relative">
                <div className="w-24 h-24 bg-sage-green-light rounded-full flex items-center justify-center text-deep-charcoal text-3xl font-bold font-interface">
                  {getInitials(profile.name || "")}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  className="absolute -bottom-2 -right-2 w-10 h-10 bg-sage-green text-deep-charcoal rounded-full flex items-center justify-center shadow-md hover:bg-sage-green-hover transition-colors duration-300"
                  title="Change avatar"
                >
                  <Camera size={16} />
                </motion.button>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-deep-charcoal font-interface mb-1">
                  {profile.name}
                </h3>
                <p className="text-charcoal-muted font-content mb-3">
                  {profile.email}
                </p>
                <p className="text-sm text-charcoal-muted font-content">
                  Your profile picture helps others recognize you across the
                  family hub
                </p>
              </div>
            </div>
          </div>
        </div>

        <SettingsSection
          title="Personal Information"
          description="Update your personal details and contact information"
          icon={<User size={20} className="text-deep-charcoal" />}
        >
          <div className="space-y-6 py-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-deep-charcoal font-interface mb-2"
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
                  className="w-full input pl-12"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-deep-charcoal font-interface mb-2"
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
                  className="input pl-12 opacity-70 cursor-not-allowed"
                  disabled
                />
              </div>
              <p className="text-xs text-charcoal-muted font-content mt-2">
                Email address cannot be changed for security reasons
              </p>
            </div>
          </div>
        </SettingsSection>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            disabled={loading || isSubmitting || !hasChanges}
            className="btn btn-ghost"
          >
            <RotateCcw size={16} />
            Reset Changes
          </motion.button>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading || isSubmitting || !hasChanges}
            className="btn btn-primary relative"
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
