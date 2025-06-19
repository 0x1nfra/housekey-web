import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import FamilySetupWizard from '../components/onboarding/FamilySetupWizard';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const handleStepComplete = (step: number) => {
    if (step < totalSteps) {
      setCurrentStep(step + 1);
    } else {
      // Onboarding complete, navigate to dashboard
      navigate('/dashboard');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50"
    >
      <AnimatePresence mode="wait">
        <FamilySetupWizard
          currentStep={currentStep}
          totalSteps={totalSteps}
          onStepComplete={handleStepComplete}
        />
      </AnimatePresence>
    </motion.div>
  );
};

export default OnboardingPage;