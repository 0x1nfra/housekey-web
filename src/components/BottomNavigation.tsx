import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Calendar, CheckSquare, ShoppingCart, Bell } from "lucide-react";
import { motion } from "framer-motion";
import NotificationBadge from "./notifications/NotificationBadge";

const BottomNavigation: React.FC = () => {
  const navItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: '/calendar', icon: Calendar, label: 'Calendar' },
    { path: "/tasks", icon: CheckSquare, label: "Tasks" },
    { path: "/shopping", icon: ShoppingCart, label: "Shopping" },
    { path: "/notifications", icon: Bell, label: "Notifications", badge: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map(({ path, icon: Icon, label, badge }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-500 hover:text-gray-700"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <motion.div whileTap={{ scale: 0.95 }} className="relative">
                  {badge ? (
                    <NotificationBadge size={20} />
                  ) : (
                    <Icon size={20} />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full"
                    />
                  )}
                </motion.div>
                <span className="text-xs mt-1 font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNavigation;