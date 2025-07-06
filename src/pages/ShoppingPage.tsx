"use client";

import type React from "react";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import ShoppingView from "../components/shopping/ShoppingView";

const ShoppingPage: React.FC = () => {
  return (
    <div className="px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-sage-green-light rounded-xl flex items-center justify-center">
            <ShoppingCart size={24} className="text-deep-charcoal" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-deep-charcoal font-interface mb-2">
              Shopping Lists
            </h1>
            <p className="text-charcoal-muted font-content">
                Create and manage shared shopping lists for your household.
              </p>
          </div>
        </div>

        <ShoppingView />
      </motion.div>
    </div>
  );
};

export default ShoppingPage;
