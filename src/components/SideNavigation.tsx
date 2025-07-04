"use client";

import type React from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  Calendar,
  CheckSquare,
  ShoppingCart,
  Settings,
  // Search,
  Bell,
  ChevronDown,
} from "lucide-react";
import HubSelector from "./hub/HubSelector";
import { useHubStore } from "../store/hubStore";
import { shallow } from "zustand/shallow";
import { version } from "../../package.json";

const SideNavigation: React.FC = () => {
  const { currentHub } = useHubStore(
    (state) => ({ currentHub: state.currentHub }),
    shallow
  );

  const navItems = [
    // { to: "/search", icon: Search, label: "Search" },
    { to: "/dashboard", icon: Home, label: "Dashboard" },
    { to: "/calendar", icon: Calendar, label: "Calendar" },
    { to: "/tasks", icon: CheckSquare, label: "Tasks" },
    { to: "/shopping", icon: ShoppingCart, label: "Shopping" },
    { to: "/notifications", icon: Bell, label: "Notifications" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="hidden md:flex md:flex-col fixed left-0 top-0 bottom-0 w-52 bg-white border-r border-gray-200 z-40">
      {/* Hub Selector Section - Most Prominent */}
      <div className="p-3 border-b border-gray-100">
        {currentHub ? (
          <HubSelector />
        ) : (
          <div className="flex items-center gap-3 p-3 bg-sage-green-light rounded-lg border border-sage-green/20 hover:bg-sage-green/10 transition-colors cursor-pointer">
            <div className="w-8 h-8 bg-sage-green rounded flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm font-interface">
                J
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-deep-charcoal font-interface truncate">
                Jones
              </div>
              <div className="text-xs text-gray-600 font-interface">1 hub</div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
        )}
      </div>

      {/* Main Navigation Section */}
      <nav className="flex-1 px-2 py-2">
        <div className="space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 font-interface group text-sm ${
                  isActive
                    ? "bg-sage-green-light text-deep-charcoal font-medium"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`transition-colors duration-200 ${
                      isActive
                        ? "text-sage-green"
                        : "text-gray-500 group-hover:text-gray-700"
                    }`}
                  >
                    <Icon size={16} className="text-deep-charcoal" />
                  </motion.div>
                  <span className="font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-gray-100">
        <div className="text-xs text-gray-500 font-interface">
          <div className="flex items-center gap-2">
            <span>HouseKey v{version}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SideNavigation;
