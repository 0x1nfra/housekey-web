import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Inbox, 
  Check, 
  X, 
  Clock, 
  User, 
  Crown, 
  Shield, 
  AlertCircle,
  Calendar,
  Mail
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

interface InvitationsListProps {
  onHubSwitch: (hubId: string) => Promise<void>;
}

interface UserInvitation {
  id: string;
  hub_id: string;
  hub: {
    name: string;
    description?: string;
  };
  email: string;
  role: 'manager' | 'member';
  invited_by: {
    name: string;
    email: string;
  };
  expires_at: string;
  created_at: string;
  is_expired: boolean;
}

const InvitationsList: React.FC<InvitationsListProps> = ({ onHubSwitch }) => {
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { user, profile } = useAuthStore();

  const roleIcons = {
    manager: Shield,
    member: User
  };

  const roleColors = {
    manager: 'text-indigo-600 bg-indigo-100',
    member: 'text-gray-600 bg-gray-100'
  };

  useEffect(() => {
    if (user && profile?.email) {
      fetchInvitations();
    }
  }, [user, profile]);

  const fetchInvitations = async () => {
    if (!profile?.email) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('hub_invitations')
        .select(`
          id,
          hub_id,
          email,
          role,
          expires_at,
          created_at,
          hub:hubs(name, description),
          invited_by_profile:user_profiles!hub_invitations_invited_by_fkey(name, email)
        `)
        .eq('email', profile.email)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedInvitations: UserInvitation[] = (data || []).map(invitation => ({
        id: invitation.id,
        hub_id: invitation.hub_id,
        hub: {
          name: invitation.hub?.name || 'Unknown Hub',
          description: invitation.hub?.description
        },
        email: invitation.email,
        role: invitation.role as 'manager' | 'member',
        invited_by: {
          name: invitation.invited_by_profile?.name || 'Unknown User',
          email: invitation.invited_by_profile?.email || ''
        },
        expires_at: invitation.expires_at,
        created_at: invitation.created_at,
        is_expired: new Date(invitation.expires_at) < new Date()
      }));

      setInvitations(formattedInvitations);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      setError(error instanceof Error ? error.message : 'Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitationId: string, hubId: string) => {
    if (!user?.id) return;

    setProcessingId(invitationId);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('accept_hub_invitation', {
        invitation_id: invitationId,
        user_id: user.id
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to accept invitation');
      }

      // Remove the accepted invitation from the list
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));

      // Switch to the new hub
      await onHubSwitch(hubId);

      // Show success feedback (you might want to add a toast notification here)
      console.log('Successfully joined hub!');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError(error instanceof Error ? error.message : 'Failed to accept invitation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    if (!user?.id) return;

    setProcessingId(invitationId);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('decline_hub_invitation', {
        invitation_id: invitationId,
        user_id: user.id
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to decline invitation');
      }

      // Remove the declined invitation from the list
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    } catch (error) {
      console.error('Error declining invitation:', error);
      setError(error instanceof Error ? error.message : 'Failed to decline invitation');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="flex gap-2 mt-4">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-20"></div>
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 rounded-xl p-6"
      >
        <div className="flex items-center gap-3">
          <AlertCircle size={20} className="text-red-600" />
          <div>
            <h3 className="font-medium text-red-900">Error Loading Invitations</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={fetchInvitations}
          className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Try Again
        </motion.button>
      </motion.div>
    );
  }

  if (invitations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Inbox size={24} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Invitations</h3>
        <p className="text-gray-500">
          You don't have any pending hub invitations at the moment.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {invitations.map((invitation, index) => {
          const RoleIcon = roleIcons[invitation.role];
          const isExpired = invitation.is_expired;
          const isProcessing = processingId === invitation.id;
          
          return (
            <motion.div
              key={invitation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl shadow-sm border p-6 ${
                isExpired ? 'border-red-200 bg-red-50' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {invitation.hub.name}
                    </h3>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${roleColors[invitation.role]}`}>
                      <RoleIcon size={14} />
                      <span className="capitalize">{invitation.role}</span>
                    </div>
                  </div>
                  
                  {invitation.hub.description && (
                    <p className="text-gray-600 text-sm mb-3">
                      {invitation.hub.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <User size={14} />
                      <span>Invited by {invitation.invited_by.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} />
                      <span>{formatTimeAgo(invitation.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      <span>Expires {formatDate(invitation.expires_at)}</span>
                    </div>
                  </div>
                </div>

                {isExpired && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                    <AlertCircle size={14} />
                    <span>Expired</span>
                  </div>
                )}
              </div>

              {!isExpired && (
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAcceptInvitation(invitation.id, invitation.hub_id)}
                    disabled={isProcessing}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                    <span>{isProcessing ? 'Accepting...' : 'Accept'}</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDeclineInvitation(invitation.id)}
                    disabled={isProcessing}
                    className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X size={16} />
                    <span>Decline</span>
                  </motion.button>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default InvitationsList;