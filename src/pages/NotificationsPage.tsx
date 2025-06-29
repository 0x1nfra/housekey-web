import React from "react";
import { motion } from "framer-motion";
import NotificationsList from "../components/notifications/NotificationsList";

const NotificationsPage: React.FC = () => {
  return (
    <div className="px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Notifications
          </h1>
          <p className="text-gray-600">
            Stay updated with all your household activities
          </p>
        </div>

        <NotificationsList />
      </motion.div>
    </div>
  );
};

export default NotificationsPage;