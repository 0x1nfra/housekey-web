"use client";

import type React from "react";
import { motion } from "framer-motion";
import { Wrench, ArrowLeft, Clock, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const MaintenancePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-warm-off-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full text-center"
      >
        {/* Animated Icon */}
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="w-24 h-24 bg-sage-green rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
        >
          <Wrench className="w-12 h-12 text-deep-charcoal" />
        </motion.div>

        {/* Main Message */}
        <h1 className="text-3xl font-bold text-deep-charcoal dark:text-white mb-4 font-interface">
          Under Maintenance
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          We're currently working on improvements to make your experience even
          better. This page will be back online shortly.
        </p>

        {/* Status Cards */}
        <div className="space-y-3 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-3"
          >
            <Clock className="w-5 h-5 text-sage-green-dark" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Estimated Time
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                We'll be back soon
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                What's Happening
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Adding new features and improvements
              </p>
            </div>
          </motion.div>
        </div>

        {/* Back Button */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-sage-green hover:bg-sage-green/90 text-deep-charcoal px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </motion.div> */}

        {/* Footer Message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-gray-500 dark:text-gray-400 mt-8"
        >
          Thank you for your patience while we improve HouseKey
        </motion.p>
      </motion.div>
    </div>
  );
};

export default MaintenancePage;
