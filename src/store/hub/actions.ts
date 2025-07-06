import { supabase } from "../../lib/supabase";
import {
  CreateHubData,
  UpdateHubData,
  InviteMemberData,
  HubRoleType,
  HubPermissions,
  UserInvitation,
  FetchUserInvitationsResult,
  SetStateFunction,
  GetStateFunction,
} from "./types";

/*
FIXME:  
1. update all calls to RPC
2. add state for errors/robust error handling
3. add logging to Sentry
4. move interface/types/enums to types folder
5. use enum for member roles
6. add role management logic
7. add dayjs
*/

export const createHubActions = (
  set: SetStateFunction,
  get: GetStateFunction
) => ({
  // Core Actions
  initializeHubs: async () => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

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
      set((state) => {
        state.currentUserId = user.id;
      });

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

      set((state) => {
        state.userHubs = hubs || [];
      });

      // Set current hub (first hub or from localStorage)
      const savedHubId = localStorage.getItem("currentHubId");
      const targetHub = savedHubId
        ? hubs?.find((h) => h.id === savedHubId)
        : hubs?.[0];

      if (targetHub) {
        await get().loadHubData(targetHub.id);
        set((state) => {
          state.currentHub = targetHub;
        });
      }

      // Fetch user invitations
      await get().fetchUserInvitations();

      set((state) => {
        state.initialized = true;
        state.loading = false;
      });
    } catch (error) {
      console.error("Error initializing hubs:", error);
      set((state) => {
        state.error = error instanceof Error ? error.message : "Failed to load hubs";
        state.loading = false;
        state.initialized = true;
      });
    }
  },

  switchHub: async (hubId: string) => {
    const { userHubs } = get();
    const hub = userHubs.find((h) => h.id === hubId);

    if (!hub) {
      set((state) => {
        state.error = "Hub not found";
      });
      return;
    }

    set((state) => {
      state.loading = true;
      state.error = null;
    });

    try {
      await get().loadHubData(hubId);
      set((state) => {
        state.currentHub = hub;
        state.loading = false;
      });
      localStorage.setItem("currentHubId", hubId);
    } catch (error) {
      console.error("Error switching hub:", error);
      set((state) => {
        state.error = error instanceof Error ? error.message : "Failed to switch hub";
        state.loading = false;
      });
    }
  },

  createHub: async (data: CreateHubData) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

    const { currentUserId } = get();
    if (!currentUserId) {
      const errorMessage = "User not authenticated";
      set((state) => {
        state.error = errorMessage;
        state.loading = false;
      });
      return { success: false, error: errorMessage };
    }

    try {
      const { data: hub, error } = await supabase
        .from("hubs")
        .insert({
          name: data.name,
          description: data.description,
          created_by: currentUserId,
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh hubs list
      await get().initializeHubs();

      set((state) => {
        state.loading = false;
      });
      return { success: true, data: hub };
    } catch (error) {
      console.error("Error creating hub:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create hub";
      set((state) => {
        state.error = errorMessage;
        state.loading = false;
      });
      return { success: false, error: errorMessage };
    }
  },

  updateHub: async (hubId: string, data: UpdateHubData) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

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

      set((state) => {
        state.userHubs = updatedHubs;
        state.currentHub = currentHub?.id === hubId ? hub : currentHub;
        state.loading = false;
      });

      return { success: true, data: hub };
    } catch (error) {
      console.error("Error updating hub:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update hub";
      set((state) => {
        state.error = errorMessage;
        state.loading = false;
      });
      return { success: false, error: errorMessage };
    }
  },

  leaveHub: async (hubId: string) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

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

      set((state) => {
        state.loading = false;
      });
      return { success: true };
    } catch (error) {
      console.error("Error leaving hub:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to leave hub";
      set((state) => {
        state.error = errorMessage;
        state.loading = false;
      });
      return { success: false, error: errorMessage };
    }
  },

  deleteHub: async (hubId: string) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

    try {
      const { error } = await supabase.from("hubs").delete().eq("id", hubId);

      if (error) throw error;

      // Refresh hubs and switch to another hub if current was deleted
      await get().initializeHubs();

      set((state) => {
        state.loading = false;
      });
      return { success: true };
    } catch (error) {
      console.error("Error deleting hub:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete hub";
      set((state) => {
        state.error = errorMessage;
        state.loading = false;
      });
      return { success: false, error: errorMessage };
    }
  },

  // Member Management
  inviteMember: async (hubId: string, data: InviteMemberData) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

    const { currentUserId } = get();
    if (!currentUserId) {
      const errorMessage = "User not authenticated";
      set((state) => {
        state.error = errorMessage;
        state.loading = false;
      });
      return { success: false, error: errorMessage };
    }

    try {
      // Call the stored procedure
      const { data: result, error } = await supabase.rpc("invite_member", {
        p_hub_id: hubId,
        p_email: data.email,
        p_role: data.role,
        p_invited_by: currentUserId,
      });

      if (error) throw error;

      // Check if the procedure returned an error
      if (!result.success) {
        throw new Error(result.error);
      }

      // Refresh state
      await get().loadHubData(hubId);
      set((state) => {
        state.loading = false;
      });

      return { success: true, data: result.data };
    } catch (err) {
      console.error("Error inviting member:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send invitation";
      set((state) => {
        state.error = errorMessage;
        state.loading = false;
      });
      return { success: false, error: errorMessage };
    }
  },

  removeMember: async (memberId: string) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

    try {
      const { error } = await supabase
        .from("hub_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      // Update local state
      const { hubMembers, currentHub } = get();
      const updatedMembers = hubMembers.filter((m) => m.id !== memberId);

      set((state) => {
        state.hubMembers = updatedMembers;
        state.loading = false;
      });

      // Refresh hub data if needed
      if (currentHub) {
        await get().loadHubData(currentHub.id);
      }

      return { success: true };
    } catch (error) {
      console.error("Error removing member:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to remove member";
      set((state) => {
        state.error = errorMessage;
        state.loading = false;
      });
      return { success: false, error: errorMessage };
    }
  },

  updateMemberRole: async (memberId: string, role: HubRoleType) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

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

      set((state) => {
        state.hubMembers = updatedMembers;
        state.loading = false;
      });

      return { success: true, data: member };
    } catch (error) {
      console.error("Error updating member role:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update member role";
      set((state) => {
        state.error = errorMessage;
        state.loading = false;
      });
      return { success: false, error: errorMessage };
    }
  },

  cancelInvitation: async (invitationId: string) => {
    set((state) => {
      state.loading = true;
      state.error = null;
    });

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

      set((state) => {
        state.pendingInvites = updatedInvites;
        state.loading = false;
      });

      return { success: true };
    } catch (error) {
      console.error("Error canceling invitation:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to cancel invitation";
      set((state) => {
        state.error = errorMessage;
        state.loading = false;
      });
      return { success: false, error: errorMessage };
    }
  },

  // User Invitations
  fetchUserInvitations: async () => {
    set((state) => {
      state.loadingInvitations = true;
      state.error = null;
    });

    const { currentUserId } = get();
    if (!currentUserId) {
      set((state) => {
        state.error = "User not authenticated";
        state.loadingInvitations = false;
      });
      return;
    }

    try {
      // Call the stored procedure
      const { data: invitations, error } = await supabase.rpc(
        "fetch_user_invitations",
        {
          user_id: currentUserId,
        }
      );

      if (error) throw error;

      // Transform data to match UserInvitation interface
      const userInvitations: UserInvitation[] = (invitations || []).map(
        (inv: FetchUserInvitationsResult) => ({
          id: inv.id,
          hub_id: inv.hub_id,
          hub: {
            id: inv.hub_id,
            name: inv.hub_name,
            description: inv.hub_description,
          },
          user_id: currentUserId,
          email: inv.email,
          role: inv.role,
          invited_by: {
            id: inv.invited_by_id,
            name: inv.invited_by_name,
            email: inv.invited_by_email,
          },
          token: inv.token,
          expires_at: inv.expires_at,
          accepted_at: inv.accepted_at,
          created_at: inv.created_at,
          is_expired: inv.is_expired,
        })
      );

      set((state) => {
        state.userInvitations = userInvitations;
        state.loadingInvitations = false;
      });
    } catch (error) {
      console.error("Error fetching user invitations:", error);
      set((state) => {
        state.error = error instanceof Error
          ? error.message
          : "Failed to fetch invitations";
        state.loadingInvitations = false;
      });
    }
  },

  acceptInvitation: async (invitationId: string) => {
    set((state) => {
      state.loadingInvitations = true;
      state.error = null;
    });

    const { currentUserId } = get();
    if (!currentUserId) {
      const errorMessage = "User not authenticated";
      set((state) => {
        state.error = errorMessage;
        state.loadingInvitations = false;
      });
      return { success: false, error: errorMessage };
    }

    try {
      const { data: hubId, error: rpcError } = await supabase.rpc(
        "accept_hub_invitation",
        {
          invitation_id: invitationId,
          user_id: currentUserId,
        }
      );

      if (rpcError) throw rpcError;

      // Refresh data
      await Promise.all([get().fetchUserInvitations(), get().initializeHubs()]);

      set((state) => {
        state.loadingInvitations = false;
      });
      return { success: true, data: { hub_id: hubId } };
    } catch (error) {
      console.error("Error accepting invitation:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to accept invitation";
      set((state) => {
        state.error = errorMessage;
        state.loadingInvitations = false;
      });
      return { success: false, error: errorMessage };
    }
  },

  declineInvitation: async (invitationId: string) => {
    set((state) => {
      state.loadingInvitations = true;
      state.error = null;
    });

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const userId = user.user.id;

      // Call the RPC function
      const { data, error } = await supabase.rpc("decline_hub_invitation", {
        invitation_id: invitationId,
        user_id: userId,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };

      if (!result.success) {
        throw new Error(result.error || "Failed to decline invitation");
      }

      // Refresh the invitation list
      await get().fetchUserInvitations();

      set((state) => {
        state.loadingInvitations = false;
      });
      return { success: true };
    } catch (error) {
      console.error("Error declining invitation:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to decline invitation";
      set((state) => {
        state.error = errorMessage;
        state.loadingInvitations = false;
      });
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

      set((state) => {
        state.hubMembers = members || [];
        state.pendingInvites = invites || [];
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

  clearError: () => set((state) => {
    state.error = null;
  }),

  // Utility
  reset: () => set((state) => {
    state.currentHub = null;
    state.userHubs = [];
    state.hubMembers = [];
    state.pendingInvites = [];
    state.userInvitations = [];
    state.currentUserId = null;
    state.loading = false;
    state.loadingInvitations = false;
    state.error = null;
    state.initialized = false;
    state.subscriptions = {};
  }),
});
