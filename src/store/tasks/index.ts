import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { TasksStore } from './types';
import { initialState } from './state';
import { createTasksActions } from './actions';
import { createTasksSubscriptions } from './subscriptions';

export const useTasksStore = create<TasksStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      ...createTasksActions(set, get),
      ...createTasksSubscriptions(set, get)
    }),
    {
      name: 'tasks-store'
    }
  )
);

export * from './types';
export * from './selectors';

// Cleanup function for when the store is no longer needed
export const cleanupTasksStore = () => {
  const store = useTasksStore.getState();

  // Unsubscribe from all realtime subscriptions
  Object.values(store.subscriptions).forEach((subscription) => {
    if (subscription && typeof subscription.unsubscribe === "function") {
      subscription.unsubscribe();
    }
  });

  // Reset store state
  store.reset();
};