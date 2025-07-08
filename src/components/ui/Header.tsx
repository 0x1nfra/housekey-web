"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Bell, Settings, User, LogOut, ChevronDown, Home } from "lucide-react";
import { useAuthStore } from "../../store/auth";
import { useHubStore } from "../../store/hub";
import { useNotificationsStore } from "../../store/notifications";
import { shallow } from "zustand/shallow";
import HubSelector from "../hub/HubSelector";
import NotificationDropdown from "../notifications/NotificationDropdown";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { profile, signOut, user } = useAuthStore(
    (state) => ({
      profile: state.profile,
      signOut: state.signOut,
      user: state.user,
    }),
    shallow
  );
  const { currentHub } = useHubStore(
    (state) => ({ currentHub: state.currentHub }),
    shallow
  );
  const { unreadCount, fetchUnreadCount } = useNotificationsStore(
    (state) => ({
      unreadCount: state.unreadCount,
      fetchUnreadCount: state.fetchUnreadCount,
    }),
    shallow
  );

  const navigate = useNavigate();

  // Fetch unread count when user changes
  useEffect(() => {
    if (user?.id) {
      fetchUnreadCount(user.id);
    }
  }, [user?.id, fetchUnreadCount]);

  const handleLogout = () => {
    signOut();
    setIsUserMenuOpen(false);
  };

  const handleSettings = () => {
    navigate("/settings");
    setIsUserMenuOpen(false);
  };

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
    // Close user menu if open
    if (isUserMenuOpen) {
      setIsUserMenuOpen(false);
    }
  };

  const handleUserMenuClick = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    // Close notification dropdown if open
    if (isNotificationOpen) {
      setIsNotificationOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-52 bg-white border-b border-gray-200 z-30">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left Side - Empty on mobile, HubSelector is now in user menu */}
        <div className="flex items-center lg:hidden">
          {/* Empty space for mobile - HubSelector moved to user menu */}
        </div>

        {/* Desktop Left Spacer */}
        <div className="hidden lg:block w-32"></div>

        {/* Center - App Name and Logo */}
        <div className="flex items-center gap-2 lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
          <div className="w-8 h-8 bg-sage-green rounded-lg flex items-center justify-center">
            <Home size={20} className="text-deep-charcoal" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-deep-charcoal font-interface">
            HouseKey
          </h1>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 text-charcoal-muted hover:text-deep-charcoal hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Notifications"
              onClick={handleNotificationClick}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </motion.button>

            <NotificationDropdown
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
            />
          </div>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUserMenuClick}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px]"
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-sage-green rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <span className="text-deep-charcoal font-bold text-sm font-interface">
                  {profile?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <div className="text-left">
                  <div className="text-sm font-medium text-deep-charcoal font-interface max-w-[120px] truncate">
                    {profile?.name || "User"}
                  </div>
                  <div className="text-xs text-charcoal-muted font-interface max-w-[120px] truncate">
                    {profile?.email || "user@example.com"}
                  </div>
                </div>
                <ChevronDown size={16} className="text-charcoal-muted" />
              </div>
            </motion.button>

            {/* User Dropdown Menu */}
            <AnimatePresence>
              {isUserMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 sm:w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sage-green rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        <span className="text-deep-charcoal font-bold text-sm font-interface">
                          {profile?.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-deep-charcoal font-interface truncate">
                          {profile?.name || "User"}
                        </div>
                        <div className="text-xs text-charcoal-muted font-interface truncate">
                          {profile?.email || "user@example.com"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hub Selector - Mobile Only */}
                  <div className="lg:hidden px-4 py-3 border-b border-gray-100">
                    <div className="text-xs font-medium text-charcoal-muted uppercase tracking-wide mb-2 font-interface">
                      Current Hub
                    </div>
                    {currentHub ? (
                      <HubSelector />
                    ) : (
                      <div className="text-sm text-charcoal-muted font-interface">
                        No hub selected
                      </div>
                    )}
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-charcoal-muted hover:text-deep-charcoal hover:bg-gray-50 transition-colors font-interface min-h-[44px]">
                      <User size={16} />
                      Profile Settings
                    </button>
                    <button
                      onClick={handleSettings}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-charcoal-muted hover:text-deep-charcoal hover:bg-gray-50 transition-colors font-interface min-h-[44px]"
                    >
                      <Settings size={16} />
                      Settings
                    </button>
                  </div>

                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors font-interface min-h-[44px]"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
