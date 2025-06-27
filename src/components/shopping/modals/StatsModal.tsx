import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, Users, Calendar, Clock, Crown, Shield, User } from 'lucide-react';
import { ShoppingList, ListCollaborator } from '../../../store/shopping/types';
import dayjs from 'dayjs';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: ShoppingList | null;
  collaborators: ListCollaborator[];
  quickStats: {
    totalItems: number;
    completedItems: number;
    pendingItems: number;
    completionPercentage: number;
  } | null;
}

const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  list,
  collaborators,
  quickStats
}) => {
  if (!list) return null;

  const roleIcons = {
    owner: Crown,
    editor: Shield,
    member: User,
  };

  const roleColors = {
    owner: "text-amber-600 bg-amber-100",
    editor: "text-indigo-600 bg-indigo-100",
    member: "text-gray-600 bg-gray-100",
  };

  const getMemberAvatar = (memberName: string) => {
    const avatars: { [key: string]: string } = {
      Sarah: "👩‍💼",
      Mike: "👨‍💻",
      Emma: "👧",
    };
    return avatars[memberName] || "👤";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 size={20} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">List Statistics</h2>
                  <p className="text-sm text-gray-500">{list.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Quick Stats Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {quickStats?.totalItems || 0}
                    </div>
                    <div className="text-sm text-blue-700">Total Items</div>
                  </div>
                  
                  <div className="bg-emerald-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {quickStats?.completedItems || 0}
                    </div>
                    <div className="text-sm text-emerald-700">Completed</div>
                  </div>
                  
                  <div className="bg-amber-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-amber-600">
                      {quickStats?.pendingItems || 0}
                    </div>
                    <div className="text-sm text-amber-700">Pending</div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {quickStats?.completionPercentage || 0}%
                    </div>
                    <div className="text-sm text-purple-700">Complete</div>
                  </div>
                </div>

                {/* Progress Bar */}
                {quickStats && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-gray-900 font-medium">
                        {quickStats.completedItems} of {quickStats.totalItems} items
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        className="bg-emerald-500 h-3 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${quickStats.completionPercentage}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Calendar size={16} className="text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Created</p>
                      <p className="text-sm text-gray-500">
                        {dayjs(list.created_at).format('MMM DD, YYYY')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Clock size={16} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Last Modified</p>
                      <p className="text-sm text-gray-500">
                        {dayjs(list.updated_at).format('MMM DD, YYYY')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collaborators Section */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users size={14} className="text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Collaborators ({collaborators.length})
                  </h3>
                </div>

                {collaborators.length > 0 ? (
                  <div className="space-y-3">
                    {collaborators.map((collaborator) => {
                      const RoleIcon = roleIcons[collaborator.role];
                      
                      return (
                        <div
                          key={collaborator.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-2xl">
                              {getMemberAvatar(collaborator.user_profile?.name || "User")}
                            </div>
                            
                            <div>
                              <p className="font-medium text-gray-900">
                                {collaborator.user_profile?.name || "Unknown User"}
                              </p>
                              <p className="text-sm text-gray-500">
                                {collaborator.user_profile?.email}
                              </p>
                              <p className="text-xs text-gray-400">
                                Joined {dayjs(collaborator.created_at).format('MMM DD, YYYY')}
                              </p>
                            </div>
                          </div>

                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${roleColors[collaborator.role]}`}>
                            <RoleIcon size={14} />
                            <span className="capitalize">{collaborator.role}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500">No collaborators found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end mt-6 pt-6 border-t border-gray-100">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StatsModal;