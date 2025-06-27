export interface TaskData {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: Date;
  assignedTo: string;
  category?: string;
  recurring?: boolean;
  recurrencePattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurrenceInterval?: number;
}

// Define numeric priority enum
export enum TaskPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  URGENT = 4,
}