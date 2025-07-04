"use client";

import type React from "react";
import { useState } from "react";
import { Bell, Settings, User, LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useHubStore } from "../store/hubStore";
import { shallow } from "zustand/shallow";
import HubSelector from "./hub/HubSelector";
import { motion } from "framer-motion";
import { AnimatePresence } from "framer-motion";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { currentHub } = useHubStore(
    (state) => ({ currentHub: state.currentHub }),
    shallow
  );

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 md:left-52 bg-white border-b border-gray-200 z-30">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Mobile Hub Selector - only show on mobile */}
        <div className="flex items-center md:hidden">
          {currentHub && <HubSelector />}
        </div>

        {/* Desktop: Page Title or Breadcrumb */}
        <div className="hidden md:flex items-center">
          <h1 className="text-lg font-semibold text-deep-charcoal font-interface">
            Dashboard
          </h1>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-charcoal-muted hover:text-deep-charcoal hover:bg-gray-100 rounded-lg transition-colors relative"
            aria-label="Notifications"
          >
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </motion.button>

          {/* Settings - hide on desktop since it's in sidebar */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="md:hidden p-2 text-charcoal-muted hover:text-deep-charcoal hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Settings"
          >
            <Settings size={20} />
          </motion.button>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="User menu"
            >
              <div className="w-8 h-8 bg-sage-green rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <span className="text-deep-charcoal font-bold text-sm font-interface">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="hidden md:flex items-center gap-1">
                <div className="text-left">
                  <div className="text-sm font-medium text-deep-charcoal font-interface">
                    {user?.name || "User"}
                  </div>
                  <div className="text-xs text-charcoal-muted font-interface">
                    {user?.email || "user@example.com"}
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
                  className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sage-green rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        <span className="text-deep-charcoal font-bold text-sm font-interface">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-deep-charcoal font-interface">
                          {user?.name || "User"}
                        </div>
                        <div className="text-xs text-charcoal-muted font-interface">
                          {user?.email || "user@example.com"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-charcoal-muted hover:text-deep-charcoal hover:bg-gray-50 transition-colors font-interface">
                      <User size={16} />
                      Profile Settings
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-charcoal-muted hover:text-deep-charcoal hover:bg-gray-50 transition-colors font-interface">
                      <Settings size={16} />
                      Preferences
                    </button>
                  </div>

                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors font-interface"
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
