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
      <div className="card-header">
        <div className="flex items-start gap-4">
          {icon && (
            <div className="w-12 h-12 bg-sage-green-light rounded-xl flex items-center justify-center flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-deep-charcoal font-interface mb-1">
              {title}
            </h3>
            {description && (
              <p className="text-charcoal-muted font-content text-sm leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="card-content">{children}</div>
    </motion.div>
  );
};

export default SettingsSection;
