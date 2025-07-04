import { AuthState } from './types';

export const createAuthSelectors = (state: AuthState) => ({
  getUser: () => state.user,
  getProfile: () => state.profile,
  isLoading: () => state.loading,
  getError: () => state.error,
  isInitialized: () => state.initialized,
  
  // Computed selectors
  isAuthenticated: () => !!state.user,
  getUserId: () => state.user?.id || null,
  getUserEmail: () => state.user?.email || state.profile?.email || null,
  getUserName: () => state.profile?.name || null,
  getUserAvatarUrl: () => state.profile?.avatarUrl || null,
  
  // Check if user has a complete profile
  hasCompleteProfile: () => {
    return !!(state.profile?.name && state.profile?.email);
  },
  
  // Get user initials for avatar display
  getUserInitials: () => {
    const name = state.profile?.name;
    if (!name) return 'U';
    
    const nameParts = name.trim().split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  },
});
