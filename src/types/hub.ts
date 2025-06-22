export interface Hub {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface HubMember {
  id: string;
  hub_id: string;
  user_id: string;
  role: 'owner' | 'manager' | 'member';
  joined_at: string;
  invited_by?: string;
  // Joined user profile data
  user_profile?: {
    name: string;
    email: string;
  };
}

export interface HubInvitation {
  id: string;
  hub_id: string;
  email: string;
  role: 'manager' | 'member';
  invited_by: string;
  token: string;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
  // Joined data
  hub_name?: string;
  invited_by_name?: string;
}

export type HubRole = 'owner' | 'manager' | 'member';

export interface CreateHubData {
  name: string;
  description?: string;
}

export interface UpdateHubData {
  name?: string;
  description?: string;
  settings?: Record<string, any>;
}

export interface InviteMemberData {
  email: string;
  role: 'manager' | 'member';
}

export interface HubPermissions {
  canManageHub: boolean;
  canManageMembers: boolean;
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canUpdateRoles: boolean;
  canDeleteHub: boolean;
}

export interface Result<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}