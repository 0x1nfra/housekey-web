import { create } from "zustand";
import { supabase } from "../lib/supabase";
import {
  Hub,
  HubMember,
  HubInvitation,
  HubRole,
  CreateHubData,
  UpdateHubData,
  InviteMemberData,
  Result,
  HubPermissions,
} from "../types/hub";

interface HubState {
  currentHub: Hub | null;
  userHubs: Hub[];
  hubMembers: HubMember[];
  pendingInvites: HubInvitation[];
  // Add these new states for invitation handling
  userPendingInvites: HubInvitation[]; // Invitations sent TO this user
  hasOnlyInvitations: boolean; // True if user has invites but no hubs
  loading: boolean;
  error: string | null;
  initialized: boolean;
  currentUserId: string | null;
}

interface HubActions {
  // Core Actions
  initializeHubs(): Promise<void>;
  switchHub(hubId: string): Promise<void>;
  createHub(data: CreateHubData): Promise<Result>;
  updateHub(hubId: string, data: UpdateHubData): Promise<Result>;
  deleteHub(hubId: string): Promise<Result>;

  // Member Management
  inviteMember(hubId: string, data: InviteMemberData): Promise<Result>;
  removeMember(memberId: string): Promise<Result>;
  updateMemberRole(memberId: string, role: HubRole): Promise<Result>;
  cancelInvitation(invitationId: string): Promise<Result>;

  // New Invitation Actions
  acceptInvitation(invitationId: string): Promise<Result>;
  declineInvitation(invitationId: string): Promise<Result>;
  loadUserInvitations(): Promise<void>;

  // Settings & Utilities
  setDefaultHub(hubId: string): Promise<void>;
  loadHubData(hubId: string): Promise<void>;
  getHubPermissions(hubId?: string): HubPermissions;
  clearError(): void;
  resetStore(): void;

  // Real-time subscriptions
  subscribeToHubChanges(hubId: string): () => void;
}

type HubStore = HubState & HubActions;

