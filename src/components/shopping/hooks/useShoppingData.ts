"use client";

import { useEffect } from "react";
import {
  useShoppingStore,
  useShoppingSelectors,
} from "../../../store/shopping";
import { useHubStore } from "../../../store/hubStore";

export const useShoppingData = () => {
  const { currentHub } = useHubStore();
  const {
    lists,
    currentList,
    loading,
    error,
    fetchLists,
    fetchItems,
    fetchCollaborators,
    fetchListStats,
    setCurrentList,
    subscribeToList,
    unsubscribeFromList,
    clearError,
  } = useShoppingStore();

  const selectors = useShoppingSelectors();

  // Fetch lists when hub changes
  useEffect(() => {
    if (currentHub) {
      fetchLists(currentHub.id);
    }
  }, [currentHub, fetchLists]);

  // Set current list to first list if none selected
  useEffect(() => {
    if (lists.length > 0 && !currentList) {
      setCurrentList(lists[0]);
    }
  }, [lists, currentList, setCurrentList]);

  // Fetch data and subscribe when current list changes
  useEffect(() => {
    if (currentList) {
      // Fetch initial data
      fetchItems(currentList.id);
      fetchCollaborators(currentList.id);
      fetchListStats(currentList.id);

      // Subscribe to real-time updates
      subscribeToList(currentList.id);

      // Cleanup subscription when list changes
      return () => {
        unsubscribeFromList(currentList.id);
      };
    }
  }, [
    currentList,
    fetchItems,
    fetchCollaborators,
    fetchListStats,
    subscribeToList,
    unsubscribeFromList,
  ]);

  // Get current list data
  const currentListItems = currentList
    ? selectors.getItemsByList(currentList.id)
    : [];
  const pendingItems = currentList
    ? selectors.getPendingItems(currentList.id)
    : [];
  const completedItems = currentList
    ? selectors.getCompletedItems(currentList.id)
    : [];
  const collaborators = currentList
    ? selectors.getCollaboratorsByList(currentList.id)
    : [];
  const quickStats = currentList
    ? selectors.getQuickStats(currentList.id)
    : null;

  // Get shopping suggestions for the current hub
  const shoppingSuggestions = currentHub
    ? selectors.getShoppingSuggestions(currentHub.id)
    : [];

  return {
    // Data
    lists,
    currentList,
    currentListItems,
    pendingItems,
    completedItems,
    collaborators,
    quickStats,
    shoppingSuggestions,

    // State
    loading,
    error,

    // Actions
    setCurrentList,
    clearError,

    // Selectors
    selectors,
  };
};
