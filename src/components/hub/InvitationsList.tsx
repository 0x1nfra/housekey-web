import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  Inbox,
  Mail,
  Crown,
  Shield,
  User,
  Check,
  X,
  Clock,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useHubStore } from "../../store/hub";
import { formatDistanceToNow } from "date-fns";
import { shallow } from "zustand/shallow";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface InvitationsListProps {
  onHubSwitch: (hubId: string) => Promise<void>;
}

/*
FIXME:
1. change to dayjs
2. move types to type folders
*/

const InvitationsList: React.FC<InvitationsListProps> = ({ onHubSwitch }) => {
  const {
    userInvitations,
    loadingInvitations,
    error,
    fetchUserInvitations,
    acceptInvitation,
    declineInvitation,
    clearError,
  } = useHubStore(
    (state) => ({
      userInvitations: state.userInvitations,
      loadingInvitations: state.loadingInvitations,
      error: state.error,
      fetchUserInvitations: state.fetchUserInvitations,
      acceptInvitation: state.acceptInvitation,
      declineInvitation: state.declineInvitation,
      clearError: state.clearError,
    }),
    shallow
  );

  useEffect(() => {
    fetchUserInvitations();
  }, [fetchUserInvitations]);

  const roleIcons = {
    owner: Crown,
    manager: Shield,
    member: User,
  };

  const roleColors = {
    owner:
      "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/50",
    manager:
      "text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/50",
    member: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700",
  };

  const pendingInvitations = userInvitations.filter((inv) => !inv.is_expired);
  const expiredInvitations = userInvitations.filter((inv) => inv.is_expired);

  const handleAccept = async (invitationId: string, hubId: string) => {
    const result = await acceptInvitation(invitationId);
    if (result.success) {
      // Switch to the newly joined hub
      await onHubSwitch(hubId);
    }
  };

  const handleDecline = async (invitationId: string) => {
    await declineInvitation(invitationId);
  };

  const isExpiringSoon = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const hoursUntilExpiry =
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry <= 24 && hoursUntilExpiry > 0;
  };

  if (loadingInvitations) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
          >
            <div className="animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
              <div className="flex gap-3">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
      >
        <div className="flex items-center justify-between">
          <p className="text-red-700 dark:text-red-300">{error}</p>
          <button
            onClick={clearError}
            className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    );
  }

  if (pendingInvitations.length === 0 && expiredInvitations.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Inbox size={24} className="text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No Invitations
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          You don't have any hub invitations at the moment
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Pending Invitations ({pendingInvitations.length})
          </h3>

          <div className="space-y-4">
            {pendingInvitations.map((invitation, index) => {
              const RoleIcon = roleIcons[invitation.role];
              const expiringSoon = isExpiringSoon(invitation.expires_at);

              return (
                <motion.div
                  key={invitation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-deep-charcoal w-12 h-12 bg-sage-green rounded-lg flex items-center justify-center">
                        <span className="font-bold text-lg">
                          {invitation.hub.name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {invitation.hub.name}
                        </h4>
                        {invitation.hub.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {invitation.hub.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                        roleColors[invitation.role]
                      }`}
                    >
                      <RoleIcon size={14} />
                      <span className="capitalize">{invitation.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <span>Invited by {invitation.invited_by.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{dayjs(invitation.created_at).fromNow()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>
                        Expires{" "}
                        {formatDistanceToNow(new Date(invitation.expires_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>

                  {expiringSoon && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-4">
                      <AlertCircle
                        size={16}
                        className="text-amber-600 dark:text-amber-400"
                      />
                      <span className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                        This invitation expires soon!
                      </span>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        handleAccept(invitation.id, invitation.hub_id)
                      }
                      disabled={loadingInvitations}
                      className="btn-primary flex items-center gap-2 px-4 py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check size={16} />
                      Accept
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleDecline(invitation.id)}
                      disabled={loadingInvitations}
                      className="btn-secondary flex items-center gap-2 border border-gray-300 px-4 py-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X size={16} />
                      Decline
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expired Invitations */}
      {expiredInvitations.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Expired Invitations ({expiredInvitations.length})
          </h3>

          <div className="space-y-4">
            {expiredInvitations.map((invitation, index) => {
              const RoleIcon = roleIcons[invitation.role];

              return (
                <motion.div
                  key={invitation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 opacity-75"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 dark:text-gray-400 font-bold text-lg">
                          {invitation.hub.name.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400">
                          {invitation.hub.name}
                        </h4>
                        {invitation.hub.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            {invitation.hub.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400`}
                      >
                        <RoleIcon size={14} />
                        <span className="capitalize">{invitation.role}</span>
                      </div>
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 text-xs rounded-full font-medium">
                        Expired
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      <span>Invited by {invitation.invited_by.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span>
                        Expired{" "}
                        {formatDistanceToNow(new Date(invitation.expires_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvitationsList;
