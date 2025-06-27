import { supabase } from '../../lib/supabase';
import { ShoppingState, ShoppingListItem, ListCollaborator } from './types';
import { RealtimeChannel } from '@supabase/supabase-js';

type SetStateFunction = (updater: (state: ShoppingState) => void) => void;
type GetStateFunction = () => ShoppingState;

interface SubscriptionGroup {
  list: RealtimeChannel;
  items: RealtimeChannel;
  collaborators: RealtimeChannel;
  unsubscribe: () => void;
}

interface PostgresChangePayload<T = Record<string, unknown>> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  schema: string;
  table: string;
  commit_timestamp: string;
}

export const createShoppingSubscriptions = (set: SetStateFunction, get: GetStateFunction) => ({
  subscribeToList: (listId: string) => {
    const state = get();
    
    // Don't create duplicate subscriptions
    if (state.subscriptions[listId]) {
      return;
    }

    // Subscribe to list changes
    const listSubscription = supabase
      .channel(`shopping_list_${listId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shopping_lists',
          filter: `id=eq.${listId}`,
        },
        (payload: PostgresChangePayload) => {
          console.log('List change:', payload);
          
          if (payload.eventType === 'UPDATE') {
            set((state: ShoppingState) => ({
              ...state,
              lists: state.lists.map((list) => 
                list.id === listId ? payload.new as typeof list : list
              ),
              currentList: state.currentList?.id === listId ? payload.new as typeof state.currentList : state.currentList,
            }));
          } else if (payload.eventType === 'DELETE') {
            set((state: ShoppingState) => ({
              ...state,
              lists: state.lists.filter((list) => list.id !== listId),
              currentList: state.currentList?.id === listId ? null : state.currentList,
              items: { ...state.items, [listId]: undefined },
              collaborators: { ...state.collaborators, [listId]: undefined },
              listStats: { ...state.listStats, [listId]: undefined },
            }));
          }
        }
      )
      .subscribe();

    // Subscribe to item changes
    const itemsSubscription = supabase
      .channel(`shopping_items_${listId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shopping_list_items',
          filter: `list_id=eq.${listId}`,
        },
        (payload: PostgresChangePayload<ShoppingListItem>) => {
          console.log('Item change:', payload);
          
          set((state: ShoppingState) => {
            const currentItems = state.items[listId] || [];
            
            if (payload.eventType === 'INSERT') {
              return {
                ...state,
                items: {
                  ...state.items,
                  [listId]: [...currentItems, payload.new],
                },
              };
            } else if (payload.eventType === 'UPDATE') {
              return {
                ...state,
                items: {
                  ...state.items,
                  [listId]: currentItems.map((item) => 
                    item.id === payload.new.id ? payload.new : item
                  ),
                },
              };
            } else if (payload.eventType === 'DELETE') {
              return {
                ...state,
                items: {
                  ...state.items,
                  [listId]: currentItems.filter((item) => item.id !== payload.old.id),
                },
              };
            }
            
            return state;
          });
        }
      )
      .subscribe();

    // Subscribe to collaborator changes
    const collaboratorsSubscription = supabase
      .channel(`shopping_collaborators_${listId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shopping_list_collaborators',
          filter: `list_id=eq.${listId}`,
        },
        (payload: PostgresChangePayload<ListCollaborator>) => {
          console.log('Collaborator change:', payload);
          
          // For collaborator changes, we need to refetch to get the joined user profile data
          const actions = get();
          if ('fetchCollaborators' in actions && typeof actions.fetchCollaborators === 'function') {
            actions.fetchCollaborators(listId);
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
        listSubscription.unsubscribe();
        itemsSubscription.unsubscribe();
        collaboratorsSubscription.unsubscribe();
      },
    };

    set((state: ShoppingState) => ({
      ...state,
      subscriptions: {
        ...state.subscriptions,
        [listId]: subscriptionGroup,
      },
    }));
  },

  unsubscribeFromList: (listId: string) => {
    const state = get();
    const subscription = state.subscriptions[listId] as SubscriptionGroup | undefined;
    
    if (subscription) {
      subscription.unsubscribe();
      
      set((state: ShoppingState) => {
        const newSubscriptions = { ...state.subscriptions };
        delete newSubscriptions[listId];
        return { ...state, subscriptions: newSubscriptions };
      });
    }
  },

  unsubscribeAll: () => {
    const state = get();
    
    Object.values(state.subscriptions).forEach((subscription: unknown) => {
      if (subscription && typeof subscription === 'object' && 'unsubscribe' in subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    });
    
    set((state: ShoppingState) => ({ ...state, subscriptions: {} }));
  },
});