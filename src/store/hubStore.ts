import { create } from "zustand";
import { supabase } from "../lib/supabase";
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
} from "../types/hub";

interface HubState {
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

interface HubActions {
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
}

type HubStore = HubState & HubActions;

export const useHubStore = create<HubStore>((set, get) => ({
  // Initial state
  currentHub: null,
  userHubs: [],
  hubMembers: [],
  pendingInvites: [],
  userInvitations: [],
  currentUserId: null, // Initialize as null
  loading: false,
  loadingInvitations: false,
  error: null,
  initialized: false,

  // Core Actions
  initializeHubs: async () => {
    set({ loading: true, error: null });

    try {
      // Get the current user and store their ID
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // Store the user ID in state
      set({ currentUserId: user.id });

      // Get user's hubs
      const { data: hubs, error: hubsError } = await supabase
        .from("hubs")
        .select(
          `
        *,
        hub_members!inner(role)
      `
        )
        .eq("hub_members.user_id", user.id)
        .order("created_at", { ascending: false });

      if (hubsError) throw hubsError;

      set({ userHubs: hubs || [] });

      // Set current hub (first hub or from localStorage)
      const savedHubId = localStorage.getItem("currentHubId");
      const targetHub = savedHubId
        ? hubs?.find((h) => h.id === savedHubId)
        : hubs?.[0];

      if (targetHub) {
        await get().loadHubData(targetHub.id);
        set({ currentHub: targetHub });
      }

      // Fetch user invitations
      await get().fetchUserInvitations();

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
      const { data: hub, error } = await supabase
        .from("hubs")
        .insert({
          name: data.name,
          description: data.description,
          created_by: (await supabase.auth.getUser()).data.user?.id,
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

  leaveHub: async (hubId: string) => {
    set({ loading: true, error: null });

    const { currentUserId } = get();

    try {
      const { error } = await supabase
        .from("hub_members")
        .delete()
        .eq("user_id", currentUserId)
        .eq("hub_id", hubId);

      if (error) throw error;

      // Refresh hubs and switch to another hub if current was deleted
      await get().initializeHubs();

      set({ loading: false });
      return { success: true };
    } catch (error) {
      console.error("Error leaving hub:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to leave hub";
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
      const supa = supabase;

      // Get user profile ID from email
      const { data: userProfile, error: profileError } = await supa
        .from("user_profiles")
        .select("id")
        .eq("email", data.email)
        .single();

      if (profileError) throw profileError;
      const userId = userProfile.id;

      // Check if already a member
      const { data: existingMember } = await supa
        .from("hub_members")
        .select("id")
        .eq("hub_id", hubId)
        .eq("user_id", userId)
        .single();

      if (existingMember) {
        throw new Error("User is already a member of this hub");
      }

      // Check if invitation already sent
      const { data: existingInvite } = await supa
        .from("hub_invitations")
        .select("id")
        .eq("hub_id", hubId)
        .eq("email", data.email)
        .is("accepted_at", null)
        .single();

      if (existingInvite) {
        throw new Error("An invitation has already been sent to this email");
      }

      // Get inviter's user ID
      const { data: authUser } = await supa.auth.getUser();
      const invitedBy = authUser.user?.id;
      if (!invitedBy) throw new Error("User not authenticated");

      // Create invitation
      const { data: invitation, error: inviteError } = await supa
        .from("hub_invitations")
        .insert({
          hub_id: hubId,
          email: data.email,
          role: data.role,
          invited_by: invitedBy,
          invitee: userProfile.id,
        })
        .select()
        .single();

      if (inviteError) throw inviteError;

      // Refresh state
      await get().loadHubData(hubId);
      set({ loading: false });

      return { success: true, data: invitation };
    } catch (err) {
      console.error("Error inviting member:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send invitation";
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

  // User Invitations
  fetchUserInvitations: async () => {
    set({ loadingInvitations: true, error: null });

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Get user profile to get email
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("id", user.user.id)
        .single();

      if (profileError) throw profileError;

      // Fetch invitations for this user's email
      const { data: invitations, error } = await supabase
        .from("hub_invitations")
        .select(
          `
          *,
          hub:hubs(id, name, description),
          invited_by_profile:user_profiles!hub_invitations_invited_by_fkey1(id, name, email)
          `
        )
        .eq("invitee", profile.id)
        .is("accepted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform data to match UserInvitation interface
      const userInvitations: UserInvitation[] = (invitations || []).map(
        (inv) => ({
          id: inv.id,
          hub_id: inv.hub_id,
          hub: {
            id: inv.hub.id,
            name: inv.hub.name,
            description: inv.hub.description,
          },
          user_id: user.user.id,
          email: inv.email,
          role: inv.role,
          invited_by: {
            id: inv.invited_by_profile.id,
            name: inv.invited_by_profile.name,
            email: inv.invited_by_profile.email,
          },
          token: inv.token,
          expires_at: inv.expires_at,
          accepted_at: inv.accepted_at,
          created_at: inv.created_at,
          is_expired: new Date(inv.expires_at) < new Date(),
        })
      );

      set({ userInvitations, loadingInvitations: false });
    } catch (error) {
      console.error("Error fetching user invitations:", error);
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch invitations",
        loadingInvitations: false,
      });
    }
  },

  acceptInvitation: async (invitationId: string) => {
    set({ loadingInvitations: true, error: null });

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Get invitation data and insert member in one transaction
      const { data: invitationData, error: invitationError } = await supabase
        .from("hub_invitations")
        .select("hub_id, invitee, invited_by")
        .eq("id", invitationId)
        .single();

      if (invitationError) throw invitationError;

      // Insert new member
      const { error: insertError } = await supabase.from("hub_members").insert({
        hub_id: invitationData.hub_id,
        user_id: invitationData.invitee,
        role: "member",
        invited_by: invitationData.invited_by,
      });

      if (insertError) throw insertError;

      // Delete the invitation (fix typo: "invitaions" -> "invitations")
      const { error: deleteError } = await supabase
        .from("hub_invitations")
        .delete()
        .eq("id", invitationId);

      if (deleteError) throw deleteError;

      // Refresh data
      await Promise.all([get().fetchUserInvitations(), get().initializeHubs()]);

      set({ loadingInvitations: false });
      return { success: true, data: { hub_id: invitationData.hub_id } };
    } catch (error) {
      console.error("Error accepting invitation:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to accept invitation";
      set({ error: errorMessage, loadingInvitations: false });
      return { success: false, error: errorMessage };
    }
  },

  declineInvitation: async (invitationId: string) => {
    set({ loadingInvitations: true, error: null });

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Call the database function to decline invitation
      const { data, error } = await supabase.rpc("decline_hub_invitation", {
        invitation_id: invitationId,
        user_id: user.user.id,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };

      if (!result.success) {
        throw new Error(result.error || "Failed to decline invitation");
      }

      // Refresh user invitations
      await get().fetchUserInvitations();

      set({ loadingInvitations: false });
      return { success: true };
    } catch (error) {
      console.error("Error declining invitation:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to decline invitation";
      set({ error: errorMessage, loadingInvitations: false });
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
        .select(
          `
          *,
          hub:hubs(name),
          inviter:user_profiles!invited_by(name, email)
        `
        )
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
