import React from "react";
import { Shield } from "lucide-react";

const PrivacyTab: React.FC = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Privacy & Security
      </h2>

      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield size={24} className="text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Coming Soon
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Privacy and security settings will be available in a future update.
          You'll be able to manage data sharing preferences, two-factor
          authentication, and more.
        </p>
      </div>
    </div>
  );
};

export default PrivacyTab;
