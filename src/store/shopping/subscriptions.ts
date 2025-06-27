import { supabase } from "../../lib/supabase";
import {
  ShoppingState,
  ShoppingListItem,
  ListCollaborator,
  ShoppingList,
  SetStateFunction,
  GetStateFunction,
  SubscriptionGroup,
} from "./types";
import { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

export const createShoppingSubscriptions = (
  set: SetStateFunction,
  get: GetStateFunction
) => ({
  subscribeToList: (listId: string) => {
    const state = get();

    // Don't create duplicate subscriptions
    if (state.subscriptions[listId]) {
      return;
    }

    try {
      // Subscribe to list changes
      const listSubscription = supabase
        .channel(`shopping_list_${listId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "shopping_lists",
            filter: `id=eq.${listId}`,
          },
          (payload: RealtimePostgresChangesPayload<ShoppingList>) => {
            try {
              if (payload.eventType === "UPDATE") {
                set((state: ShoppingState) => ({
                  ...state,
                  lists: state.lists.map((list) =>
                    list.id === listId ? payload.new : list
                  ),
                  currentList:
                    state.currentList?.id === listId
                      ? payload.new
                      : state.currentList,
                }));
              } else if (payload.eventType === "DELETE") {
                set((state: ShoppingState) => ({
                  ...state,
                  lists: state.lists.filter((list) => list.id !== listId),
                  currentList:
                    state.currentList?.id === listId ? null : state.currentList,
                  items: Object.fromEntries(
                    Object.entries(state.items).filter(([id]) => id !== listId)
                  ),
                  collaborators: Object.fromEntries(
                    Object.entries(state.collaborators).filter(
                      ([id]) => id !== listId
                    )
                  ),
                  listStats: Object.fromEntries(
                    Object.entries(state.listStats).filter(([id]) => id !== listId)
                  ),
                }));
              }
            } catch (error) {
              console.error("Error handling list subscription update:", error);
              set((state: ShoppingState) => ({
                ...state,
                error: "Failed to process list update. Please refresh the page.",
              }));
            }
          }
        )
        .subscribe();

      // Subscribe to item changes
      const itemsSubscription = supabase
        .channel(`shopping_items_${listId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "shopping_list_items",
            filter: `list_id=eq.${listId}`,
          },
          (payload: RealtimePostgresChangesPayload<ShoppingListItem>) => {
            try {
              console.log("Item change:", payload);

              set((state: ShoppingState) => {
                const currentItems = state.items[listId] || [];

                if (payload.eventType === "INSERT") {
                  return {
                    ...state,
                    items: {
                      ...state.items,
                      [listId]: [...currentItems, payload.new],
                    },
                  };
                } else if (payload.eventType === "UPDATE") {
                  return {
                    ...state,
                    items: {
                      ...state.items,
                      [listId]: currentItems.map((item) =>
                        item.id === payload.new.id ? payload.new : item
                      ),
                    },
                  };
                } else if (payload.eventType === "DELETE") {
                  return {
                    ...state,
                    items: {
                      ...state.items,
                      [listId]: currentItems.filter(
                        (item) => item.id !== payload.old.id
                      ),
                    },
                  };
                }

                return state;
              });
            } catch (error) {
              console.error("Error handling item subscription update:", error);
              set((state: ShoppingState) => ({
                ...state,
                error: "Failed to process item update. Please refresh the page.",
              }));
            }
          }
        )
        .subscribe();

      // Subscribe to collaborator changes
      const collaboratorsSubscription = supabase
        .channel(`shopping_collaborators_${listId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "shopping_list_collaborators",
            filter: `list_id=eq.${listId}`,
          },
          (payload: RealtimePostgresChangesPayload<ListCollaborator>) => {
            try {
              console.log("Collaborator change:", payload);

              // For collaborator changes, we need to refetch to get the joined user profile data
              const actions = get();
              if (
                "fetchCollaborators" in actions &&
                typeof actions.fetchCollaborators === "function"
              ) {
                actions.fetchCollaborators(listId);
              }
            } catch (error) {
              console.error("Error handling collaborator subscription update:", error);
              set((state: ShoppingState) => ({
                ...state,
                error: "Failed to process collaborator update. Please refresh the page.",
              }));
            }
          }
        )
        .subscribe();

      // Store subscription references
      const subscriptionGroup: SubscriptionGroup = {
        list: listSubscription,
        items: itemsSubscription,
        collaborators: collaboratorsSubscription,
        unsubscribe: () => {
          try {
            listSubscription.unsubscribe();
            itemsSubscription.unsubscribe();
            collaboratorsSubscription.unsubscribe();
          } catch (error) {
            console.error("Error unsubscribing from list subscriptions:", error);
          }
        },
      };

      set((state: ShoppingState) => ({
        ...state,
        subscriptions: {
          ...state.subscriptions,
          [listId]: subscriptionGroup,
        },
      }));
    } catch (error) {
      console.error("Error setting up subscriptions for list:", listId, error);
      set((state: ShoppingState) => ({
        ...state,
        error: "Failed to set up real-time updates. Some features may not work properly.",
      }));
    }
  },

  unsubscribeFromList: (listId: string) => {
    try {
      const state = get();
      const subscription = state.subscriptions[listId] as
        | SubscriptionGroup
        | undefined;

      if (subscription) {
        subscription.unsubscribe();

        set((state: ShoppingState) => {
          const newSubscriptions = { ...state.subscriptions };
          delete newSubscriptions[listId];
          return { ...state, subscriptions: newSubscriptions };
        });
      }
    } catch (error) {
      console.error("Error unsubscribing from list:", listId, error);
      set((state: ShoppingState) => ({
        ...state,
        error: "Failed to clean up real-time connections. Please refresh the page.",
      }));
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

      set((state: ShoppingState) => ({ ...state, subscriptions: {} }));
    } catch (error) {
      console.error("Error unsubscribing from all subscriptions:", error);
      set((state: ShoppingState) => ({
        ...state,
        error: "Failed to clean up all real-time connections. Please refresh the page.",
      }));
    }
  },
});