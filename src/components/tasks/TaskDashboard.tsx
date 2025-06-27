import React, { useState } from "react";
import { useTasksStore } from "../../store/tasks";
import { useHubStore } from "../../store/hubStore";
import { useAuthStore } from "../../store/authStore";
import { useTasksData } from "./hooks/useTasksData";
import { Task, TaskFilters } from "../../store/tasks/types";
import TaskCreationForm from "./ui/modal/AddTaskModal";
import TaskEditModal from "./ui/modal/EditTaskModal";

import { shallow } from "zustand/shallow";
import NoHubState from "./ui/NoHubState";
import ErrorDisplay from "./ui/ErrorDisplay";
import TaskFiltersComponent from "./ui/TaskFilters";
import BulkActions from "./ui/BulkAction";
import TaskStats from "./ui/TaskStats";
import TaskList from "./ui/TaskList";
import { TaskData, TaskPriority } from "../../types/tasks";

const TaskDashboard: React.FC = () => {
  const [isCreationFormOpen, setIsCreationFormOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { currentHub } = useHubStore();
  const { user, profile } = useAuthStore(
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
        assigned_to:
          taskData.assignedTo === profile?.email ? user.id : undefined,
        completed: false,
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
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  // Handle bulk operations
  const handleBulkDelete = async () => {
    if (selectedTasks.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedTasks.length} selected tasks?`
      )
    ) {
      try {
        await bulkDeleteTasks(selectedTasks);
      } catch (error) {
        console.error("Error bulk deleting tasks:", error);
      }
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
    setSearchQuery(query);
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
        searchQuery={searchQuery}
        onSearchChange={handleSearch}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onCreateTask={() => setIsCreationFormOpen(true)}
      />

      {/* Bulk Actions */}
      <BulkActions
        selectedCount={selectedTasks.length}
        onBulkDelete={handleBulkDelete}
        onBulkPriorityUpdate={handleBulkPriorityUpdate}
        onClearSelection={clearSelection}
      />

      {/* Task Stats */}
      <TaskStats taskStats={taskStats} overdueCount={overdueTasks.length} />

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
      <TaskCreationForm
        isOpen={isCreationFormOpen}
        onClose={() => setIsCreationFormOpen(false)}
        onTaskCreate={handleTaskCreate}
      />

      {/* Task Edit Modal */}
      <TaskEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
        }}
        onTaskUpdate={handleTaskUpdate}
        task={editingTask}
      />
    </div>
  );
};

export default TaskDashboard;
