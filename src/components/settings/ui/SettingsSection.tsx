import React, { ReactNode } from "react";
import { motion } from "framer-motion";

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  icon,
  children,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              {icon}
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            {description && <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>}
          </div>
        </div>
      </div>
      <div className="p-6 dark:text-gray-200">{children}</div>
    </motion.div>
  );
};

export default SettingsSection;