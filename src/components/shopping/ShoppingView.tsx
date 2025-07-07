"use client";

import type React from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import AddItemModal from "./modals/AddItemModal";
import CreateListModal from "./modals/CreateListModal";
import EditListModal from "./modals/EditListModal";
import DeleteListModal from "./modals/DeleteListModal";
import EditItemModal from "./modals/EditItemModal";
import QuickStatsModal from "./modals/QuickStatsModal";
import ShoppingListSelector from "./ShoppingListSelector";
import ShoppingListHeader from "./ShoppingListHeader";
import ShoppingPendingItems from "./ShoppingPendingItems";
import ShoppingCompletedItems from "./ShoppingCompletedItems";
import ShoppingQuickStats from "./ShoppingQuickStats";
import { useShoppingData } from "./hooks/useShoppingData";
import {
  type CreateItemData,
  type UpdateItemData,
  useShoppingStore,
} from "../../store/shopping";
import { type ShoppingItem } from "../../types/shopping";

const ShoppingView: React.FC = () => {
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [currentEditingItem, setCurrentEditingItem] =
    useState<ShoppingItem | null>(null);

  const { toggleItemComplete, createItem, updateItem, deleteItem } =
    useShoppingStore();

  const {
    lists,
    currentList,
    pendingItems,
    completedItems,
    quickStats,
    loading,
    error,
    setCurrentList,
    clearError,
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
      <ShoppingListSelector
        lists={lists}
        currentList={currentList}
        setCurrentList={setCurrentList}
        quickStats={quickStats}
        setShowCreateModal={setShowCreateModal}
        setShowStatsModal={setShowStatsModal}
      />

      {currentList && (
        <div className="w-full">
          <div className="lg:col-span-2">
            <div className="card rounded-xl">
              <ShoppingListHeader
                currentList={currentList}
                setShowAddItemModal={setShowAddItemModal}
                setShowEditModal={setShowEditModal}
                setShowDeleteModal={setShowDeleteModal}
              />

              <ShoppingPendingItems
                pendingItems={pendingItems}
                loading={loading.items}
                handleItemComplete={handleItemComplete}
                handleItemDelete={handleItemDelete}
                openEditModal={openEditModal}
              />

              {completedItems.length > 0 && (
                <ShoppingCompletedItems
                  completedItems={completedItems}
                  handleItemComplete={handleItemComplete}
                />
              )}
            </div>
          </div>
        </div>
      )}

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

      <QuickStatsModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        quickStats={quickStats}
      />
    </div>
  );
};

export default ShoppingView;
