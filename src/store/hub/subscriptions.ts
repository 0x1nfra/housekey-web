import { supabase } from "../../lib/supabase";
import { SetStateFunction, GetStateFunction, SubscriptionGroup } from "./types";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export const createHubSubscriptions = (
  set: SetStateFunction,
  get: GetStateFunction
) => ({
  subscribeToHub: (hubId: string) => {
    const state = get();

    // Don't create duplicate subscriptions
    if (state.subscriptions[hubId]) {
      return;
    }

    try {
      // Subscribe to hub member changes
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
          (payload: RealtimePostgresChangesPayload<any>) => {
            try {
              // Reload hub data to get updated members with profiles
              get().loadHubData(hubId);
            } catch (error) {
              console.error("Error handling member subscription update:", error);
            }
          }
        )
        .subscribe();

      // Subscribe to hub invitation changes
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
          (payload: RealtimePostgresChangesPayload<any>) => {
            try {
              // Reload hub data to get updated invitations
              get().loadHubData(hubId);
            } catch (error) {
              console.error("Error handling invitation subscription update:", error);
            }
          }
        )
        .subscribe();

      // Store subscription references
      const subscriptionGroup: SubscriptionGroup = {
        members: membersSubscription,
        invites: invitesSubscription,
        unsubscribe: () => {
          try {
            membersSubscription.unsubscribe();
            invitesSubscription.unsubscribe();
          } catch (error) {
            console.error("Error unsubscribing from hub subscriptions:", error);
          }
        },
      };

      set((state) => {
        state.subscriptions[hubId] = subscriptionGroup;
      });
    } catch (error) {
      console.error("Error setting up subscriptions for hub:", hubId, error);
    }
  },

  unsubscribeFromHub: (hubId: string) => {
    try {
      const state = get();
      const subscription = state.subscriptions[hubId] as SubscriptionGroup | undefined;

      if (subscription) {
        subscription.unsubscribe();
        set((state) => {
          delete state.subscriptions[hubId];
        });
      }
    } catch (error) {
      console.error("Error unsubscribing from hub:", hubId, error);
    }
  },

  unsubscribeAll: () => {
    try {
      const state = get();

      Object.values(state.subscriptions).forEach((subscription: unknown) => {
        try {
          if (
            subscription &&
            typeof subscription === "object" &&
            "unsubscribe" in subscription &&
            typeof subscription.unsubscribe === "function"
          ) {
            subscription.unsubscribe();
          }
        } catch (error) {
          console.error("Error unsubscribing from individual subscription:", error);
        }
      });

      set((state) => {
        state.subscriptions = {};
      });
    } catch (error) {
      console.error("Error unsubscribing from all subscriptions:", error);
    }
  },
});
