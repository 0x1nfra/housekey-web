import { supabase } from "../../lib/supabase";
import { SetStateFunction, GetStateFunction } from "./types";

export const createHubSubscriptions = (
  set: SetStateFunction,
  get: GetStateFunction
) => ({
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
});
