import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Calendar, 
  Clock, 
  Check, 
  X, 
  Crown, 
  User,
  Building2,
  Mail
} from 'lucide-react';
import { HubInvitation } from '../../types/invitation';
import { formatDistanceToNow } from 'date-fns';

interface InvitationCardProps {
  invitation: HubInvitation;
  onAccept: (id: string) => Promise<void>;
  onDecline: (id: string) => Promise<void>;
  isLoading: boolean;
}

const InvitationCard: React.FC<InvitationCardProps> = ({
  invitation,
  onAccept,
  onDecline,
  isLoading
}) => {
  const [actionLoading, setActionLoading] = useState<'accept' | 'decline' | null>(null);

  const handleAccept = async () => {
    setActionLoading('accept');
    try {
      await onAccept(invitation.id);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async () => {
    setActionLoading('decline');
    try {
      await onDecline(invitation.id);
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? Crown : User;
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' 
      ? 'bg-purple-100 text-purple-700 border-purple-200' 
      : 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const isExpired = new Date(invitation.expires_at) < new Date();
  const timeUntilExpiry = formatDistanceToNow(new Date(invitation.expires_at), { addSuffix: true });
  const createdTime = formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Building2 size={24} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {invitation.hub_name}
            </h3>
            {invitation.hub_description && (
              <p className="text-sm text-gray-600 mt-1">
                {invitation.hub_description}
              </p>
            )}
          </div>
        </div>

        {/* Role Badge */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium ${getRoleColor(invitation.role)}`}>
          {React.createElement(getRoleIcon(invitation.role), { size: 14 })}
          <span className="capitalize">{invitation.role}</span>
        </div>
      </div>

      {/* Inviter Information */}
      <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
          <User size={20} className="text-gray-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            Invited by {invitation.inviter_name}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>Sent {createdTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span className={isExpired ? 'text-red-500' : ''}>
                {isExpired ? 'Expired' : `Expires ${timeUntilExpiry}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hub Details */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Users size={16} />
          <span>Join as {invitation.role === 'admin' ? 'Hub Manager' : 'Hub Member'}</span>
        </div>
        
        {invitation.role === 'admin' && (
          <div className="text-xs text-gray-500 bg-purple-50 p-2 rounded border border-purple-200">
            <strong>Manager privileges:</strong> Can invite members, manage hub settings, and moderate content
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAccept}
          disabled={isLoading || actionLoading !== null || isExpired}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {actionLoading === 'accept' ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Accepting...</span>
            </>
          ) : (
            <>
              <Check size={16} />
              <span>Accept</span>
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDecline}
          disabled={isLoading || actionLoading !== null}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {actionLoading === 'decline' ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Declining...</span>
            </>
          ) : (
            <>
              <X size={16} />
              <span>Decline</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Expiry Warning */}
      {!isExpired && new Date(invitation.expires_at).getTime() - Date.now() < 24 * 60 * 60 * 1000 && (
        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
          ⚠️ This invitation expires soon. Please respond within 24 hours.
        </div>
      )}
    </motion.div>
  );
};

export default InvitationCard;