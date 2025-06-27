import { supabase } from '../../lib/supabase';
import { TasksState, Task, TaskCategory, TaskPriority, SetStateFunction, GetStateFunction, TaskFilters } from './types';

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

  fetchCategories: async () => {
    set(state => ({ 
      ...state, 
      loading: { ...state.loading, categories: true }, 
      error: null 
    }));
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('get_user_categories', { user_uuid: user.user.id });
      
      if (error) throw error;
      
      set(state => ({
        ...state,
        categories: data || [],
        loading: { ...state.loading, categories: false }
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      set(state => ({
        ...state,
        error: error instanceof Error ? error.message : 'Failed to fetch categories',
        loading: { ...state.loading, categories: false }
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

  createCategory: async (categoryData: Omit<TaskCategory, 'id' | 'created_at' | 'user_id'>) => {
    set(state => ({ 
      ...state, 
      loading: { ...state.loading, categories: true }, 
      error: null 
    }));
    
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tasks_categories')
        .insert([{
          ...categoryData,
          user_id: user.user.id
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => ({
        ...state,
        categories: [...state.categories, data],
        loading: { ...state.loading, categories: false }
      }));
    } catch (error) {
      console.error('Error creating category:', error);
      set(state => ({
        ...state,
        error: error instanceof Error ? error.message : 'Failed to create category',
        loading: { ...state.loading, categories: false }
      }));
    }
  },

  updateCategory: async (id: string, updates: Partial<TaskCategory>) => {
    set(state => ({ 
      ...state, 
      loading: { ...state.loading, categories: true }, 
      error: null 
    }));
    
    try {
      const { data, error } = await supabase
        .from('tasks_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => ({
        ...state,
        categories: state.categories.map(cat => 
          cat.id === id ? { ...cat, ...data } : cat
        ),
        loading: { ...state.loading, categories: false }
      }));
    } catch (error) {
      console.error('Error updating category:', error);
      set(state => ({
        ...state,
        error: error instanceof Error ? error.message : 'Failed to update category',
        loading: { ...state.loading, categories: false }
      }));
    }
  },

  deleteCategory: async (id: string) => {
    set(state => ({ 
      ...state, 
      loading: { ...state.loading, categories: true }, 
      error: null 
    }));
    
    try {
      const { error } = await supabase
        .from('tasks_categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      set(state => ({
        ...state,
        categories: state.categories.filter(cat => cat.id !== id),
        loading: { ...state.loading, categories: false }
      }));
    } catch (error) {
      console.error('Error deleting category:', error);
      set(state => ({
        ...state,
        error: error instanceof Error ? error.message : 'Failed to delete category',
        loading: { ...state.loading, categories: false }
      }));
    }
  },

  toggleTaskCompletion: async (id: string) => {
    try {
      // Get the task to check if it's recurring
      const state = get();
      let task: Task | null = null;
      for (const hubTasks of Object.values(state.tasks)) {
        const foundTask = (hubTasks as Task[]).find(t => t.id === id);
        if (foundTask) {
          task = foundTask;
          break;
        }
      }

      const { data, error } = await supabase
        .rpc('toggle_task_completion', { task_id: id });
      
      if (error) throw error;
      
      // If task is recurring and was just completed, create next instance
      if (task?.is_recurring && !task.completed && data.completed) {
        await get().createNextRecurringTask(id);
      }
      
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

  createNextRecurringTask: async (taskId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('create_next_recurring_task', { task_id: taskId });
      
      if (error) throw error;
      
      if (data.success) {
        // Refresh tasks to show the new recurring instance
        const state = get();
        if (state.currentHub) {
          await get().fetchTasks(state.currentHub);
        }
      }
    } catch (error) {
      console.error('Error creating next recurring task:', error);
      set(state => ({
        ...state,
        error: error instanceof Error ? error.message : 'Failed to create next recurring task'
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
      categories: [],
      loading: {
        tasks: false,
        creating: false,
        updating: false,
        deleting: false,
        categories: false,
      },
      error: null,
      filters: {},
      selectedTasks: [],
      subscriptions: {},
    }));
  }
});