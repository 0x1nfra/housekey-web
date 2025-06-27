import { TasksState } from './types';

export const initialState: TasksState = {
  // Tasks (keyed by hubId)
  tasks: {},
  currentHub: null,
  
  // UI State
  loading: {
    tasks: false,
    creating: false,
    updating: false,
    deleting: false,
  },
  error: null,
  filters: {},
  selectedTasks: [],
  
  // Realtime subscriptions
  subscriptions: {},
};