import { supabase } from '../../lib/supabase';

export const createShoppingSubscriptions = (set: any, get: any) => ({
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
        (payload) => {
          console.log('List change:', payload);
          
          if (payload.eventType === 'UPDATE') {
            set((state: any) => ({
              lists: state.lists.map((list: any) => 
                list.id === listId ? payload.new : list
              ),
              currentList: state.currentList?.id === listId ? payload.new : state.currentList,
            }));
          } else if (payload.eventType === 'DELETE') {
            set((state: any) => ({
              lists: state.lists.filter((list: any) => list.id !== listId),
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
        (payload) => {
          console.log('Item change:', payload);
          
          set((state: any) => {
            const currentItems = state.items[listId] || [];
            
            if (payload.eventType === 'INSERT') {
              return {
                items: {
                  ...state.items,
                  [listId]: [...currentItems, payload.new],
                },
              };
            } else if (payload.eventType === 'UPDATE') {
              return {
                items: {
                  ...state.items,
                  [listId]: currentItems.map((item: any) => 
                    item.id === payload.new.id ? payload.new : item
                  ),
                },
              };
            } else if (payload.eventType === 'DELETE') {
              return {
                items: {
                  ...state.items,
                  [listId]: currentItems.filter((item: any) => item.id !== payload.old.id),
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
        (payload) => {
          console.log('Collaborator change:', payload);
          
          // For collaborator changes, we need to refetch to get the joined user profile data
          const actions = get();
          actions.fetchCollaborators(listId);
        }
      )
      .subscribe();

    // Store subscription references
    set((state: any) => ({
      subscriptions: {
        ...state.subscriptions,
        [listId]: {
          list: listSubscription,
          items: itemsSubscription,
          collaborators: collaboratorsSubscription,
          unsubscribe: () => {
            listSubscription.unsubscribe();
            itemsSubscription.unsubscribe();
            collaboratorsSubscription.unsubscribe();
          },
        },
      },
    }));
  },

  unsubscribeFromList: (listId: string) => {
    const state = get();
    const subscription = state.subscriptions[listId];
    
    if (subscription) {
      subscription.unsubscribe();
      
      set((state: any) => {
        const newSubscriptions = { ...state.subscriptions };
        delete newSubscriptions[listId];
        return { subscriptions: newSubscriptions };
      });
    }
  },

  unsubscribeAll: () => {
    const state = get();
    
    Object.values(state.subscriptions).forEach((subscription: any) => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    });
    
    set({ subscriptions: {} });
  },
});