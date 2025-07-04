import { HubState } from './types';

export const initialState: HubState = {
  currentHub: null,
  userHubs: [],
  hubMembers: [],
  pendingInvites: [],
  userInvitations: [],
  currentUserId: null,
  loading: false,
  loadingInvitations: false,
  error: null,
  initialized: false,
};
