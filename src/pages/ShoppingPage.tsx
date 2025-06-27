import React from "react";
import { motion } from "framer-motion";
import CollaborativeShoppingList from "../components/shopping/CollaborativeShoppingList";

const ShoppingPage: React.FC = () => {
  return (
    <div className="px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping</h1>
          <p className="text-gray-600">
            Collaborate on shopping in real-time with your Hub
          </p>
        </div>

        <CollaborativeShoppingList />
      </motion.div>
    </div>
  );
};

export default ShoppingPage;
