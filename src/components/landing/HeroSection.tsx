import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Users, Calendar, CheckCircle } from 'lucide-react';

interface HeroSectionProps {
  heroText: string;
  subheadline: string;
  ctaButton: {
    text: string;
    action: () => void;
  };
}

const HeroSection: React.FC<HeroSectionProps> = ({ heroText, subheadline, ctaButton }) => {
  return (
    <section className="relative px-6 py-16 md:py-24">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex justify-center items-center gap-2 mb-6">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 bg-indigo-500 rounded-full border-2 border-white flex items-center justify-center">
                <Users size={16} className="text-white" />
              </div>
              <div className="w-8 h-8 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <Calendar size={16} className="text-white" />
              </div>
              <div className="w-8 h-8 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center">
                <CheckCircle size={16} className="text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            {heroText}
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            {subheadline}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={ctaButton.action}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-medium transition-colors flex items-center gap-2 text-lg shadow-lg hover:shadow-xl"
          >
            {ctaButton.text}
            <ArrowRight size={20} />
          </motion.button>
          
          <p className="text-sm text-gray-500">
            Free to start • No credit card required
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto border border-gray-100">
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-indigo-600 mb-2">10min</div>
                <div className="text-sm text-gray-600">Setup time</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600 mb-2">100%</div>
                <div className="text-sm text-gray-600">Family adoption</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-amber-600 mb-2">0</div>
                <div className="text-sm text-gray-600">Nagging required</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;