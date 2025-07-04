import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AuthStore } from './types';
import { initialState } from './state';
import { createAuthActions } from './actions';
import { createAuthSelectors } from './selectors';

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set, get) => ({
      ...initialState,
      ...createAuthActions(set, get)
    }),
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
