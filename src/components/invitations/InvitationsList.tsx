import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Users, Clock } from 'lucide-react';
import { useInvitationStore } from '../../store/invitationStore';
import { useAuthStore } from '../../store/authStore';
import InvitationCard from './InvitationCard';

interface InvitationsListProps {
  onHubSwitch?: (hubId: string) => void;
}

const InvitationsList: React.FC<InvitationsListProps> = ({ onHubSwitch }) => {
  const { user } = useAuthStore();
  const {
    invitations,
    isLoading,
    error,
    fetchInvitations,
    acceptInvitation,
    declineInvitation,
    clearError
  } = useInvitationStore();

  useEffect(() => {
    if (user?.id) {
      fetchInvitations(user.id);
    }
  }, [user?.id, fetchInvitations]);

  const handleAccept = async (id: string) => {
    const result = await acceptInvitation(id);
    if (result.success) {
      // Optionally switch to the newly joined hub
      const invitation = invitations.find(inv => inv.id === id);
      if (invitation && onHubSwitch) {
        onHubSwitch(invitation.hub_id);
      }
    }
  };

  const handleDecline = async (id: string) => {
    await declineInvitation(id);
  };

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="animate-pulse">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div>
                  <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            </div>
            <div className="h-16 bg-gray-200 rounded mb-4"></div>
            <div className="flex gap-3">
              <div className="flex-1 h-12 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 h-12 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Empty state
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Mail size={32} className="text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No Pending Invitations
      </h3>
      <p className="text-gray-600 max-w-md mx-auto mb-6">
        You don't have any pending hub invitations at the moment. When someone invites you to join their family hub, you'll see it here.
      </p>
      <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Users size={16} />
          <span>Join family hubs</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span>Respond to invites</span>
        </div>
      </div>
    </motion.div>
  );

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 rounded-lg p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-red-900 font-medium mb-1">Error Loading Invitations</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <button
          onClick={() => user?.id && fetchInvitations(user.id)}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hub Invitations</h2>
          <p className="text-gray-600 mt-1">
            {invitations.length > 0 
              ? `You have ${invitations.length} pending invitation${invitations.length !== 1 ? 's' : ''}`
              : 'Manage your hub invitations'
            }
          </p>
        </div>
        
        {invitations.length > 0 && (
          <button
            onClick={() => user?.id && fetchInvitations(user.id)}
            disabled={isLoading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Mail size={16} />
            )}
            Refresh
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : invitations.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {invitations.map(invitation => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                onAccept={handleAccept}
                onDecline={handleDecline}
                isLoading={isLoading}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default InvitationsList;