import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { InvitationStore, HubInvitation, InvitationResponse } from '../types/invitation';

export const useInvitationStore = create<InvitationStore>((set, get) => ({
  // Initial state
  invitations: [],
  isLoading: false,
  error: null,

  // Actions
  fetchInvitations: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('hub_invitations')
        .select(`
          *,
          hub:hubs(name, description),
          inviter:user_profiles!hub_invitations_invited_by_fkey(name)
        `)
        .eq('email', (await supabase.from('user_profiles').select('email').eq('id', userId).single()).data?.email)
        .is('accepted_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match our interface
      const transformedInvitations: HubInvitation[] = (data || []).map(invitation => ({
        id: invitation.id,
        hub_id: invitation.hub_id,
        hub_name: invitation.hub?.name || 'Unknown Hub',
        inviter_id: invitation.invited_by,
        inviter_name: invitation.inviter?.name || 'Unknown User',
        invitee_id: userId,
        role: invitation.role === 'manager' ? 'admin' : 'member',
        status: 'pending',
        created_at: invitation.created_at,
        expires_at: invitation.expires_at,
        hub_description: invitation.hub?.description
      }));

      set({ invitations: transformedInvitations, isLoading: false });
    } catch (error) {
      console.error('Error fetching invitations:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch invitations',
        isLoading: false 
      });
    }
  },

  acceptInvitation: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      // Update invitation as accepted
      const { error: updateError } = await supabase
        .from('hub_invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) throw updateError;

      // Get invitation details to add user to hub
      const invitation = get().invitations.find(inv => inv.id === id);
      if (!invitation) throw new Error('Invitation not found');

      // Add user to hub_members
      const { error: memberError } = await supabase
        .from('hub_members')
        .insert({
          hub_id: invitation.hub_id,
          user_id: invitation.invitee_id,
          role: invitation.role === 'admin' ? 'manager' : 'member',
          invited_by: invitation.inviter_id
        });

      if (memberError) throw memberError;

      // Remove invitation from local state
      const updatedInvitations = get().invitations.filter(inv => inv.id !== id);
      set({ invitations: updatedInvitations, isLoading: false });

      return { success: true };
    } catch (error) {
      console.error('Error accepting invitation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to accept invitation';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  declineInvitation: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      // Delete the invitation
      const { error } = await supabase
        .from('hub_invitations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove invitation from local state
      const updatedInvitations = get().invitations.filter(inv => inv.id !== id);
      set({ invitations: updatedInvitations, isLoading: false });

      return { success: true };
    } catch (error) {
      console.error('Error declining invitation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to decline invitation';
      set({ error: errorMessage, isLoading: false });
      return { success: false, error: errorMessage };
    }
  },

  clearError: () => set({ error: null })
}));