export const useHubStore = create<HubStore>((set, get) => ({
  // Initial state
  currentHub: null,
  userHubs: [],
  hubMembers: [],
  pendingInvites: [],
  userPendingInvites: [], // New
  hasOnlyInvitations: false, // New
  loading: false,
  error: null,
  initialized: false,
  currentUserId: null,

  // Reset store method
  resetStore: () => {
    localStorage.removeItem("currentHubId");
    set({
      currentHub: null,
      userHubs: [],
      hubMembers: [],
      pendingInvites: [],
      userPendingInvites: [],
      hasOnlyInvitations: false,
      loading: false,
      error: null,
      initialized: false,
      currentUserId: null,
    });
  },

  // Core Actions
  initializeHubs: async () => {
    set({ loading: true, error: null });

    try {
      // Get current user ID first
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const newUserId = user?.id || null;
      const { currentUserId } = get();

      // If user changed, reset the store first
      if (currentUserId && currentUserId !== newUserId) {
        get().resetStore();
      }

      set({ currentUserId: newUserId });

      if (!newUserId) {
        set({ initialized: true, loading: false });
        return;
      }

      // Get user's profile to check if they exist
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("email")
        .eq("id", newUserId)
        .single();

      if (!profile?.email) {
        set({ initialized: true, loading: false });
        return;
      }

      // Load user's pending invitations first
      await get().loadUserInvitations();

      // Get user's hubs (where they are already members)
      const { data: hubs, error: hubsError } = await supabase
        .from("hubs")
        .select(
          `
          *,
          hub_members!inner(role)
        `
        )
        .eq("hub_members.user_id", newUserId)
        .order("created_at", { ascending: false });

      if (hubsError) throw hubsError;

      const userHubs = hubs || [];
      set({ userHubs });

      // Check if user has only invitations and no hubs
      const { userPendingInvites } = get();
      const hasOnlyInvitations =
        userHubs.length === 0 && userPendingInvites.length > 0;
      set({ hasOnlyInvitations });

      // Only try to set current hub if user has hubs
      if (userHubs.length > 0) {
        // Set current hub (first hub or from localStorage)
        const savedHubId = localStorage.getItem("currentHubId");
        const targetHub = savedHubId
          ? userHubs.find((h) => h.id === savedHubId)
          : userHubs[0];

        if (targetHub) {
          await get().loadHubData(targetHub.id);
          set({ currentHub: targetHub });
        }
      }

      set({ initialized: true, loading: false });
    } catch (error) {
      console.error("Error initializing hubs:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to load hubs",
        loading: false,
        initialized: true,
      });
    }
  },

  // New method to load user's pending invitations
  loadUserInvitations: async () => {
    const { currentUserId } = get();
    if (!currentUserId) return;

    try {
      // Get user's email
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("email")
        .eq("id", currentUserId)
        .single();

      if (!profile?.email) return;

      // Get pending invitations sent to this user's email
      const { data: invitations, error } = await supabase
        .from("hub_invitations")
        .select(
          `
          *,
          hub:hubs(id, name, description),
          inviter:user_profiles!hub_invitations_invited_by_fkey(name, email)
        `
        )
        .eq("email", profile.email)
        .is("accepted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      set({ userPendingInvites: invitations || [] });
    } catch (error) {
      console.error("Error loading user invitations:", error);
    }
  },

  // Accept invitation
  acceptInvitation: async (invitationId: string) => {
    set({ loading: true, error: null });

    try {
      const { currentUserId, userPendingInvites } = get();
      if (!currentUserId) throw new Error("User not authenticated");

      const invitation = userPendingInvites.find(
        (inv) => inv.id === invitationId
      );
      if (!invitation) throw new Error("Invitation not found");

      // Start a transaction-like operation
      // 1. Add user to hub_members
      const { error: memberError } = await supabase.from("hub_members").insert({
        hub_id: invitation.hub_id,
        user_id: currentUserId,
        role: invitation.role,
      });

      if (memberError) throw memberError;

      // 2. Mark invitation as accepted
      const { error: inviteError } = await supabase
        .from("hub_invitations")
        .update({
          accepted_at: new Date().toISOString(),
          accepted_by: currentUserId,
        })
        .eq("id", invitationId);

      if (inviteError) throw inviteError;

      // 3. Refresh all hub data
      await get().initializeHubs();

      set({ loading: false });
      return { success: true };
    } catch (error) {
      console.error("Error accepting invitation:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to accept invitation";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Decline invitation
  declineInvitation: async (invitationId: string) => {
    set({ loading: true, error: null });

    try {
      const { error } = await supabase
        .from("hub_invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;

      // Update local state
      const { userPendingInvites } = get();
      const updatedInvites = userPendingInvites.filter(
        (inv) => inv.id !== invitationId
      );
      set({
        userPendingInvites: updatedInvites,
        hasOnlyInvitations:
          updatedInvites.length > 0 && get().userHubs.length === 0,
      });

      set({ loading: false });
      return { success: true };
    } catch (error) {
      console.error("Error declining invitation:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to decline invitation";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Rest of your existing methods remain the same...
  switchHub: async (hubId: string) => {
    const { userHubs } = get();
    const hub = userHubs.find((h) => h.id === hubId);

    if (!hub) {
      set({ error: "Hub not found" });
      return;
    }

    set({ loading: true, error: null });

    try {
      await get().loadHubData(hubId);
      set({ currentHub: hub, loading: false });
      localStorage.setItem("currentHubId", hubId);
    } catch (error) {
      console.error("Error switching hub:", error);
      set({
        error: error instanceof Error ? error.message : "Failed to switch hub",
        loading: false,
      });
    }
  },

  createHub: async (data: CreateHubData) => {
    set({ loading: true, error: null });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: hub, error } = await supabase
        .from("hubs")
        .insert({
          name: data.name,
          description: data.description,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh hubs list
      await get().initializeHubs();

      set({ loading: false });
      return { success: true, data: hub };
    } catch (error) {
      console.error("Error creating hub:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create hub";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateHub: async (hubId: string, data: UpdateHubData) => {
    set({ loading: true, error: null });

    try {
      const { data: hub, error } = await supabase
        .from("hubs")
        .update(data)
        .eq("id", hubId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      const { userHubs, currentHub } = get();
      const updatedHubs = userHubs.map((h) => (h.id === hubId ? hub : h));

      set({
        userHubs: updatedHubs,
        currentHub: currentHub?.id === hubId ? hub : currentHub,
        loading: false,
      });

      return { success: true, data: hub };
    } catch (error) {
      console.error("Error updating hub:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update hub";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  deleteHub: async (hubId: string) => {
    set({ loading: true, error: null });

    try {
      const { error } = await supabase.from("hubs").delete().eq("id", hubId);

      if (error) throw error;

      // Refresh hubs and switch to another hub if current was deleted
      await get().initializeHubs();

      set({ loading: false });
      return { success: true };
    } catch (error) {
      console.error("Error deleting hub:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete hub";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Member Management
  inviteMember: async (hubId: string, data: InviteMemberData) => {
    set({ loading: true, error: null });

    try {
      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from("hub_members")
        .select("id")
        .eq("hub_id", hubId)
        .eq(
          "user_id",
          (
            await supabase
              .from("user_profiles")
              .select("id")
              .eq("email", data.email)
              .single()
          ).data?.id
        )
        .single();

      if (existingMember) {
        throw new Error("User is already a member of this hub");
      }

      // Check for existing invitation
      const { data: existingInvite } = await supabase
        .from("hub_invitations")
        .select("id")
        .eq("hub_id", hubId)
        .eq("email", data.email)
        .is("accepted_at", null)
        .single();

      if (existingInvite) {
        throw new Error("An invitation has already been sent to this email");
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: invitation, error } = await supabase
        .from("hub_invitations")
        .insert({
          hub_id: hubId,
          email: data.email,
          role: data.role,
          invited_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh invitations
      await get().loadHubData(hubId);

      set({ loading: false });
      return { success: true, data: invitation };
    } catch (error) {
      console.error("Error inviting member:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send invitation";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  removeMember: async (memberId: string) => {
    set({ loading: true, error: null });

    try {
      const { error } = await supabase
        .from("hub_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      // Update local state
      const { hubMembers, currentHub } = get();
      const updatedMembers = hubMembers.filter((m) => m.id !== memberId);

      set({ hubMembers: updatedMembers, loading: false });

      // Refresh hub data if needed
      if (currentHub) {
        await get().loadHubData(currentHub.id);
      }

      return { success: true };
    } catch (error) {
      console.error("Error removing member:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove member";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  updateMemberRole: async (memberId: string, role: HubRole) => {
    set({ loading: true, error: null });

    try {
      const { data: member, error } = await supabase
        .from("hub_members")
        .update({ role })
        .eq("id", memberId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      const { hubMembers } = get();
      const updatedMembers = hubMembers.map((m) =>
        m.id === memberId ? { ...m, role } : m
      );

      set({ hubMembers: updatedMembers, loading: false });

      return { success: true, data: member };
    } catch (error) {
      console.error("Error updating member role:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update member role";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  cancelInvitation: async (invitationId: string) => {
    set({ loading: true, error: null });

    try {
      const { error } = await supabase
        .from("hub_invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;

      // Update local state
      const { pendingInvites } = get();
      const updatedInvites = pendingInvites.filter(
        (i) => i.id !== invitationId
      );

      set({ pendingInvites: updatedInvites, loading: false });

      return { success: true };
    } catch (error) {
      console.error("Error canceling invitation:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to cancel invitation";
      set({ error: errorMessage, loading: false });
      return { success: false, error: errorMessage };
    }
  },

  // Settings & Utilities
  setDefaultHub: async (hubId: string) => {
    localStorage.setItem("currentHubId", hubId);
    await get().switchHub(hubId);
  },

  loadHubData: async (hubId: string) => {
    try {
      // Load hub members with user profiles
      const { data: members, error: membersError } = await supabase
        .from("hub_members")
        .select(
          `
          *,
          user_profile:user_profiles(name, email)
        `
        )
        .eq("hub_id", hubId);

      if (membersError) throw membersError;

      // Load pending invitations
      const { data: invites, error: invitesError } = await supabase
        .from("hub_invitations")
        .select("*")
        .eq("hub_id", hubId)
        .is("accepted_at", null);

      if (invitesError) throw invitesError;

      set({
        hubMembers: members || [],
        pendingInvites: invites || [],
      });
    } catch (error) {
      console.error("Error loading hub data:", error);
      throw error;
    }
  },

  getHubPermissions: (hubId?: string): HubPermissions => {
    const { currentHub, hubMembers, currentUserId } = get();
    const targetHubId = hubId || currentHub?.id;

    if (!targetHubId || !currentUserId) {
      return {
        canManageHub: false,
        canManageMembers: false,
        canInviteMembers: false,
        canRemoveMembers: false,
        canUpdateRoles: false,
        canDeleteHub: false,
      };
    }

    // Find the current user's membership in this hub
    const currentUser = hubMembers.find(
      (m) => m.hub_id === targetHubId && m.user_id === currentUserId
    );

    const role = currentUser?.role;
    const isOwner = role === "owner";
    const isManager = role === "manager";
    const canManage = isOwner || isManager;

    return {
      canManageHub: canManage,
      canManageMembers: canManage,
      canInviteMembers: canManage,
      canRemoveMembers: canManage,
      canUpdateRoles: isOwner, // Only owners can change roles
      canDeleteHub: isOwner,
    };
  },

  clearError: () => set({ error: null }),

  // Real-time subscriptions
  subscribeToHubChanges: (hubId: string) => {
    const membersSubscription = supabase
      .channel(`hub_members_${hubId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "hub_members",
          filter: `hub_id=eq.${hubId}`,
        },
        () => {
          get().loadHubData(hubId);
        }
      )
      .subscribe();

    const invitesSubscription = supabase
      .channel(`hub_invitations_${hubId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "hub_invitations",
          filter: `hub_id=eq.${hubId}`,
        },
        () => {
          get().loadHubData(hubId);
        }
      )
      .subscribe();

    return () => {
      membersSubscription.unsubscribe();
      invitesSubscription.unsubscribe();
    };
  },
}));
