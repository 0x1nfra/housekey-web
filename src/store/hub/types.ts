import { RealtimeChannel } from "@supabase/supabase-js";
import {
  Hub,
  HubMember,
  HubInvitation,
  UserInvitation,
  HubRoleType,
  CreateHubData,
  UpdateHubData,
  InviteMemberData,
  Result,
  HubPermissions,
  FetchUserInvitationsResult,
} from "../../types/hub";

// Re-export types for easier use
export type {
  Hub,
  HubMember,
  HubInvitation,
  UserInvitation,
  HubRoleType,
  CreateHubData,
  UpdateHubData,
  InviteMemberData,
  Result,
  HubPermissions,
  FetchUserInvitationsResult,
} from "../../types/hub";

export interface HubState {
  // Hub data
  currentHub: Hub | null;
  userHubs: Hub[];
  hubMembers: HubMember[];
  pendingInvites: HubInvitation[];
  userInvitations: UserInvitation[];

  // UI State
  loading: boolean;
  loadingInvitations: boolean;
  error: string | null;
  initialized: boolean;

  // Current context
  currentUserId: string | null;

  // Realtime subscriptions
  subscriptions: Record<string, SubscriptionGroup>;
}

export interface SubscriptionGroup {
  members: RealtimeChannel;
  invites: RealtimeChannel;
  unsubscribe: () => void;
}

export interface HubActions {
  // Core hub management
  initializeHubs: () => Promise<void>;
  switchHub: (hubId: string) => Promise<void>;
  createHub: (data: CreateHubData) => Promise<Result>;
  updateHub: (hubId: string, data: UpdateHubData) => Promise<Result>;
  leaveHub: (hubId: string) => Promise<Result>;
  deleteHub: (hubId: string) => Promise<Result>;

  // Member management
  inviteMember: (hubId: string, data: InviteMemberData) => Promise<Result>;
  removeMember: (memberId: string) => Promise<Result>;
  updateMemberRole: (memberId: string, role: HubRoleType) => Promise<Result>;
  cancelInvitation: (invitationId: string) => Promise<Result>;

  // User invitations
  fetchUserInvitations: () => Promise<void>;
  acceptInvitation: (invitationId: string) => Promise<Result>;
  declineInvitation: (invitationId: string) => Promise<Result>;

  // Settings & utilities
  setDefaultHub: (hubId: string) => Promise<void>;
  loadHubData: (hubId: string) => Promise<void>;
  getHubPermissions: (hubId?: string) => HubPermissions;

  // Subscription management
  subscribeToHub: (hubId: string) => void;
  unsubscribeFromHub: (hubId: string) => void;
  unsubscribeAll: () => void;

  // Utility
  clearError: () => void;
  reset: () => void;
}

export type HubStore = HubState & HubActions;

// Helper types for function signatures
export type SetStateFunction = (fn: (state: HubState) => void) => void;
export type GetStateFunction = () => HubStore;

// Hub filtering and sorting
export interface HubFilters {
  role?: HubRoleType;
  search?: string;
  isActive?: boolean;
}

export interface HubSortOptions {
  field: "name" | "created_at" | "member_count";
  direction: "asc" | "desc";
}

// Member filtering
export interface MemberFilters {
  role?: HubRoleType;
  search?: string;
  isActive?: boolean;
}
