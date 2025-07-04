"use client";

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Check,
  X,
  Users,
  Edit3,
  Trash2,
  BarChart3,
  List,
} from "lucide-react";
import AddItemModal from "./modals/AddItemModal";
import CreateListModal from "./modals/CreateListModal";
import EditListModal from "./modals/EditListModal";
import DeleteListModal from "./modals/DeleteListModal";
import StatsModal from "./modals/StatsModal";
import { useShoppingData } from "./hooks/useShoppingData";
import {
  type CreateItemData,
  type UpdateItemData,
  useShoppingStore,
} from "../../store/shopping";
import { useAuthStore } from "../../store/authStore";
import { shallow } from "zustand/shallow";
import EditItemModal from "./modals/EditItemModal";

interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  category?: string;
  note?: string;
  created_by: string;
  completed_by?: string;
}

const ShoppingView: React.FC = () => {
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [currentEditingItem, setCurrentEditingItem] =
    useState<ShoppingItem | null>(null);

  const { user, profile } = useAuthStore(
    (state) => ({
      user: state.user,
      profile: state.profile,
    }),
    shallow
  );
  const { toggleItemComplete, createItem, updateItem, deleteItem } =
    useShoppingStore();

  const {
    lists,
    currentList,
    pendingItems,
    completedItems,
    collaborators,
    quickStats,
    loading,
    error,
    setCurrentList,
    clearError,
    selectors,
  } = useShoppingData();

  const handleItemComplete = async (itemId: string) => {
    try {
      await toggleItemComplete(itemId);
    } catch (error) {
      console.error("Error toggling item:", error);
    }
  };

  const handleItemAdd = async (itemData: CreateItemData) => {
    if (!currentList) return;
    try {
      await createItem(currentList.id, itemData);
      setShowAddItemModal(false);
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleEditItem = async (itemId: string, itemData: UpdateItemData) => {
    try {
      await updateItem(itemId, itemData);
      setShowEditItemModal(false);
      setCurrentEditingItem(null);
    } catch (error) {
      console.error("Error editing item:", error);
    }
  };

  const handleItemDelete = async (itemId: string) => {
    try {
      await deleteItem(itemId);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const openEditModal = (item: ShoppingItem) => {
    setCurrentEditingItem(item);
    setShowEditItemModal(true);
  };

  const closeEditModal = () => {
    setShowEditItemModal(false);
    setCurrentEditingItem(null);
  };

  const getMemberAvatar = (memberName: string) => {
    const avatars: { [key: string]: string } = {
      Sarah: "👩‍💼",
      Mike: "👨‍💻",
      Emma: "👧",
    };
    return avatars[memberName] || "👤";
  };

  const getCategoryColor = (category?: string) => {
    const colors: { [key: string]: string } = {
      Dairy: "bg-blue-50 text-blue-700 border-blue-200",
      Bakery: "bg-amber-50 text-amber-700 border-amber-200",
      Produce: "bg-green-50 text-green-700 border-green-200",
      Meat: "bg-red-50 text-red-700 border-red-200",
      Pantry: "bg-purple-50 text-purple-700 border-purple-200",
    };
    return (
      colors[category || ""] || "bg-gray-50 text-charcoal-muted border-gray-200"
    );
  };

  const canUserEdit =
    currentList && user
      ? selectors.canUserEdit(currentList.id, user.id)
      : false;
  const canUserManage =
    currentList && user
      ? selectors.canUserManage(currentList.id, user.id)
      : false;

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4"
      >
        <div className="flex items-center justify-between">
          <p className="text-red-700 font-content">{error}</p>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700 transition-colors duration-300"
          >
            <X size={20} />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* List Selector */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {lists.map((list) => (
            <motion.button
              key={list.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentList(list)}
              className={`px-3 py-2 rounded-lg font-medium font-interface transition-all duration-300 ${
                currentList?.id === list.id
                  ? "bg-sage-green text-deep-charcoal shadow-md"
                  : "bg-warm-off-white border border-gray-200 text-deep-charcoal hover:border-sage-green hover:bg-sage-green-light"
              }`}
            >
              <div className="flex items-center gap-2">
                <List size={16} />
                <span>{list.name}</span>
                {quickStats && currentList?.id === list.id && (
                  <span className="text-xs opacity-75 bg-deep-charcoal text-warm-off-white px-2 py-1 rounded-full">
                    {quickStats.pendingItems}
                  </span>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {currentList && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowStatsModal(true)}
              className="btn btn-ghost btn-sm"
            >
              <BarChart3 size={16} />
              Stats
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} />
            New List
          </motion.button>
        </div>
      </div>

      {currentList && (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Main Shopping List */}
          <div className="lg:col-span-2">
            <div className="card">
              {/* List Header */}
              <div className="card-header">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-deep-charcoal font-interface">
                      {currentList.name}
                    </h2>
                    {canUserManage && (
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowEditModal(true)}
                          className="p-1 text-charcoal-muted hover:text-deep-charcoal hover:bg-sage-green-light rounded-lg transition-all duration-300"
                          title="Edit list"
                        >
                          <Edit3 size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowDeleteModal(true)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-300"
                          title="Delete list"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddItemModal(true)}
                    className="btn btn-primary btn-sm"
                  >
                    <Plus size={16} />
                    Add Item
                  </motion.button>
                </div>

                {currentList.description && (
                  <p className="text-sm text-charcoal-muted mb-4 font-content leading-relaxed">
                    {currentList.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-charcoal-muted font-interface mb-4">
                  <div className="flex items-center gap-2">
                    <Users size={14} />
                    <span>{collaborators.length} collaborators</span>
                  </div>
                </div>

                {/* Progress Bar */}
                {quickStats && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2 font-interface">
                      <span className="text-charcoal-muted">Progress</span>
                      <span className="text-deep-charcoal font-medium">
                        {quickStats.completedItems} of {quickStats.totalItems}{" "}
                        items
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-sage-green h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${quickStats.completionPercentage}%`,
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Pending Items */}
              <div className="card-content">
                <h3 className="font-semibold text-deep-charcoal mb-4 font-interface text-lg">
                  To Buy ({pendingItems.length})
                </h3>

                {loading.items ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                          <div className="w-5 h-5 bg-gray-200 rounded-full" />
                          <div className="flex-1">
                            <div className="h-3 bg-gray-200 rounded w-1/3 mb-1" />
                            <div className="h-2 bg-gray-200 rounded w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <AnimatePresence>
                      {pendingItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                          className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 group"
                        >
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleItemComplete(item.id)}
                            className="w-6 h-6 border-2 border-gray-300 rounded-full hover:border-sage-green transition-all duration-300 flex items-center justify-center group-hover:border-sage-green"
                          >
                            <Check
                              size={14}
                              className="text-transparent group-hover:text-sage-green transition-colors duration-300"
                            />
                          </motion.button>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-deep-charcoal font-interface">
                                {item.name}
                              </span>
                              {item.quantity > 1 && (
                                <span className="px-2 py-1 bg-sage-green-light text-deep-charcoal text-xs rounded-full font-medium font-interface">
                                  {item.quantity}x
                                </span>
                              )}
                              {item.category && (
                                <span
                                  className={`px-2 py-1 text-xs rounded-full font-medium font-interface border ${getCategoryColor(
                                    item.category
                                  )}`}
                                >
                                  {item.category}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 text-xs text-charcoal-muted font-content">
                              <span className="text-lg">
                                {getMemberAvatar("User")}
                              </span>
                              <span>
                                <span className="font-semibold">
                                  {profile?.name}
                                </span>
                              </span>
                              {item.note && (
                                <>
                                  <span>•</span>
                                  <span>{item.note}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {(canUserEdit || item.created_by === user?.id) && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openEditModal(item)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-charcoal-muted hover:text-deep-charcoal hover:bg-sage-green-light rounded-lg transition-all duration-300"
                              title="Edit item"
                            >
                              <Edit3 size={14} />
                            </motion.button>
                          )}

                          {(canUserEdit || item.created_by === user?.id) && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleItemDelete(item.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300"
                              title="Delete item"
                            >
                              <Trash2 size={14} />
                            </motion.button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {pendingItems.length === 0 && !loading.items && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-sage-green-light rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check size={28} className="text-sage-green" />
                    </div>
                    <p className="text-charcoal-muted font-content text-lg">
                      All items completed! 🎉
                    </p>
                  </div>
                )}
              </div>

              {/* Completed Items */}
              {completedItems.length > 0 && (
                <div className="card-footer">
                  <h3 className="font-semibold text-deep-charcoal mb-4 font-interface text-lg">
                    Completed ({completedItems.length})
                  </h3>

                  <div className="space-y-2">
                    {completedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-warm-off-white rounded-lg opacity-75 hover:opacity-100 transition-opacity duration-300"
                      >
                        <div className="w-6 h-6 bg-sage-green rounded-full flex items-center justify-center">
                          <Check size={14} className="text-deep-charcoal" />
                        </div>

                        <div className="flex-1">
                          <span className="text-charcoal-muted line-through font-interface">
                            {item.name}
                          </span>
                          {item.completed_by && (
                            <span className="text-xs text-charcoal-muted ml-1 font-content">
                              by{" "}
                              <span className="font-semibold">
                                {profile?.name}
                              </span>
                            </span>
                          )}
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleItemComplete(item.id)}
                          className="p-1 text-charcoal-muted hover:text-deep-charcoal hover:bg-sage-green-light rounded-lg transition-all duration-300"
                          title="Mark as incomplete"
                        >
                          <X size={14} />
                        </motion.button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddItemModal
        isOpen={showAddItemModal}
        onClose={() => setShowAddItemModal(false)}
        onItemAdd={handleItemAdd}
      />

      <EditItemModal
        isOpen={showEditItemModal}
        onClose={closeEditModal}
        onItemEdit={handleEditItem}
        itemId={currentEditingItem?.id || ""}
        initialData={
          currentEditingItem
            ? {
                name: currentEditingItem.name,
                quantity: currentEditingItem.quantity,
                category: currentEditingItem.category || "",
                note: currentEditingItem.note || "",
              }
            : undefined
        }
      />

      <CreateListModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      <EditListModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        list={currentList}
      />

      <DeleteListModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        list={currentList}
      />

      <StatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        list={currentList}
        collaborators={collaborators}
        quickStats={quickStats}
      />
    </div>
  );
};

export default ShoppingView;
