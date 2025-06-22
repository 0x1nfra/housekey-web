import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

const DashboardHeader: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSigningOut, setIsSigningOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, profile, signOut } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setIsSigningOut(false);
      setIsDropdownOpen(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const menuItems = [
    {
      icon: Settings,
      label: "Settings",
      onClick: () => {
        navigate("/settings");
        setIsDropdownOpen(false);
      },
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      onClick: () => {
        setIsDropdownOpen(false);
      },
    },
  ];

  return (
    <header className="px-6 py-4">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* Left: App Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <span className="font-semibold text-lg text-gray-800">Harmony</span>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-lg px-8">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 pl-10 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="Search..."
            />
          </div>
        </div>

        {/* Right: Notifications and Profile */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
            </span>
          </motion.button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                {profile?.name ? getInitials(profile.name) : <User size={20} />}
              </div>

              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.name || "User"}
                </p>
                <p className="text-xs text-gray-500">
                  {profile?.email || user?.email}
                </p>
              </div>

              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
                >
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
                        {profile?.name ? (
                          getInitials(profile.name)
                        ) : (
                          <User size={24} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {profile?.name || "User"}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {profile?.email || user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    {menuItems.map((item, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ backgroundColor: "rgb(249 250 251)" }}
                        onClick={item.onClick}
                        className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        <item.icon size={16} />
                        <span className="text-sm">{item.label}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* Sign Out */}
                  <div className="border-t border-gray-100 pt-2">
                    <motion.button
                      whileHover={{ backgroundColor: "rgb(254 242 242)" }}
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSigningOut ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <LogOut size={16} />
                      )}
                      <span className="text-sm">
                        {isSigningOut ? "Signing out..." : "Sign out"}
                      </span>
                    </motion.button>
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

export default DashboardHeader;
