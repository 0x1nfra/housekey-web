import { ShoppingState, ShoppingListItem, ListStats } from './types';

export const createShoppingSelectors = (state: ShoppingState) => ({
  // List selectors
  getListById: (listId: string) => 
    state.lists.find(list => list.id === listId),

  getListsByHub: (hubId: string) => 
    state.lists.filter(list => list.hub_id === hubId),

  // Item selectors
  getItemsByList: (listId: string): ShoppingListItem[] => 
    state.items[listId] || [],

  getPendingItems: (listId: string): ShoppingListItem[] => 
    (state.items[listId] || []).filter(item => !item.is_completed),

  getCompletedItems: (listId: string): ShoppingListItem[] => 
    (state.items[listId] || []).filter(item => item.is_completed),

  getItemsByCategory: (listId: string) => {
    const items = state.items[listId] || [];
    const grouped: Record<string, ShoppingListItem[]> = {};
    
    items.forEach(item => {
      const category = item.category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    
    return grouped;
  },

  // Collaborator selectors
  getCollaboratorsByList: (listId: string) => 
    state.collaborators[listId] || [],

  getUserRole: (listId: string, userId: string) => {
    const collaborators = state.collaborators[listId] || [];
    const collaborator = collaborators.find(c => c.user_id === userId);
    return collaborator?.role || null;
  },

  canUserEdit: (listId: string, userId: string) => {
    const role = createShoppingSelectors(state).getUserRole(listId, userId);
    return role === 'owner' || role === 'editor';
  },

  canUserManage: (listId: string, userId: string) => {
    const role = createShoppingSelectors(state).getUserRole(listId, userId);
    return role === 'owner';
  },

  // Stats selectors
  getListStats: (listId: string): ListStats | null => 
    state.listStats[listId] || null,

  getHubStats: (hubId: string) => 
    state.hubStats[hubId] || null,

  // Computed stats
  getQuickStats: (listId: string) => {
    const items = state.items[listId] || [];
    const totalItems = items.length;
    const completedItems = items.filter(item => item.is_completed).length;
    const pendingItems = totalItems - completedItems;
    const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      totalItems,
      completedItems,
      pendingItems,
      completionPercentage,
    };
  },

  // Loading selectors
  isLoading: (type?: keyof ShoppingState['loading']) => {
    if (type) {
      return state.loading[type];
    }
    return Object.values(state.loading).some(loading => loading);
  },

  // Search and filter
  searchItems: (listId: string, query: string): ShoppingListItem[] => {
    const items = state.items[listId] || [];
    if (!query.trim()) return items;
    
    const searchTerm = query.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm) ||
      item.category?.toLowerCase().includes(searchTerm) ||
      item.note?.toLowerCase().includes(searchTerm)
    );
  },

  filterItemsByCategory: (listId: string, category: string): ShoppingListItem[] => {
    const items = state.items[listId] || [];
    if (!category) return items;
    
    return items.filter(item => item.category === category);
  },

  // Recent activity
  getRecentActivity: (listId: string, limit: number = 10) => {
    const items = state.items[listId] || [];
    return items
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, limit);
  },

  // Categories
  getCategories: (listId: string): string[] => {
    const items = state.items[listId] || [];
    const categories = new Set<string>();
    
    items.forEach(item => {
      if (item.category) {
        categories.add(item.category);
      }
    });
    
    return Array.from(categories).sort();
  },

  // Progress tracking
  getCategoryProgress: (listId: string) => {
    const items = state.items[listId] || [];
    const categoryStats: Record<string, { total: number; completed: number; percentage: number }> = {};
    
    items.forEach(item => {
      const category = item.category || 'Uncategorized';
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, completed: 0, percentage: 0 };
      }
      
      categoryStats[category].total++;
      if (item.is_completed) {
        categoryStats[category].completed++;
      }
    });
    
    // Calculate percentages
    Object.keys(categoryStats).forEach(category => {
      const stats = categoryStats[category];
      stats.percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    });
    
    return categoryStats;
  },
});