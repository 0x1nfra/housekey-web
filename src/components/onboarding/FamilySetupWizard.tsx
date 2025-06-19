import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Users, Calendar, ShoppingCart, Home } from 'lucide-react';
import MemberInviteCard from './MemberInviteCard';

interface FamilySetupWizardProps {
  currentStep: number;
  totalSteps: number;
  onStepComplete: (step: number) => void;
}

const FamilySetupWizard: React.FC<FamilySetupWizardProps> = ({
  currentStep,
  totalSteps,
  onStepComplete
}) => {
  const [householdName, setHouseholdName] = useState('');
  const [invitedMembers, setInvitedMembers] = useState<string[]>([]);

  const steps = [
    {
      title: "Name Your Household",
      description: "Give your family hub a name that everyone will recognize",
      icon: Home
    },
    {
      title: "Invite Family Members",
      description: "Add your family members so everyone can stay connected",
      icon: Users
    },
    {
      title: "Set Up Your Calendar",
      description: "Connect your existing calendars or start fresh",
      icon: Calendar
    },
    {
      title: "Create Your First List",
      description: "Start with a shopping list to see collaboration in action",
      icon: ShoppingCart
    }
  ];

  const handleNext = () => {
    onStepComplete(currentStep);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Household Name
              </label>
              <input
                type="text"
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="The Smith Family, Our Home, etc."
              />
            </div>
            <p className="text-sm text-gray-500">
              This helps everyone identify your shared family space
            </p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid gap-4">
              <MemberInviteCard
                memberType="Partner/Spouse"
                inviteMethod="email"
                onInviteSent={(email) => setInvitedMembers(prev => [...prev, email])}
              />
              <MemberInviteCard
                memberType="Child"
                inviteMethod="sms"
                onInviteSent={(contact) => setInvitedMembers(prev => [...prev, contact])}
              />
              <MemberInviteCard
                memberType="Other Family Member"
                inviteMethod="share"
                onInviteSent={(contact) => setInvitedMembers(prev => [...prev, contact])}
              />
            </div>
            <p className="text-sm text-gray-500">
              Don't worry - you can add more family members later
            </p>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 cursor-pointer transition-colors">
                <h4 className="font-medium text-gray-900 mb-2">Connect Google Calendar</h4>
                <p className="text-sm text-gray-600">Import your existing events and appointments</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 cursor-pointer transition-colors">
                <h4 className="font-medium text-gray-900 mb-2">Connect Apple Calendar</h4>
                <p className="text-sm text-gray-600">Sync with your iPhone and Mac calendars</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 cursor-pointer transition-colors">
                <h4 className="font-medium text-gray-900 mb-2">Start Fresh</h4>
                <p className="text-sm text-gray-600">Begin with a clean calendar just for your family</p>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6">
              <h4 className="font-medium text-emerald-900 mb-2">🛒 Weekly Groceries</h4>
              <div className="space-y-2 text-sm text-emerald-700">
                <div className="flex items-center gap-2">
                  <Check size={16} />
                  <span>Milk</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={16} />
                  <span>Bread</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={16} />
                  <span>Eggs</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              We've created your first shopping list with common items. Your family members can add items in real-time!
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round((currentStep / totalSteps) * 100)}% complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-indigo-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              {React.createElement(steps[currentStep - 1].icon, {
                size: 24,
                className: "text-indigo-600"
              })}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {steps[currentStep - 1].title}
              </h2>
              <p className="text-gray-600">
                {steps[currentStep - 1].description}
              </p>
            </div>
          </div>

          {renderStepContent()}

          <div className="flex justify-between items-center mt-8">
            <div className="flex space-x-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i < currentStep ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {currentStep === totalSteps ? 'Complete Setup' : 'Continue'}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FamilySetupWizard;