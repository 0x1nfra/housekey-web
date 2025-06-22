import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const LandingHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-transparent py-4 px-6 md:px-10"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Logo + Name */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-md text-white flex items-center justify-center font-bold text-sm">
            F
          </div>
          <span className="text-xl font-semibold text-gray-900">Harmony</span>
        </div>

        {/* Center: Navigation */}
        <nav className="hidden md:flex gap-8 text-gray-600 font-medium">
          <button className="hover:text-gray-900 transition-colors">
            Docs
          </button>
          <button className="hover:text-gray-900 transition-colors">
            Pricing
          </button>
        </nav>

        {/* Right: Auth Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/login")}
            className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
          >
            Log In
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Sign Up
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default LandingHeader;
