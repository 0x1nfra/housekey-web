export interface HubInvitation {
  id: string;
  hub_id: string;
  hub_name: string;
  inviter_id: string;
  inviter_name: string;
  invitee_id: string;
  role: 'admin' | 'member';
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  expires_at: string;
  hub_description?: string;
}

export interface InvitationResponse {
  success: boolean;
  error?: string;
  data?: any;
}

export interface InvitationState {
  invitations: HubInvitation[];
  isLoading: boolean;
  error: string | null;
}

export interface InvitationActions {
  fetchInvitations: (userId: string) => Promise<void>;
  acceptInvitation: (id: string) => Promise<InvitationResponse>;
  declineInvitation: (id: string) => Promise<InvitationResponse>;
  clearError: () => void;
}

export type InvitationStore = InvitationState & InvitationActions;