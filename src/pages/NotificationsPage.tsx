import React from "react";
import { motion } from "framer-motion";
import NotificationsView from "../components/notifications/NotificationsView";

const NotificationsPage: React.FC = () => {
  return (
    <div className="px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-gray-100">
            Notifications
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Stay updated with all your household activities
          </p>
        </div>

        <NotificationsView />
      </motion.div>
    </div>
  );
};

export default NotificationsPage;
