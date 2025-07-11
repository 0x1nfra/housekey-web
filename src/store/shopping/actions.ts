import { supabase } from "../../lib/supabase";
import {
  ShoppingList,
  ShoppingListItem,
  CreateListData,
  UpdateListData,
  CreateItemData,
  UpdateItemData,
  ListStats,
  HubShoppingStats,
  SetStateFunction,
  GetStateFunction,
} from "./types";

/*
FIXME:
- add rpc functions for complex actions
*/

export const createShoppingActions = (
  set: SetStateFunction,
  get: GetStateFunction
) => ({
  // List Management
  fetchLists: async (hubId: string) => {
    set((state) => {
      state.loading.lists = true;
      state.error = null;
    });

    try {
      const { data: lists, error } = await supabase
        .from("shopping_lists")
        .select("*")
        .eq("hub_id", hubId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      set((state) => {
        state.lists = lists || [];
        state.loading.lists = false;
      });
    } catch (error) {
      console.error("Error fetching lists:", error);
      set((state) => {
        state.error =
          error instanceof Error ? error.message : "Failed to fetch lists";
        state.loading.lists = false;
      });
    }
  },

  createList: async (
    hubId: string,
    data: CreateListData
  ): Promise<ShoppingList> => {
    set((state) => {
      state.error = null;
      state.loading.lists = true;
    });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: list, error } = await supabase
        .from("shopping_lists")
        .insert({
          hub_id: hubId,
          name: data.name,
          description: data.description,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Optimistically update state
      set((state) => {
        state.lists.unshift(list);
        state.error = null;
        state.loading.lists = false;
      });

      return list;
    } catch (error) {
      console.error("Error creating list:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create list";
      set((state) => {
        state.error = errorMessage;
        state.loading.lists = false;
      });
      throw error;
    }
  },

  updateList: async (listId: string, data: UpdateListData) => {
    set((state) => {
      state.loading.lists = true;
      state.error = null;
    });

    try {
      const { data: list, error } = await supabase
        .from("shopping_lists")
        .update(data)
        .eq("id", listId)
        .select()
        .single();

      if (error) throw error;

      // Update state
      set((state) => {
        const index = state.lists.findIndex((l) => l.id === listId);
        if (index !== -1) state.lists[index] = list;
        if (state.currentList?.id === listId) state.currentList = list;
        state.loading.lists = false;
      });
    } catch (error) {
      console.error("Error updating list:", error);
      set((state) => {
        state.error =
          error instanceof Error ? error.message : "Failed to update list";
        state.loading.lists = false;
      });
    }
  },

  deleteList: async (listId: string) => {
    set((state) => {
      state.loading.lists = true;
      state.error = null;
    });

    try {
      const { error } = await supabase
        .from("shopping_lists")
        .delete()
        .eq("id", listId);

      if (error) throw error;

      // Update state
      set((state) => {
        state.lists = state.lists.filter((l) => l.id !== listId);
        if (state.currentList?.id === listId) state.currentList = null;
        delete state.items[listId];
        delete state.listStats[listId];
        state.loading.lists = false;
      });
    } catch (error) {
      console.error("Error deleting list:", error);
      set((state) => {
        state.error =
          error instanceof Error ? error.message : "Failed to delete list";
        state.loading.lists = false;
      });
    }
  },

  // Item Management
  fetchItems: async (listId: string) => {
    set((state) => {
      state.loading.items = true;
      state.error = null;
    });

    try {
      const { data: items, error } = await supabase
        .from("shopping_list_items")
        .select("*")
        .eq("list_id", listId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      set((state) => {
        state.items[listId] = items || [];
        state.loading.items = false;
      });
    } catch (error) {
      console.error("Error fetching items:", error);
      set((state) => {
        state.error =
          error instanceof Error ? error.message : "Failed to fetch items";
        state.loading.items = false;
      });
    }
  },

  createItem: async (
    listId: string,
    data: CreateItemData
  ): Promise<ShoppingListItem> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const userId = user.user.id;

      const insertData = {
        list_id: listId,
        name: data.name,
        quantity: data.quantity || 1,
        category: data.category,
        note: data.note,
        created_by: userId,
      };

      const { data: item, error } = await supabase
        .from("shopping_list_items")
        .insert(insertData)
        .select()
        .single();

      if (error) {
        // Use proper error logging service in production
        throw error;
      }

      // Optimistically update state
      set((state) => {
        if (!state.items[listId]) {
          state.items[listId] = [];
        }
        state.items[listId].push(item);
      });

      return item;
    } catch (error) {
      console.error("Error creating item:", error);
      set((state) => {
        state.error =
          error instanceof Error ? error.message : "Failed to create item";
      });
      throw error;
    }
  },

  updateItem: async (itemId: string, data: UpdateItemData) => {
    try {
      const { data: item, error } = await supabase
        .from("shopping_list_items")
        .update(data)
        .eq("id", itemId)
        .select()
        .single();

      if (error) throw error;

      // Update state
      set((state) => {
        const listId = item.list_id;
        const itemList = state.items[listId] || [];
        state.items[listId] = itemList.map((i) => (i.id === itemId ? item : i));
      });
    } catch (error) {
      console.error("Error updating item:", error);
      set((state) => {
        state.error =
          error instanceof Error ? error.message : "Failed to update item";
      });
    }
  },

  deleteItem: async (itemId: string) => {
    try {
      // Fetch the item to get its list_id
      const { data: item, error: fetchError } = await supabase
        .from("shopping_list_items")
        .select("list_id")
        .eq("id", itemId)
        .single();

      if (fetchError || !item) throw fetchError || new Error("Item not found");

      const listId = item.list_id;

      const { error } = await supabase
        .from("shopping_list_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      // Update state
      set((state) => {
        const itemList = state.items[listId] || [];
        state.items[listId] = itemList.filter((i) => i.id !== itemId);
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      set((state) => {
        state.error =
          error instanceof Error ? error.message : "Failed to delete item";
      });
    }
  },

  toggleItemComplete: async (itemId: string) => {
    try {
      // Get current item state
      const state = get();
      let currentItem: ShoppingListItem | null = null;
      for (const items of Object.values(state.items)) {
        const item = (items as ShoppingListItem[]).find((i) => i.id === itemId);
        if (item) {
          currentItem = item;
          break;
        }
      }

      if (!currentItem) throw new Error("Item not found");

      const { data: item, error } = await supabase
        .from("shopping_list_items")
        .update({ is_completed: !currentItem.is_completed })
        .eq("id", itemId)
        .select(
          "id, list_id, name, is_completed, quantity, created_by, created_at, updated_at"
        ) // Added quantity and created_by
        .single();

      if (error) throw error;

      // Update state
      set((state) => {
        const listId = item.list_id;
        const itemList = state.items[listId] || [];
        state.items[listId] = itemList.map((i) => (i.id === itemId ? item : i));
      });
    } catch (error) {
      console.error("Error toggling item completion:", error);
      set((state) => {
        state.error =
          error instanceof Error ? error.message : "Failed to update item";
      });
    }
  },

  // Statistics
  fetchListStats: async (listId: string) => {
    set((state) => {
      state.loading.stats = true;
      state.error = null;
    });

    try {
      const [itemsResponse] = await Promise.all([
        supabase
          .from("shopping_list_items")
          .select("id, is_completed, updated_at")
          .eq("list_id", listId),
      ]);

      if (itemsResponse.error) throw itemsResponse.error;

      const items = itemsResponse.data || [];

      const totalItems = items.length;
      const completedItems = items.filter((item) => item.is_completed).length;
      const pendingItems = totalItems - completedItems;
      const completionPercentage =
        totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
      const lastUpdated =
        items.length > 0
          ? Math.max(
              ...items.map((item) => new Date(item.updated_at).getTime())
            )
          : Date.now();

      const stats: ListStats = {
        totalItems,
        completedItems,
        pendingItems,
        completionPercentage,
        lastUpdated: new Date(lastUpdated).toISOString(),
      };

      set((state) => {
        state.listStats[listId] = stats;
        state.loading.stats = false;
      });
    } catch (error) {
      console.error("Error fetching list stats:", error);
      set((state) => {
        state.error =
          error instanceof Error ? error.message : "Failed to fetch list stats";
        state.loading.stats = false;
      });
    }
  },

  fetchHubStats: async (hubId: string) => {
    set((state) => {
      state.loading.stats = true;
      state.error = null;
    });

    try {
      // Fetch all lists for the hub
      const { data: lists, error: listsError } = await supabase
        .from("shopping_lists")
        .select("id, name")
        .eq("hub_id", hubId);

      if (listsError) throw listsError;

      if (!lists || lists.length === 0) {
        const emptyStats: HubShoppingStats = {
          totalLists: 0,
          totalItems: 0,
          completedItems: 0,
        };

        set((state) => {
          state.hubStats[hubId] = emptyStats;
          state.loading.stats = false;
        });

        return;
      }

      const listIds = lists.map((list) => list.id);

      // Fetch items and collaborators for all lists
      const [itemsResponse] = await Promise.all([
        supabase
          .from("shopping_list_items")
          .select("id, list_id, is_completed")
          .in("list_id", listIds),
      ]);

      if (itemsResponse.error) throw itemsResponse.error;

      const items = itemsResponse.data || [];

      // Calculate stats
      const totalItems = items.length;
      const completedItems = items.filter((item) => item.is_completed).length;

      // Find most active list
      const listItemCounts = lists.map((list) => ({
        ...list,
        itemCount: items.filter((item) => item.list_id === list.id).length,
      }));
      const mostActiveList = listItemCounts.reduce(
        (max, list) => (list.itemCount > max.itemCount ? list : max),
        listItemCounts[0]
      );

      const stats: HubShoppingStats = {
        totalLists: lists.length,
        totalItems,
        completedItems,
        mostActiveList:
          mostActiveList.itemCount > 0
            ? {
                id: mostActiveList.id,
                name: mostActiveList.name,
                itemCount: mostActiveList.itemCount,
              }
            : undefined,
      };

      set((state) => {
        state.hubStats[hubId] = stats;
        state.loading.stats = false;
      });
    } catch (error) {
      console.error("Error fetching hub stats:", error);
      set((state) => {
        state.error =
          error instanceof Error ? error.message : "Failed to fetch hub stats";
        state.loading.stats = false;
      });
    }
  },

  // Utility
  setCurrentList: (list: ShoppingList | null) => {
    set((state) => {
      state.currentList = list;
    });
  },

  clearError: () => {
    set((state) => {
      state.error = null;
    });
  },

  reset: () => {
    // Unsubscribe from all subscriptions
    const state = get();
    Object.values(state.subscriptions).forEach((subscription: unknown) => {
      if (
        subscription &&
        typeof subscription === "object" &&
        "unsubscribe" in subscription &&
        typeof subscription.unsubscribe === "function"
      ) {
        subscription.unsubscribe();
      }
    });

    set((state) => {
      state.lists = [];
      state.currentList = null;
      state.items = {};
      state.listStats = {};
      state.hubStats = {};
      state.loading = {
        lists: false,
        items: false,
        stats: false,
      };
      state.error = null;
      state.subscriptions = {};
    });
  },
});
