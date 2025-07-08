"use client";

import type React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  CheckSquare,
  Users,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

interface StatItem {
  id: string;
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

interface StatsProps {
  eventsCount: number;
  tasksCount: number;
  membersCount: number;
  completionRate?: string;
}

const Stats: React.FC<StatsProps> = ({
  eventsCount,
  tasksCount,
  membersCount,
  completionRate = "87%",
}) => {
  const stats: StatItem[] = [
    {
      id: "events",
      title: "Today's Events",
      value: eventsCount.toString(),
      change: "+2 from yesterday",
      icon: Calendar,
      color: "text-deep-charcoal",
      bgColor: "bg-sage-green",
    },
    {
      id: "tasks",
      title: "Pending Tasks",
      value: tasksCount.toString(),
      change: "-1 from yesterday",
      icon: CheckSquare,
      color: "text-deep-charcoal",
      bgColor: "bg-sage-green",
    },
    {
      id: "members",
      title: "Active Members",
      value: membersCount.toString(),
      change: "All online",
      icon: Users,
      color: "text-deep-charcoal",
      bgColor: "bg-sage-green",
    },
    {
      id: "completion",
      title: "Task Completion",
      value: completionRate,
      change: "+5% this week",
      icon: TrendingUp,
      color: "text-deep-charcoal",
      bgColor: "bg-sage-green",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index }}
          className="bg-white border border-gray-100 rounded-lg shadow-soft p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}
            >
              <stat.icon size={20} className={stat.color} />
            </div>
          </div>
          <div>
            <p className="text-sm text-charcoal-muted font-chivo mb-1">
              {stat.title}
            </p>
            <p className="text-3xl font-semibold text-deep-charcoal font-chivo mb-1">
              {stat.value}
            </p>
            <p className="text-sm text-sage-green-dark font-lora">
              {stat.change}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Stats;
