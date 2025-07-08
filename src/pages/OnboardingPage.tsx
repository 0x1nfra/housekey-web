import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import HubSetupWizardProps from "../components/onboarding/HubSetupWizard";

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const handleStepComplete = (step: number) => {
    if (step < totalSteps) {
      setCurrentStep(step + 1);
    } else {
      // Onboarding complete, navigate to dashboard
      navigate("/dashboard");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-sage-green-light via-warm-off-white to-sage-green"
    >
      <AnimatePresence mode="wait">
        <HubSetupWizardProps
          currentStep={currentStep}
          totalSteps={totalSteps}
          onStepComplete={handleStepComplete}
        />
      </AnimatePresence>
    </motion.div>
  );
};

export default OnboardingPage;
