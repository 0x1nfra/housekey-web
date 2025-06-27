import { useEffect } from "react";
import { useTasksStore } from "../../../store/tasks";
import { useHubStore } from "../../../store/hubStore";
import {
  selectCurrentTasks,
  selectFilteredTasks,
  selectTaskStats,
  selectTasksByPriority,
  selectTasksByStatus,
  selectOverdueTasks,
  selectTasksDueToday,
  selectIsLoading,
} from "../../../store/tasks/selectors";

export const useTasksData = () => {
  const { currentHub } = useHubStore();
  const {
    loading,
    error,
    filters,
    selectedTasks,
    fetchTasks,
    subscribeToHub,
    unsubscribeFromHub,
    setCurrentHub,
    clearError,
  } = useTasksStore();

  // Fetch tasks when hub changes
  useEffect(() => {
    if (currentHub) {
      setCurrentHub(currentHub.id);
      fetchTasks(currentHub.id);
    }
  }, [currentHub, fetchTasks, setCurrentHub]);

  // Subscribe to real-time updates when current hub changes
  useEffect(() => {
    if (currentHub) {
      subscribeToHub(currentHub.id);

      // Cleanup subscription when hub changes
      return () => {
        unsubscribeFromHub(currentHub.id);
      };
    }
  }, [currentHub, subscribeToHub, unsubscribeFromHub]);

  // Get derived data using selectors
  const currentTasks = useTasksStore(selectCurrentTasks);
  const filteredTasks = useTasksStore(selectFilteredTasks);
  const taskStats = useTasksStore(selectTaskStats);
  const tasksByPriority = useTasksStore(selectTasksByPriority);
  const tasksByStatus = useTasksStore(selectTasksByStatus);
  const overdueTasks = useTasksStore(selectOverdueTasks);
  const tasksDueToday = useTasksStore(selectTasksDueToday);
  const isLoading = useTasksStore(selectIsLoading);

  return {
    // Data
    currentTasks,
    filteredTasks,
    tasksByPriority,
    tasksByStatus,
    overdueTasks,
    tasksDueToday,
    taskStats,

    // State
    loading,
    error,
    filters,
    selectedTasks,
    isLoading,

    // Actions
    clearError,
  };
};
