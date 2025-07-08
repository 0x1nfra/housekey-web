import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { AuthStore } from './types';
import { initialState } from './state';
import { createAuthActions } from './actions';
import { createAuthSelectors } from './selectors';

// Define the set/get function types for immer
type ImmerSet = (
  nextStateOrUpdater:
    | AuthStore
    | Partial<AuthStore>
    | ((state: AuthStore) => void),
  shouldReplace?: boolean
) => void;

type ImmerGet = () => AuthStore;

export const useAuthStore = create<AuthStore>()(
  devtools(
    immer((set: ImmerSet, get: ImmerGet) => ({
      ...initialState,
      
      // Actions
      ...createAuthActions(set, get)
    })),
    {
      name: 'auth-store'
    }
  )
);

// Export selectors as a separate hook for better performance
export const useAuthSelectors = () => {
  const state = useAuthStore();
  return createAuthSelectors(state);
};

export * from './types';

// Cleanup function for when the store is no longer needed
export const cleanupAuthStore = () => {
  const store = useAuthStore.getState();

  // Reset store state
  store.reset();
};
