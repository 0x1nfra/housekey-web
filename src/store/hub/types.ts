import { RealtimeChannel } from '@supabase/supabase-js';
import {
  Hub,
  HubMember,
  HubInvitation,
  UserInvitation,
  HubRole,
  CreateHubData,
  UpdateHubData,
  InviteMemberData,
  Result,
  HubPermissions,
  FetchUserInvitationsResult,
} from "../../types/hub";

export interface HubState {
  currentHub: Hub | null;
  userHubs: Hub[];
  hubMembers: HubMember[];
  pendingInvites: HubInvitation[];
  userInvitations: UserInvitation[];
  currentUserId: string | null;
  loading: boolean;
  loadingInvitations: boolean;
  error: string | null;
  initialized: boolean;
}

export interface HubActions {
  // Core Actions
  initializeHubs(): Promise<void>;
  switchHub(hubId: string): Promise<void>;
  createHub(data: CreateHubData): Promise<Result>;
  updateHub(hubId: string, data: UpdateHubData): Promise<Result>;
  leaveHub(hubId: string): Promise<Result>;
  deleteHub(hubId: string): Promise<Result>;

  // Member Management
  inviteMember(hubId: string, data: InviteMemberData): Promise<Result>;
  removeMember(memberId: string): Promise<Result>;
  updateMemberRole(memberId: string, role: HubRole): Promise<Result>;
  cancelInvitation(invitationId: string): Promise<Result>;

  // User Invitations
  fetchUserInvitations(): Promise<void>;
  acceptInvitation(invitationId: string): Promise<Result>;
  declineInvitation(invitationId: string): Promise<Result>;

  // Settings & Utilities
  setDefaultHub(hubId: string): Promise<void>;
  loadHubData(hubId: string): Promise<void>;
  getHubPermissions(hubId?: string): HubPermissions;
  clearError(): void;

  // Real-time subscriptions
  subscribeToHubChanges(hubId: string): () => void;

  // Utility
  reset(): void;
}

export type HubStore = HubState & HubActions;

// Helper types for function signatures
export type SetStateFunction = (fn: (state: HubState) => HubState) => void;
export type GetStateFunction = () => HubStore;

export interface SubscriptionGroup {
  members: RealtimeChannel;
  invites: RealtimeChannel;
  unsubscribe: () => void;
}

// Re-export needed types from the hub types file
export {
  Hub,
  HubMember,
  HubInvitation,
  UserInvitation,
  HubRole,
  CreateHubData,
  UpdateHubData,
  InviteMemberData,
  Result,
  HubPermissions,
  FetchUserInvitationsResult,
};
