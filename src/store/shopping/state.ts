import { ShoppingState } from './types';

export const initialState: ShoppingState = {
  // Lists
  lists: [],
  currentList: null,
  
  // Items (keyed by listId)
  items: {},
  
  // Collaborators (keyed by listId)
  collaborators: {},
  
  // Stats (keyed by listId)
  listStats: {},
  hubStats: {},
  
  // UI State
  loading: {
    lists: false,
    items: false,
    collaborators: false,
    stats: false,
  },
  error: null,
  
  // Realtime subscriptions
  subscriptions: {},
};