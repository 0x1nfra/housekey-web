import React from "react";
import { motion } from "framer-motion";
import DashboardView from "../components/dashboard/DashboardView";
import QuickActions from "../components/dashboard/ui/QuickActions";
import ActivityFeed from "../components/dashboard/ui/ActivityFeed";
import { useAuthStore } from "../store/auth";
import { useHubStore } from "../store/hub";
import { getTimeBasedGreeting } from "../utils/time";
import dayjs from "dayjs";
import { shallow } from "zustand/shallow";

const DashboardPage: React.FC = () => {
  const { profile } = useAuthStore(
    (state) => ({
      profile: state.profile,
    }),
    shallow
  );

  const { currentHub } = useHubStore(
    (state) => ({
      currentHub: state.currentHub,
    }),
    shallow
  );

  return (
    <div className="px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-gray-100">
            {`${getTimeBasedGreeting(dayjs().toDate())}, ${
              profile?.name || "User"
            }! 👋`}
          </h1>
          <p className="text-gray-600 dark:text-gray-500">
            Here's what's happening in the{" "}
            <span className="font-bold">{currentHub?.name}</span> hub today
          </p>
        </div>

        <DashboardView />
        <QuickActions />
        <ActivityFeed />
      </motion.div>
    </div>
  );
};

export default DashboardPage;
