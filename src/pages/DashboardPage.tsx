import React from 'react';
import { motion } from 'framer-motion';
import HouseholdOverview from '../components/dashboard/HouseholdOverview';
import QuickActions from '../components/dashboard/QuickActions';
import ActivityFeed from '../components/dashboard/ActivityFeed';

const DashboardPage: React.FC = () => {
  return (
    <div className="px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Good morning, Sarah! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your family today
          </p>
        </div>

        <HouseholdOverview />
        <QuickActions />
        <ActivityFeed />
      </motion.div>
    </div>
  );
};

export default DashboardPage;