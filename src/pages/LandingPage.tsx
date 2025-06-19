import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/landing/HeroSection';
import FeatureGrid from '../components/landing/FeatureGrid';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50"
    >
      <HeroSection
        heroText="Replace household chaos with collaborative calm"
        subheadline="Unite your family's schedules, tasks, and lists into one simple, shared app that everyone actually uses."
        ctaButton={{
          text: "Start Your Family Hub",
          action: () => navigate('/signup')
        }}
      />
      <FeatureGrid />
    </motion.div>
  );
};

export default LandingPage;