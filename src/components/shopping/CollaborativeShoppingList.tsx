import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Check,
  X,
  ShoppingCart,
  Users,
  // Clock,
  Edit3,
  Trash2,
  BarChart3,
} from "lucide-react";
import AddItemModal from "./modals/AddItemModal";
import CreateListModal from "./modals/CreateListModal";
import EditListModal from "./modals/EditListModal";
import DeleteListModal from "./modals/DeleteListModal";
import StatsModal from "./modals/StatsModal";
import { useShoppingData } from "./hooks/useShoppingData";
import {
  CreateItemData,
  UpdateItemData,
  useShoppingStore,
} from "../../store/shopping";
import { useAuthStore } from "../../store/authStore";
import { shallow } from "zustand/shallow";
// import dayjs from "dayjs";
import EditItemModal from "./modals/EditItemModal";
import { ShoppingItem } from "../../types/components/shopping";

/*

TODO:
- simplfy color scheme: page, stats, buttons
- update get member avatar/emoji logic
- add categories table
- implement suggestion logic
*/

const CollaborativeShoppingList: React.FC = () => {
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showEditItemModal, setShowEditItemModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Add state for tracking current item being edited
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
    console.log(`user: ${user?.id}`);

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

  // Function to open edit modal with item data
  const openEditModal = (item: ShoppingItem) => {
    setCurrentEditingItem(item);
    setShowEditItemModal(true);
  };

  // Function to close edit modal and reset current item
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
      Dairy: "bg-blue-100 text-blue-700",
      Bakery: "bg-amber-100 text-amber-700",
      Produce: "bg-green-100 text-green-700",
      Meat: "bg-red-100 text-red-700",
      Pantry: "bg-purple-100 text-purple-700",
    };
    return colors[category || ""] || "bg-gray-100 text-gray-700";
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <p className="text-red-700">{error}</p>
          <button
            onClick={clearError}
            className="text-red-500 hover:text-red-700"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* List Selector */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex flex-wrap gap-3">
          {lists.map((list) => (
            <motion.button
              key={list.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCurrentList(list)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentList?.id === list.id
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <ShoppingCart size={16} />
                <span>{list.name}</span>
                {quickStats && currentList?.id === list.id && (
                  <span className="text-xs opacity-75">
                    ({quickStats.pendingItems})
                  </span>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {currentList && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowStatsModal(true)}
              className="bg-white border border-gray-200 text-gray-700 hover:border-gray-300 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <BarChart3 size={16} />
              Stats
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            New List
          </motion.button>
        </div>
      </div>

      {currentList && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Shopping List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* List Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">
                      {currentList.name}
                    </h2>
                    {canUserManage && (
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowEditModal(true)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit list"
                        >
                          <Edit3 size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowDeleteModal(true)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete list"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddItemModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Add Item
                  </motion.button>
                </div>

                {currentList.description && (
                  <p className="text-gray-600 mb-4">
                    {currentList.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>{collaborators.length} collaborators</span>
                  </div>
                  {/* <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>
                      TODO: add 24/12 time format
                      Last Update:{" "}
                      {dayjs(currentList.updated_at).format("h:mm A")}
                    </span>
                  </div> */}
                </div>

                {/* Progress Bar */}
                {quickStats && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-gray-900 font-medium">
                        {quickStats.completedItems} of {quickStats.totalItems}{" "}
                        items
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-emerald-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${quickStats.completionPercentage}%`,
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Pending Items */}
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  To Buy ({pendingItems.length})
                </h3>

                {loading.items ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-6 h-6 bg-gray-200 rounded-full" />
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {pendingItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                        >
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleItemComplete(item.id)}
                            className="w-6 h-6 border-2 border-gray-300 rounded-full hover:border-emerald-500 transition-colors flex items-center justify-center"
                          >
                            <Check
                              size={14}
                              className="text-transparent hover:text-emerald-500"
                            />
                          </motion.button>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="font-medium text-gray-900">
                                {item.name}
                              </span>
                              {item.quantity > 1 && (
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                                  {item.quantity}x
                                </span>
                              )}
                              {item.category && (
                                <span
                                  className={`px-2 py-1 text-xs rounded-full font-medium ${getCategoryColor(
                                    item.category
                                  )}`}
                                >
                                  {item.category}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-500">
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
                              className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                              title="Edit item"
                            >
                              <Edit3 size={16} />
                            </motion.button>
                          )}

                          {(canUserEdit || item.created_by === user?.id) && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleItemDelete(item.id)}
                              className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete item"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {pendingItems.length === 0 && !loading.items && (
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
                    {completedItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 bg-white rounded-lg opacity-75"
                      >
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Check size={14} className="text-white" />
                        </div>

                        <div className="flex-1">
                          <span className="text-gray-600 line-through">
                            {item.name}
                          </span>
                          {item.completed_by && (
                            <span className="text-sm text-gray-500 ml-2">
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
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Mark as incomplete"
                        >
                          <X size={16} />
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

export default CollaborativeShoppingList;
