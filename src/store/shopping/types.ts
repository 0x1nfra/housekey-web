import { RealtimeChannel } from "@supabase/supabase-js";

export type SetStateFunction = (
  updater: (state: ShoppingState) => void
) => void;

export type GetStateFunction = () => ShoppingState;

export interface ShoppingList {
  id: string;
  hub_id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ShoppingListItem {
  id: string;
  list_id: string;
  name: string;
  quantity: number;
  category?: string;
  note?: string;
  is_completed: boolean;
  created_by: string;
  completed_by?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ListStats {
  totalItems: number;
  completedItems: number;
  pendingItems: number;
  completionPercentage: number;
  lastUpdated: string;
}

export interface HubShoppingStats {
  totalLists: number;
  totalItems: number;
  completedItems: number;
  mostActiveList?: {
    id: string;
    name: string;
    itemCount: number;
  };
}

export interface CreateListData {
  name: string;
  description?: string;
}

export interface UpdateListData {
  name?: string;
  description?: string;
}

export interface CreateItemData {
  name: string;
  quantity?: number;
  category?: string;
  note?: string;
}

export interface UpdateItemData {
  name?: string;
  quantity?: number;
  category?: string;
  note?: string;
  is_completed?: boolean;
}

export interface ShoppingState {
  // Lists
  lists: ShoppingList[];
  currentList: ShoppingList | null;

  // Items (keyed by listId)
  items: Record<string, ShoppingListItem[]>;

  // Stats (keyed by listId)
  listStats: Record<string, ListStats>;
  hubStats: Record<string, HubShoppingStats>;

  // UI State
  loading: {
    lists: boolean;
    items: boolean;
    stats: boolean;
  };
  error: string | null;

  // Realtime subscriptions
  subscriptions: Record<string, SubscriptionGroup>;
}

export interface ShoppingActions {
  // List Management
  fetchLists: (hubId: string) => Promise<void>;
  createList: (hubId: string, data: CreateListData) => Promise<ShoppingList>;
  updateList: (listId: string, data: UpdateListData) => Promise<void>;
  deleteList: (listId: string) => Promise<void>;

  // Item Management
  fetchItems: (listId: string) => Promise<void>;
  createItem: (
    listId: string,
    data: CreateItemData
  ) => Promise<ShoppingListItem>;
  updateItem: (itemId: string, data: UpdateItemData) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  toggleItemComplete: (itemId: string) => Promise<void>;

  // Statistics
  fetchListStats: (listId: string) => Promise<void>;
  fetchHubStats: (hubId: string) => Promise<void>;

  // Realtime
  subscribeToList: (listId: string) => void;
  unsubscribeFromList: (listId: string) => void;

  // Utility
  setCurrentList: (list: ShoppingList | null) => void;
  clearError: () => void;
  reset: () => void;
}

export type ShoppingStore = ShoppingState & ShoppingActions;

export interface SubscriptionGroup {
  list: RealtimeChannel;
  items: RealtimeChannel;
  unsubscribe: () => void;
}

export interface Result<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
