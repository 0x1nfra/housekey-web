import { ShoppingState } from './types';

export const initialState: ShoppingState = {
  // Lists
  lists: [],
  currentList: null,
  
  // Items (keyed by listId)
  items: {},
  
  // Stats (keyed by listId)
  listStats: {},
  hubStats: {},
  
  // UI State
  loading: {
    lists: false,
    items: false,
    stats: false,
  },
  error: null,
  
  // Realtime subscriptions
  subscriptions: {},
};