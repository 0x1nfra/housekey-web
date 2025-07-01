import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckSquare, ShoppingCart, Users, Bell, Shield } from 'lucide-react';

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureGrid: React.FC = () => {
  const features: Feature[] = [
    {
      icon: Calendar,
      title: "Shared Family Calendar",
      description: "Never miss appointments or double-book again. Everyone sees what's happening, when it's happening."
    },
    {
      icon: CheckSquare,
      title: "Collaborative Task Management",
      description: "Distribute chores fairly without the nagging. Kids and partners know what needs doing."
    },
    {
      icon: ShoppingCart,
      title: "Real-time Shopping Lists",
      description: "Add items instantly, shop together efficiently. No more forgotten milk or duplicate purchases."
    },
    {
      icon: Users,
      title: "Family-First Design",
      description: "Built for busy parents who need everyone on board. Simple enough for kids, powerful enough for adults."
    },
    {
      icon: Bell,
      title: "Smart Notifications",
      description: "Gentle reminders that bring families together instead of creating stress and conflict."
    },
    {
      icon: Shield,
      title: "Privacy & Security",
      description: "Your family data stays private and secure. We never share or sell your personal information."
    }
  ];

  return (
    <section className="px-6 py-16 bg-white dark:bg-gray-800">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Everything your family needs in one place
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Stop juggling multiple apps and sticky notes. Household Harmony brings order to the beautiful chaos of family life.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-100 dark:border-gray-600 p-6 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mr-4">
                  <feature.icon size={24} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{feature.title}</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;