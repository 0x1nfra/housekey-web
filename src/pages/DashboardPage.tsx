"use client";

import type React from "react";
import { motion } from "framer-motion";
import DashboardView from "../components/dashboard/DashboardView";
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
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6 sm:space-y-8"
      >
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
            {`${getTimeBasedGreeting(dayjs().toDate())}, ${
              profile?.name || "User"
            }! 👋`}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-500">
            Here's what's happening in the{" "}
            <span className="font-bold">{currentHub?.name}</span> hub today
          </p>
        </div>

        <DashboardView />
      </motion.div>
    </div>
  );
};

export default DashboardPage;
