import { AuthState } from './types';

export const initialState: AuthState = {
  user: null,
  profile: null,
  loading: false,
  error: null,
  initialized: false,
};
