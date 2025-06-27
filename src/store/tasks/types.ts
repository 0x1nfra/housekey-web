import { RealtimeChannel } from "@supabase/supabase-js";

export interface Task {
  id: string;
  hub_id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  assigned_to?: string;
  created_by_email?: string;
  assigned_to_email?: string;
}

export interface TaskFilters {
  completed?: boolean;
  priority?: Task['priority'];
  assigned_to?: string;
  search?: string;
}

export interface TasksState {
  // Tasks (keyed by hubId)
  tasks: Record<string, Task[]>;
  currentHub: string | null;
  
  // UI State
  loading: {
    tasks: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
  };
  error: string | null;
  filters: TaskFilters;
  selectedTasks: string[];
  
  // Realtime subscriptions
  subscriptions: Record<string, SubscriptionGroup>;
}

export interface SubscriptionGroup {
  tasks: RealtimeChannel;
  unsubscribe: () => void;
}

export interface TasksActions {
  // Data fetching
  fetchTasks: (hubId: string) => Promise<void>;
  
  // CRUD operations
  createTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  // Bulk operations
  toggleTaskCompletion: (id: string) => Promise<void>;
  bulkUpdatePriority: (taskIds: string[], priority: Task['priority']) => Promise<void>;
  bulkDeleteTasks: (taskIds: string[]) => Promise<void>;
  
  // UI state management
  setCurrentHub: (hubId: string | null) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
  toggleTaskSelection: (id: string) => void;
  selectAllTasks: () => void;
  clearSelection: () => void;
  
  // Subscription management
  subscribeToHub: (hubId: string) => void;
  unsubscribeFromHub: (hubId: string) => void;
  unsubscribeAll: () => void;
  
  // Utility
  reset: () => void;
  clearError: () => void;
}

export type TasksStore = TasksState & TasksActions;

// Helper types for function signatures
export type SetStateFunction = (fn: (state: TasksState) => TasksState) => void;
export type GetStateFunction = () => TasksStore;