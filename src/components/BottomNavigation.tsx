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
} from "lucide-react";

const BottomNavigation: React.FC = () => {
  const navItems = [
    { to: "/dashboard", icon: Home, label: "Home" },
    { to: "/calendar", icon: Calendar, label: "Calendar" },
    { to: "/tasks", icon: CheckSquare, label: "Tasks" },
    { to: "/shopping", icon: ShoppingCart, label: "Shopping" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 font-interface ${
                isActive
                  ? "text-sage-green"
                  : "text-charcoal-muted hover:text-deep-charcoal"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`transition-colors duration-300 ${
                    isActive ? "text-sage-green" : ""
                  }`}
                >
                  <Icon size={20} />
                </motion.div>
                <span className="text-xs font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;
