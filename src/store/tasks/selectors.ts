import { TasksStore, Task } from './types';

export const selectCurrentTasks = (state: TasksStore): Task[] => {
  const { tasks, currentHub } = state;
  return currentHub ? tasks[currentHub] || [] : [];
};

export const selectFilteredTasks = (state: TasksStore): Task[] => {
  const currentTasks = selectCurrentTasks(state);
  const { filters } = state;
  
  return currentTasks.filter(task => {
    // Filter by completion status
    if (filters.completed !== undefined && task.completed !== filters.completed) {
      return false;
    }
    
    // Filter by priority
    if (filters.priority && task.priority !== filters.priority) {
      return false;
    }
    
    // Filter by assigned user
    if (filters.assigned_to && task.assigned_to !== filters.assigned_to) {
      return false;
    }
    
    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchTerm) ||
        task.description?.toLowerCase().includes(searchTerm)
      );
    }
    
    return true;
  });
};

export const selectTasksByPriority = (state: TasksStore) => {
  const filteredTasks = selectFilteredTasks(state);
  
  return {
    high: filteredTasks.filter(task => task.priority === 'high'),
    medium: filteredTasks.filter(task => task.priority === 'medium'),
    low: filteredTasks.filter(task => task.priority === 'low')
  };
};

export const selectTaskStats = (state: TasksStore) => {
  const currentTasks = selectCurrentTasks(state);
  const completed = currentTasks.filter(task => task.completed).length;
  const total = currentTasks.length;
  
  return {
    total,
    completed,
    pending: total - completed,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
  };
};

export const selectTasksByStatus = (state: TasksStore) => {
  const currentTasks = selectCurrentTasks(state);
  
  return {
    completed: currentTasks.filter(task => task.completed),
    pending: currentTasks.filter(task => !task.completed)
  };
};

export const selectOverdueTasks = (state: TasksStore): Task[] => {
  const currentTasks = selectCurrentTasks(state);
  const now = new Date();
  
  return currentTasks.filter(task => 
    !task.completed && 
    task.due_date && 
    new Date(task.due_date) < now
  );
};

export const selectTasksDueToday = (state: TasksStore): Task[] => {
  const currentTasks = selectCurrentTasks(state);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return currentTasks.filter(task => 
    task.due_date && 
    new Date(task.due_date) >= today && 
    new Date(task.due_date) < tomorrow
  );
};

export const selectTasksByAssignee = (state: TasksStore) => {
  const currentTasks = selectCurrentTasks(state);
  const grouped: Record<string, Task[]> = {};
  
  currentTasks.forEach(task => {
    const assignee = task.assigned_to_email || 'Unassigned';
    if (!grouped[assignee]) {
      grouped[assignee] = [];
    }
    grouped[assignee].push(task);
  });
  
  return grouped;
};

export const selectIsLoading = (state: TasksStore, type?: keyof TasksStore['loading']) => {
  if (type) {
    return state.loading[type];
  }
  return Object.values(state.loading).some(loading => loading);
};

export const selectHasSelectedTasks = (state: TasksStore): boolean => {
  return state.selectedTasks.length > 0;
};

export const selectSelectedTasksCount = (state: TasksStore): number => {
  return state.selectedTasks.length;
};