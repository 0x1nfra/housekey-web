import { ShoppingState, ShoppingListItem, ListStats } from "./types";

export const createShoppingSelectors = (state: ShoppingState) => ({
  // List selectors
  getListById: (listId: string) =>
    state.lists.find((list) => list.id === listId),

  getListsByHub: (hubId: string) =>
    state.lists.filter((list) => list.hub_id === hubId),

  // Item selectors
  getItemsByList: (listId: string): ShoppingListItem[] =>
    state.items[listId] || [],

  getPendingItems: (listId: string): ShoppingListItem[] =>
    (state.items[listId] || []).filter((item) => !item.is_completed),

  getCompletedItems: (listId: string): ShoppingListItem[] =>
    (state.items[listId] || []).filter((item) => item.is_completed),

  getItemsByCategory: (listId: string) => {
    const items = state.items[listId] || [];
    const grouped: Record<string, ShoppingListItem[]> = {};

    items.forEach((item) => {
      const category = item.category || "Uncategorized";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });

    return grouped;
  },

  // Collaborator selectors
  getCollaboratorsByList: (listId: string) => state.collaborators[listId] || [],

  getUserRole: (listId: string, userId: string) => {
    const collaborators = state.collaborators[listId] || [];
    const collaborator = collaborators.find((c) => c.user_id === userId);
    return collaborator?.role || null;
  },

  canUserEdit: (listId: string, userId: string) => {
    const collaborators = state.collaborators[listId] || [];
    const collaborator = collaborators.find((c) => c.user_id === userId);
    const role = collaborator?.role || null;
    return role === "owner" || role === "editor";
  },

  canUserManage: (listId: string, userId: string) => {
    const collaborators = state.collaborators[listId] || [];
    const collaborator = collaborators.find((c) => c.user_id === userId);
    const role = collaborator?.role || null;
    return role === "owner";
  },

  // Stats selectors
  getListStats: (listId: string): ListStats | null =>
    state.listStats[listId] || null,

  getHubStats: (hubId: string) => state.hubStats[hubId] || null,

  // Computed stats
  getQuickStats: (listId: string) => {
    const items = state.items[listId] || [];
    const totalItems = items.length;
    const completedItems = items.filter((item) => item.is_completed).length;
    const pendingItems = totalItems - completedItems;
    const completionPercentage =
      totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

    return {
      totalItems,
      completedItems,
      pendingItems,
      completionPercentage,
    };
  },

  // Loading selectors
  isLoading: (type?: keyof ShoppingState["loading"]) => {
    if (type) {
      return state.loading[type];
    }
    return Object.values(state.loading).some((loading) => loading);
  },

  // Search and filter
  searchItems: (listId: string, query: string): ShoppingListItem[] => {
    const items = state.items[listId] || [];
    if (!query.trim()) return items;

    const searchTerm = query.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.category?.toLowerCase().includes(searchTerm) ||
        item.note?.toLowerCase().includes(searchTerm)
    );
  },

  filterItemsByCategory: (
    listId: string,
    category: string
  ): ShoppingListItem[] => {
    const items = state.items[listId] || [];
    if (!category) return items;

    return items.filter((item) => item.category === category);
  },

  // Recent activity
  getRecentActivity: (listId: string, limit: number = 10) => {
    const items = state.items[listId] || [];
    return items
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
      .slice(0, limit);
  },

  // Categories
  getCategories: (listId: string): string[] => {
    const items = state.items[listId] || [];
    const categories = new Set<string>();

    items.forEach((item) => {
      if (item.category) {
        categories.add(item.category);
      }
    });

    return Array.from(categories).sort();
  },

  // Progress tracking
  getCategoryProgress: (listId: string) => {
    const items = state.items[listId] || [];
    const categoryStats: Record<
      string,
      { total: number; completed: number; percentage: number }
    > = {};

    items.forEach((item) => {
      const category = item.category || "Uncategorized";
      if (!categoryStats[category]) {
        categoryStats[category] = { total: 0, completed: 0, percentage: 0 };
      }

      categoryStats[category].total++;
      if (item.is_completed) {
        categoryStats[category].completed++;
      }
    });

    // Calculate percentages
    Object.keys(categoryStats).forEach((category) => {
      const stats = categoryStats[category];
      stats.percentage =
        stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    });

    return categoryStats;
  },

  // Shopping suggestions based on hub data
  getShoppingSuggestions: (hubId: string) => {
    // Get all items from all lists in the hub
    const hubLists = state.lists.filter((list) => list.hub_id === hubId);
    const allItems: ShoppingListItem[] = [];

    hubLists.forEach((list) => {
      const listItems = state.items[list.id] || [];
      allItems.push(...listItems);
    });

    // Create frequency map of item names
    const itemFrequency: Record<string, { count: number; category?: string; icon?: string }> = {};

    allItems.forEach((item) => {
      const normalizedName = item.name.toLowerCase().trim();
      if (!itemFrequency[normalizedName]) {
        itemFrequency[normalizedName] = {
          count: 0,
          category: item.category,
          icon: getItemIcon(item.name, item.category),
        };
      }
      itemFrequency[normalizedName].count++;
    });

    // Convert to suggestions array and sort by frequency
    const suggestions = Object.entries(itemFrequency)
      .map(([name, data]) => ({
        name: capitalizeWords(name),
        category: data.category || "Other",
        icon: data.icon || "🛒",
        frequency: data.count,
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20); // Limit to top 20 suggestions

    return suggestions;
  },
});

// Helper function to get appropriate icon for items
const getItemIcon = (itemName: string, category?: string): string => {
  const name = itemName.toLowerCase();
  
  // Category-based icons
  if (category) {
    const categoryIcons: Record<string, string> = {
      dairy: "🥛",
      produce: "🥬",
      meat: "🥩",
      bakery: "🍞",
      pantry: "🥫",
      frozen: "🧊",
      household: "🧽",
      "personal care": "🧴",
    };
    
    const categoryIcon = categoryIcons[category.toLowerCase()];
    if (categoryIcon) return categoryIcon;
  }

  // Item-specific icons
  const itemIcons: Record<string, string> = {
    milk: "🥛",
    bread: "🍞",
    eggs: "🥚",
    cheese: "🧀",
    butter: "🧈",
    yogurt: "🥛",
    chicken: "🍗",
    beef: "🥩",
    fish: "🐟",
    salmon: "🐟",
    banana: "🍌",
    bananas: "🍌",
    apple: "🍎",
    apples: "🍎",
    orange: "🍊",
    oranges: "🍊",
    tomato: "🍅",
    tomatoes: "🍅",
    potato: "🥔",
    potatoes: "🥔",
    onion: "🧅",
    onions: "🧅",
    carrot: "🥕",
    carrots: "🥕",
    lettuce: "🥬",
    spinach: "🥬",
    rice: "🍚",
    pasta: "🍝",
    cereal: "🥣",
    coffee: "☕",
    tea: "🍵",
    juice: "🧃",
    water: "💧",
    soap: "🧼",
    shampoo: "🧴",
    toothpaste: "🦷",
    toilet: "🧻",
    paper: "📄",
  };

  // Check for partial matches
  for (const [key, icon] of Object.entries(itemIcons)) {
    if (name.includes(key)) {
      return icon;
    }
  }

  return "🛒"; // Default shopping cart icon
};

// Helper function to capitalize words
const capitalizeWords = (str: string): string => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};