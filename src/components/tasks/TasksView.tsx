import React, { useState } from "react";
import { useTasksStore } from "../../store/tasks";
import { useHubStore } from "../../store/hub";
import { useAuthStore } from "../../store/auth";
import { useTasksData } from "./hooks/useTasksData";
import { Task, TaskFilters } from "../../store/tasks/types";
import EditTaskModal from "./ui/modal/EditTaskModal";
import TaskStatsModal from "./ui/modal/TaskStatsModal";

import { shallow } from "zustand/shallow";
import NoHubState from "./ui/NoHubState";
import ErrorDisplay from "./ui/ErrorDisplay";
import TaskFiltersComponent from "./ui/TaskFilters";
import BulkActions from "./ui/BulkAction";
import TaskList from "./ui/TaskList";
import { TaskData, TaskPriority } from "../../types/tasks";
import AddTaskModal from "./ui/modal/AddTaskModal";

const TasksView: React.FC = () => {
  const [isCreationFormOpen, setIsCreationFormOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { currentHub } = useHubStore();
  const { user } = useAuthStore(
    (state) => ({
      user: state.user,
      profile: state.profile,
    }),
    shallow
  );

  const {
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    setFilters,
    clearFilters,
    toggleTaskSelection,
    selectAllTasks,
    clearSelection,
    bulkDeleteTasks,
    bulkUpdatePriority,
    filters,
    selectedTasks,
    clearError,
  } = useTasksStore();

  const { filteredTasks, taskStats, overdueTasks, loading, error } =
    useTasksData();

  // Handle task creation
  const handleTaskCreate = async (taskData: TaskData) => {
    if (!currentHub || !user) return;

    try {
      await createTask({
        hub_id: currentHub.id,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        due_date: taskData.dueDate
          ? new Date(taskData.dueDate).toISOString()
          : undefined,
        assigned_to: taskData.assignedTo || undefined,
        completed: false,
        category_id: taskData.category || undefined,
        is_recurring: taskData.recurring || false,
        recurrence_pattern: taskData.recurring
          ? taskData.recurrencePattern
          : undefined,
        recurrence_interval: taskData.recurring
          ? taskData.recurrenceInterval
          : undefined,
      });
      setIsCreationFormOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  // Handle task edit
  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setIsEditModalOpen(true);
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateTask(taskId, updates);
      setIsEditModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // Handle task deletion
  const handleTaskDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  // Handle bulk operations
  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;

    try {
      await bulkDeleteTasks(selectedTasks);
    } catch (error) {
      console.error("Error bulk deleting tasks:", error);
    }
  };

  const handleBulkPriorityUpdate = async (priority: TaskPriority) => {
    if (selectedTasks.length === 0) return;

    try {
      await bulkUpdatePriority(selectedTasks, priority);
    } catch (error) {
      console.error("Error updating task priorities:", error);
    }
  };

  // Handle search
  const handleSearch = (query: string) => {
    setFilters({ search: query || undefined });
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<TaskFilters>) => {
    setFilters(newFilters);
  };

  if (!currentHub) {
    return <NoHubState />;
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      <ErrorDisplay error={error} onClearError={clearError} />

      {/* Header Actions */}
      <TaskFiltersComponent
        searchQuery={filters.search || ""}
        onSearchChange={handleSearch}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onCreateTask={() => setIsCreationFormOpen(true)}
        onShowStats={() => setIsStatsModalOpen(true)}
      />

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedTasks.length}
        onBulkDelete={handleBulkDelete}
        onBulkPriorityUpdate={handleBulkPriorityUpdate}
        onClearSelection={clearSelection}
      />

      {/* Tasks List */}
      <TaskList
        tasks={filteredTasks}
        loading={loading.tasks}
        filters={filters}
        selectedTasks={selectedTasks}
        onToggleComplete={toggleTaskCompletion}
        onEdit={handleTaskEdit}
        onDelete={handleTaskDelete}
        onToggleSelect={toggleTaskSelection}
        onSelectAll={selectAllTasks}
        onClearSelection={clearSelection}
        onCreateTask={() => setIsCreationFormOpen(true)}
      />

      {/* Task Creation Form Modal */}
      <AddTaskModal
        isOpen={isCreationFormOpen}
        onClose={() => setIsCreationFormOpen(false)}
        onTaskCreate={handleTaskCreate}
      />

      {/* Task Edit Modal */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
        onTaskUpdate={handleTaskUpdate}
        task={editingTask}
      />

      {/* Task Stats Modal */}
      <TaskStatsModal
        isOpen={isStatsModalOpen}
        onClose={() => setIsStatsModalOpen(false)}
        taskStats={taskStats}
        overdueCount={overdueTasks.length}
      />
    </div>
  );
};

export default TasksView;
