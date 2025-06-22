import React from 'react';
import { motion } from 'framer-motion';
import BottomNavigation from './BottomNavigation';
import DashboardHeader from './DashboardHeader';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="pb-20"
      >
        {children}
      </motion.main>
      <BottomNavigation />
    </div>
  );
};

export default Layout;