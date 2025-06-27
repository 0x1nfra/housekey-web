import { RealtimeChannel } from "@supabase/supabase-js";
import { TaskPriority } from "../../types/tasks";

// Helper object for display labels
export const PRIORITY_LABELS = {
  [TaskPriority.LOW]: "Low",
  [TaskPriority.MEDIUM]: "Medium",
  [TaskPriority.HIGH]: "High",
  [TaskPriority.URGENT]: "Urgent",
} as const;

// Helper object for display colors
export const PRIORITY_COLORS = {
  [TaskPriority.LOW]: "bg-green-100 text-green-700",
  [TaskPriority.MEDIUM]: "bg-yellow-100 text-yellow-700",
  [TaskPriority.HIGH]: "bg-orange-100 text-orange-700",
  [TaskPriority.URGENT]: "bg-red-100 text-red-700",
} as const;

// Helper object for border colors
export const PRIORITY_BORDER_COLORS = {
  [TaskPriority.LOW]: "border-l-green-500 bg-green-50",
  [TaskPriority.MEDIUM]: "border-l-yellow-500 bg-yellow-50",
  [TaskPriority.HIGH]: "border-l-orange-500 bg-orange-50",
  [TaskPriority.URGENT]: "border-l-red-500 bg-red-50",
} as const;

export interface TaskCategory {
  id: string;
  hub_id: string;  // Changed from user_id to hub_id
  name: string;
  color: string;
  created_at: string;
}

export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface Task {
  id: string;
  hub_id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriority; // Use numeric enum
  due_date?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  assigned_to?: string;
  created_by_email?: string;
  assigned_to_email?: string;
  assigned_to_name?: string;
  category_id?: string;
  category_name?: string;
  category_color?: string;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
  recurrence_interval?: number;
  next_due_date?: string;
}

export interface TaskFilters {
  completed?: boolean;
  priority?: TaskPriority;
  assigned_to?: string;
  category_id?: string;
  search?: string;
}

export interface TasksState {
  // Tasks (keyed by hubId)
  tasks: Record<string, Task[]>;
  currentHub: string | null;

  // Categories
  categories: TaskCategory[];

  // UI State
  loading: {
    tasks: boolean;
    creating: boolean;
    updating: boolean;
    deleting: boolean;
    categories: boolean;
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
  fetchCategories: (hubId?: string) => Promise<void>;  // Updated to accept optional hubId

  // CRUD operations
  createTask: (
    task: Omit<Task, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Category operations
  createCategory: (category: Omit<TaskCategory, "id" | "created_at" | "hub_id">) => Promise<void>;  // Updated to exclude hub_id
  updateCategory: (id: string, updates: Partial<TaskCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Bulk operations
  toggleTaskCompletion: (id: string) => Promise<void>;
  bulkUpdatePriority: (
    taskIds: string[],
    priority: TaskPriority
  ) => Promise<void>;
  bulkDeleteTasks: (taskIds: string[]) => Promise<void>;

  // Recurring tasks
  createNextRecurringTask: (taskId: string) => Promise<void>;

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
export const filterTasksByPriority = (
  tasks: Task[],
  minPriority: TaskPriority
): Task[] => {
  return tasks.filter((task) => task.priority >= minPriority);
};

// Recurrence pattern labels
export const RECURRENCE_LABELS = {
  daily: "Daily",
  weekly: "Weekly", 
  monthly: "Monthly",
  yearly: "Yearly",
} as const;

export const getRecurrenceLabel = (pattern: RecurrencePattern): string => {
  return RECURRENCE_LABELS[pattern];
};