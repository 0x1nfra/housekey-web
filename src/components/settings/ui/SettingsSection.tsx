"use client";

import type React from "react";
import { motion } from "framer-motion";

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
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
      className="card"
    >
      <div className="border-b border-gray-100 pb-4 mb-4">
        <div className="flex items-start gap-3">
          {icon && <div className="flex-shrink-0 mt-1">{icon}</div>}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-deep-charcoal font-chivo">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-charcoal-muted font-lora mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      <div>{children}</div>
    </motion.div>
  );
};

export default SettingsSection;
