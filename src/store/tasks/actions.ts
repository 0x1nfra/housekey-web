import { supabase } from '../../lib/supabase';
import { TasksState, Task, TaskPriority, SetStateFunction, GetStateFunction, TaskFilters } from './types';

export const createTasksActions = (
  set: SetStateFunction,
  get: GetStateFunction
) => ({
  fetchTasks: async (hubId: string) => {
    set(state => ({ 
      ...state, 
      loading: { ...state.loading, tasks: true }, 
      error: null 
    }));
    
    try {
      const { data, error } = await supabase
        .rpc('get_hub_tasks_with_users', { hub_uuid: hubId });
      
      if (error) throw error;
      
      set(state => ({
        ...state,
        tasks: {
          ...state.tasks,
          [hubId]: data || []
        },
        currentHub: hubId,
        loading: { ...state.loading, tasks: false }
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      set(state => ({
        ...state,
        error: error instanceof Error ? error.message : 'Failed to fetch tasks',
        loading: { ...state.loading, tasks: false }
      }));
    }
  },

  createTask: async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    set(state => ({ 
      ...state, 
      loading: { ...state.loading, creating: true }, 
      error: null 
    }));
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...taskData,
          created_by: user.user.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => ({
        ...state,
        tasks: {
          ...state.tasks,
          [taskData.hub_id]: [data, ...(state.tasks[taskData.hub_id] || [])]
        },
        loading: { ...state.loading, creating: false }
      }));
    } catch (error) {
      console.error('Error creating task:', error);
      set(state => ({
        ...state,
        error: error instanceof Error ? error.message : 'Failed to create task',
        loading: { ...state.loading, creating: false }
      }));
    }
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    set(state => ({ 
      ...state, 
      loading: { ...state.loading, updating: true }, 
      error: null 
    }));
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => {
        const updatedTasks = { ...state.tasks };
        Object.keys(updatedTasks).forEach(hubId => {
          updatedTasks[hubId] = updatedTasks[hubId].map(task => 
            task.id === id ? { ...task, ...data } : task
          );
        });
        
        return {
          ...state,
          tasks: updatedTasks,
          loading: { ...state.loading, updating: false }
        };
      });
    } catch (error) {
      console.error('Error updating task:', error);
      set(state => ({
        ...state,
        error: error instanceof Error ? error.message : 'Failed to update task',
        loading: { ...state.loading, updating: false }
      }));
    }
  },

  deleteTask: async (id: string) => {
    set(state => ({ 
      ...state, 
      loading: { ...state.loading, deleting: true }, 
      error: null 
    }));
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => {
        const updatedTasks = { ...state.tasks };
        Object.keys(updatedTasks).forEach(hubId => {
          updatedTasks[hubId] = updatedTasks[hubId].filter(task => task.id !== id);
        });
        
        return {
          ...state,
          tasks: updatedTasks,
          selectedTasks: state.selectedTasks.filter(taskId => taskId !== id),
          loading: { ...state.loading, deleting: false }
        };
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      set(state => ({
        ...state,
        error: error instanceof Error ? error.message : 'Failed to delete task',
        loading: { ...state.loading, deleting: false }
      }));
    }
  },

  toggleTaskCompletion: async (id: string) => {
    try {
      const { data, error } = await supabase
        .rpc('toggle_task_completion', { task_id: id });
      
      if (error) throw error;
      
      set(state => {
        const updatedTasks = { ...state.tasks };
        Object.keys(updatedTasks).forEach(hubId => {
          updatedTasks[hubId] = updatedTasks[hubId].map(task => 
            task.id === id ? { ...task, completed: data.completed } : task
          );
        });
        
        return { ...state, tasks: updatedTasks };
      });
    } catch (error) {
      console.error('Error toggling task completion:', error);
      set(state => ({
        ...state,
        error: error instanceof Error ? error.message : 'Failed to toggle task completion'
      }));
    }
  },

  bulkUpdatePriority: async (taskIds: string[], priority: TaskPriority) => {
    set(state => ({ 
      ...state, 
      loading: { ...state.loading, updating: true }, 
      error: null 
    }));
    
    try {
      const { data, error } = await supabase
        .rpc('bulk_update_task_priority', { 
          task_ids: taskIds, 
          new_priority: priority 
        });
      
      if (error) throw error;
      
      set(state => {
        const updatedTasks = { ...state.tasks };
        Object.keys(updatedTasks).forEach(hubId => {
          updatedTasks[hubId] = updatedTasks[hubId].map(task => 
            taskIds.includes(task.id) ? { ...task, priority } : task
          );
        });
        
        return {
          ...state,
          tasks: updatedTasks,
          loading: { ...state.loading, updating: false }
        };
      });
    } catch (error) {
      console.error('Error bulk updating task priority:', error);
      set(state => ({
        ...state,
        error: error instanceof Error ? error.message : 'Failed to update task priorities',
        loading: { ...state.loading, updating: false }
      }));
    }
  },

  bulkDeleteTasks: async (taskIds: string[]) => {
    set(state => ({ 
      ...state, 
      loading: { ...state.loading, deleting: true }, 
      error: null 
    }));
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .in('id', taskIds);
      
      if (error) throw error;
      
      set(state => {
        const updatedTasks = { ...state.tasks };
        Object.keys(updatedTasks).forEach(hubId => {
          updatedTasks[hubId] = updatedTasks[hubId].filter(task => !taskIds.includes(task.id));
        });
        
        return {
          ...state,
          tasks: updatedTasks,
          selectedTasks: [],
          loading: { ...state.loading, deleting: false }
        };
      });
    } catch (error) {
      console.error('Error bulk deleting tasks:', error);
      set(state => ({
        ...state,
        error: error instanceof Error ? error.message : 'Failed to delete tasks',
        loading: { ...state.loading, deleting: false }
      }));
    }
  },

  setCurrentHub: (hubId: string | null) => {
    set(state => ({ ...state, currentHub: hubId }));
  },

  setFilters: (filters: Partial<TaskFilters>) => {
    set(state => ({
      ...state,
      filters: { ...state.filters, ...filters }
    }));
  },

  clearFilters: () => {
    set(state => ({ ...state, filters: {} }));
  },

  toggleTaskSelection: (id: string) => {
    set(state => ({
      ...state,
      selectedTasks: state.selectedTasks.includes(id)
        ? state.selectedTasks.filter(taskId => taskId !== id)
        : [...state.selectedTasks, id]
    }));
  },

  selectAllTasks: () => {
    const { tasks, currentHub } = get();
    const currentTasks = currentHub ? tasks[currentHub] || [] : [];
    
    set(state => ({
      ...state,
      selectedTasks: currentTasks.map(task => task.id)
    }));
  },

  clearSelection: () => {
    set(state => ({ ...state, selectedTasks: [] }));
  },

  clearError: () => {
    set(state => ({ ...state, error: null }));
  },

  reset: () => {
    // Unsubscribe from all subscriptions
    const state = get();
    Object.values(state.subscriptions).forEach((subscription: unknown) => {
      if (
        subscription &&
        typeof subscription === "object" &&
        "unsubscribe" in subscription &&
        typeof subscription.unsubscribe === "function"
      ) {
        subscription.unsubscribe();
      }
    });

    set(() => ({
      tasks: {},
      currentHub: null,
      loading: {
        tasks: false,
        creating: false,
        updating: false,
        deleting: false,
      },
      error: null,
      filters: {},
      selectedTasks: [],
      subscriptions: {},
    }));
  }
});