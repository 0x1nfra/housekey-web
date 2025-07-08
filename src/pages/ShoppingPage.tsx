"use client";

import type React from "react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import ShoppingView from "../components/shopping/ShoppingView";

const ShoppingPage: React.FC = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6 sm:space-y-8"
      >
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-sage-green-light rounded-xl flex items-center justify-center">
              <ShoppingCart
                size={20}
                className="sm:size-6 text-deep-charcoal"
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-deep-charcoal font-interface mb-1 sm:mb-2">
                Shopping Lists
              </h1>
              <p className="text-sm sm:text-base text-charcoal-muted font-content">
                Create and manage shared shopping lists for your household.
              </p>
            </div>
          </div>
        </div>

        <ShoppingView />
      </motion.div>
    </div>
  );
};

export default ShoppingPage;
