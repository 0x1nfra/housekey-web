import React from "react";
import { motion } from "framer-motion";
import ShoppingView from "../components/shopping/ShoppingView";

const ShoppingPage: React.FC = () => {
  return (
    <div className="px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 dark:text-gray-100">
            Shopping
          </h1>
          <p className="text-gray-500">
            Collaborate on shopping in real-time with your Hub
          </p>
        </div>

        <ShoppingView />
      </motion.div>
    </div>
  );
};

export default ShoppingPage;
