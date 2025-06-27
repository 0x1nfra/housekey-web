import { RealtimeChannel } from "@supabase/supabase-js";

// Define numeric priority enum
export enum TaskPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  URGENT = 4
}

// Helper object for display labels
export const PRIORITY_LABELS = {
  [TaskPriority.LOW]: 'Low',
  [TaskPriority.MEDIUM]: 'Medium', 
  [TaskPriority.HIGH]: 'High',
  [TaskPriority.URGENT]: 'Urgent'
} as const;

// Helper object for display colors
export const PRIORITY_COLORS = {
  [TaskPriority.LOW]: 'bg-green-100 text-green-700',
  [TaskPriority.MEDIUM]: 'bg-yellow-100 text-yellow-700',
  [TaskPriority.HIGH]: 'bg-orange-100 text-orange-700',
  [TaskPriority.URGENT]: 'bg-red-100 text-red-700'
} as const;

// Helper object for border colors
export const PRIORITY_BORDER_COLORS = {
  [TaskPriority.LOW]: 'border-l-green-500 bg-green-50',
  [TaskPriority.MEDIUM]: 'border-l-yellow-500 bg-yellow-50',
  [TaskPriority.HIGH]: 'border-l-orange-500 bg-orange-50',
  [TaskPriority.URGENT]: 'border-l-red-500 bg-red-50'
} as const;

export interface Task {
  id: string;
  hub_id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriority;  // Use numeric enum
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
  priority?: TaskPriority;
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
  bulkUpdatePriority: (taskIds: string[], priority: TaskPriority) => Promise<void>;
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

// Utility functions for priority handling
export const getPriorityLabel = (priority: TaskPriority): string => {
  return PRIORITY_LABELS[priority];
};

export const getPriorityColor = (priority: TaskPriority): string => {
  return PRIORITY_COLORS[priority];
};

export const getPriorityBorderColor = (priority: TaskPriority): string => {
  return PRIORITY_BORDER_COLORS[priority];
};

// Easy sorting by priority (higher numbers = higher priority)
export const sortTasksByPriority = (tasks: Task[]): Task[] => {
  return tasks.sort((a, b) => b.priority - a.priority);
};

// Filter tasks by priority level
export const filterTasksByPriority = (tasks: Task[], minPriority: TaskPriority): Task[] => {
  return tasks.filter(task => task.priority >= minPriority);
};