import { HubState } from './types';

export const createHubSelectors = (state: HubState) => ({
  getCurrentHub: () => state.currentHub,
  getUserHubs: () => state.userHubs,
  getHubMembers: () => state.hubMembers,
  getPendingInvites: () => state.pendingInvites,
  getUserInvitations: () => state.userInvitations,
  getCurrentUserId: () => state.currentUserId,
  isLoading: () => state.loading,
  isLoadingInvitations: () => state.loadingInvitations,
  getError: () => state.error,
  isInitialized: () => state.initialized,
  
  // Computed selectors
  getHubMemberCount: () => state.hubMembers.length,
  getPendingInviteCount: () => state.pendingInvites.length,
  getUserInvitationCount: () => state.userInvitations.filter(inv => !inv.is_expired).length,
  
  // Get member by user ID
  getMemberByUserId: (userId: string) => 
    state.hubMembers.find(member => member.user_id === userId),
    
  // Check if current user is owner of current hub
  isCurrentUserOwner: () => {
    if (!state.currentHub || !state.currentUserId) return false;
    const currentMember = state.hubMembers.find(
      m => m.hub_id === state.currentHub?.id && m.user_id === state.currentUserId
    );
    return currentMember?.role === 'owner';
  },
  
  // Check if current user is manager or owner of current hub
  isCurrentUserManagerOrOwner: () => {
    if (!state.currentHub || !state.currentUserId) return false;
    const currentMember = state.hubMembers.find(
      m => m.hub_id === state.currentHub?.id && m.user_id === state.currentUserId
    );
    return currentMember?.role === 'owner' || currentMember?.role === 'manager';
  },
});
