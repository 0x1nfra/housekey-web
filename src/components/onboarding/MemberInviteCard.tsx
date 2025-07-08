"use client";

import type React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Check, User } from "lucide-react";

interface MemberInviteCardProps {
  memberType: string;
  onInviteSent: (email: string) => void;
}

const MemberInviteCard: React.FC<MemberInviteCardProps> = ({
  memberType,
  onInviteSent,
}) => {
  const [email, setEmail] = useState("");
  const [isInvited, setIsInvited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInvite = async () => {
    if (!email.trim()) {
      setError("Email address is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsLoading(false);
      setIsInvited(true);
      onInviteSent(email);
    } catch (err) {
      setIsLoading(false);
      setError("Failed to send invitation. Please try again.");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleInvite();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-sage-green-500 dark:hover:border-sage-green-400 transition-all duration-200 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-sage-green-100 dark:bg-sage-green-900 rounded-lg flex items-center justify-center">
          <User
            size={18}
            className="text-sage-green-600 dark:text-sage-green-400"
          />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {memberType}
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Invite via email
          </p>
        </div>
      </div>

      {!isInvited ? (
        <div className="space-y-4">
          <div>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                size={16}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                onKeyPress={handleKeyPress}
                className={`w-full pl-10 pr-4 py-3 border rounded-lg text-sm transition-colors focus:ring-2 focus:ring-sage-green-500 focus:border-sage-green-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 ${
                  error
                    ? "border-red-300 dark:border-red-600"
                    : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Enter email address"
                disabled={isLoading}
              />
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 dark:text-red-400 text-xs mt-2"
              >
                {error}
              </motion.p>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleInvite}
            disabled={isLoading || !email.trim()}
            className="w-full bg-sage-green-600 hover:bg-sage-green-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors text-sm disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending invitation...
              </>
            ) : (
              <>
                <Mail size={16} />
                Send Email Invitation
              </>
            )}
          </motion.button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800"
        >
          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
            <Check
              size={16}
              className="text-emerald-600 dark:text-emerald-400"
            />
          </div>
          <div>
            <p className="text-emerald-700 dark:text-emerald-400 font-medium text-sm">
              Invitation sent successfully!
            </p>
            <p className="text-emerald-600 dark:text-emerald-500 text-xs">
              Sent to {email}
            </p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default MemberInviteCard;
