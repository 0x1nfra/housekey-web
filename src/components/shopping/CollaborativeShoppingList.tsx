import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, X, ShoppingCart, Users, Clock } from 'lucide-react';
import SmartItemInput from './SmartItemInput';

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  addedBy: string;
  completed: boolean;
  completedBy?: string;
  barcode?: string;
  category?: string;
  notes?: string;
}

interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  lastModified: string;
  collaborators: string[];
}

const CollaborativeShoppingList: React.FC = () => {
  const [activeListId, setActiveListId] = useState('1');
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Mock data
  const lists: ShoppingList[] = [
    {
      id: '1',
      name: 'Weekly Groceries',
      lastModified: '2024-01-15T10:30:00Z',
      collaborators: ['Sarah', 'Mike', 'Emma'],
      items: [
        {
          id: '1',
          name: 'Milk',
          quantity: 1,
          addedBy: 'Sarah',
          completed: false,
          category: 'Dairy'
        },
        {
          id: '2',
          name: 'Bread',
          quantity: 2,
          addedBy: 'Mike',
          completed: true,
          completedBy: 'Sarah',
          category: 'Bakery'
        },
        {
          id: '3',
          name: 'Bananas',
          quantity: 6,
          addedBy: 'Emma',
          completed: false,
          category: 'Produce'
        },
        {
          id: '4',
          name: 'Chicken Breast',
          quantity: 2,
          addedBy: 'Sarah',
          completed: false,
          category: 'Meat'
        }
      ]
    },
    {
      id: '2',
      name: 'Hardware Store',
      lastModified: '2024-01-14T15:20:00Z',
      collaborators: ['Sarah', 'Mike'],
      items: [
        {
          id: '5',
          name: 'Light bulbs',
          quantity: 4,
          addedBy: 'Mike',
          completed: false
        },
        {
          id: '6',
          name: 'Screws',
          quantity: 1,
          addedBy: 'Mike',
          completed: false,
          notes: 'Phillips head, 2 inch'
        }
      ]
    }
  ];

  const activeList = lists.find(list => list.id === activeListId);
  const completedItems = activeList?.items.filter(item => item.completed) || [];
  const pendingItems = activeList?.items.filter(item => !item.completed) || [];

  const handleItemComplete = (itemId: string) => {
    console.log('Completing item:', itemId);
    // In real app, this would update the item status
  };

  const handleItemAdd = (itemData: any) => {
    console.log('Adding item:', itemData);
    setIsAddingItem(false);
  };

  const getMemberAvatar = (memberName: string) => {
    const avatars: { [key: string]: string } = {
      'Sarah': '👩‍💼',
      'Mike': '👨‍💻',
      'Emma': '👧'
    };
    return avatars[memberName] || '👤';
  };

  const getCategoryColor = (category?: string) => {
    const colors: { [key: string]: string } = {
      'Dairy': 'bg-blue-100 text-blue-700',
      'Bakery': 'bg-amber-100 text-amber-700',
      'Produce': 'bg-green-100 text-green-700',
      'Meat': 'bg-red-100 text-red-700',
      'Pantry': 'bg-purple-100 text-purple-700'
    };
    return colors[category || ''] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* List Selector */}
      <div className="flex flex-wrap gap-3">
        {lists.map(list => (
          <motion.button
            key={list.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveListId(list.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeListId === list.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart size={16} />
              <span>{list.name}</span>
              <span className="text-xs opacity-75">
                ({list.items.filter(item => !item.completed).length})
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {activeList && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Shopping List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* List Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{activeList.name}</h2>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAddingItem(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Item
                  </motion.button>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>{activeList.collaborators.length} collaborators</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>Updated {new Date(activeList.lastModified).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Progress</span>
                    <span className="text-gray-900 font-medium">
                      {completedItems.length} of {activeList.items.length} items
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-emerald-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${activeList.items.length > 0 ? (completedItems.length / activeList.items.length) * 100 : 0}%` 
                      }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>

              {/* Pending Items */}
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  To Buy ({pendingItems.length})
                </h3>
                
                <div className="space-y-3">
                  {pendingItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleItemComplete(item.id)}
                        className="w-6 h-6 border-2 border-gray-300 rounded-full hover:border-emerald-500 transition-colors flex items-center justify-center"
                      >
                        <Check size={14} className="text-transparent hover:text-emerald-500" />
                      </motion.button>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-medium text-gray-900">{item.name}</span>
                          {item.quantity > 1 && (
                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                              {item.quantity}x
                            </span>
                          )}
                          {item.category && (
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getCategoryColor(item.category)}`}>
                              {item.category}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="text-lg">{getMemberAvatar(item.addedBy)}</span>
                          <span>Added by {item.addedBy}</span>
                          {item.notes && (
                            <>
                              <span>•</span>
                              <span>{item.notes}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {pendingItems.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check size={24} className="text-emerald-600" />
                    </div>
                    <p className="text-gray-500">All items completed! 🎉</p>
                  </div>
                )}
              </div>

              {/* Completed Items */}
              {completedItems.length > 0 && (
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Completed ({completedItems.length})
                  </h3>
                  
                  <div className="space-y-2">
                    {completedItems.map(item => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-white rounded-lg opacity-75">
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Check size={14} className="text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <span className="text-gray-600 line-through">{item.name}</span>
                          {item.completedBy && (
                            <span className="text-sm text-gray-500 ml-2">
                              by {item.completedBy}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Collaborators */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Collaborators</h3>
              <div className="space-y-3">
                {activeList.collaborators.map(collaborator => (
                  <div key={collaborator} className="flex items-center gap-3">
                    <span className="text-2xl">{getMemberAvatar(collaborator)}</span>
                    <div>
                      <p className="font-medium text-gray-900">{collaborator}</p>
                      <p className="text-sm text-gray-500">
                        {activeList.items.filter(item => item.addedBy === collaborator).length} items added
                      </p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full ml-auto" />
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items</span>
                  <span className="font-medium">{activeList.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-medium text-emerald-600">{completedItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining</span>
                  <span className="font-medium text-amber-600">{pendingItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completion</span>
                  <span className="font-medium">
                    {activeList.items.length > 0 ? Math.round((completedItems.length / activeList.items.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Smart Item Input Modal */}
      <SmartItemInput
        isOpen={isAddingItem}
        onClose={() => setIsAddingItem(false)}
        onItemAdd={handleItemAdd}
      />
    </div>
  );
};

export default CollaborativeShoppingList;