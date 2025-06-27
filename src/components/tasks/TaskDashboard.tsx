import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Search,
  Calendar,
  User,
  Trash2,
  Edit3,
  MoreHorizontal,
  X
} from "lucide-react";
import { useTasksStore } from "../../store/tasks";
import { useHubStore } from "../../store/hubStore";
import { useAuthStore } from "../../store/authStore";
import { useTasksData } from "./hooks/useTasksData";
import { Task, TaskFilters, TaskPriority, getPriorityLabel, getPriorityColor, getPriorityBorderColor } from "../../store/tasks/types";
import ChoreCreationForm from "./ChoreCreationForm";
import TaskEditModal from "./TaskEditModal";
import { shallow } from "zustand/shallow";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleSelect: (id: string) => void;
  isSelected: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onToggleSelect,
  isSelected
}) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusIcon = (completed: boolean) => {
    return completed ? CheckCircle : Clock;
  };

  const getStatusColor = (completed: boolean) => {
    return completed 
      ? "text-emerald-600 bg-emerald-50" 
      : "text-amber-600 bg-amber-50";
  };

  const isOverdue = task.due_date && !task.completed && new Date(task.due_date) < new Date();
  const StatusIcon = getStatusIcon(task.completed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-4 border-l-4 rounded-lg transition-all hover:shadow-md ${getPriorityBorderColor(task.priority)} ${
        isSelected ? "ring-2 ring-indigo-500" : ""
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          {/* Selection Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(task.id)}
            className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />

          {/* Status Icon */}
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusColor(task.completed)}`}>
            <StatusIcon size={16} />
          </div>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h4 className={`font-medium ${task.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                {task.title}
              </h4>
              
              {/* Priority Badge */}
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                {getPriorityLabel(task.priority)}
              </span>

              {/* Overdue Badge */}
              {isOverdue && (
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                  Overdue
                </span>
              )}
            </div>

            {/* Description */}
            {task.description && (
              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
            )}

            {/* Task Meta */}
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {task.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>{dayjs(task.due_date).format("MMM DD, YYYY")}</span>
                </div>
              )}
              
              {task.assigned_to_email && (
                <div className="flex items-center gap-1">
                  <User size={14} />
                  <span>{task.assigned_to_email}</span>
                </div>
              )}

              <span>Created {dayjs(task.created_at).fromNow()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onToggleComplete(task.id)}
                className={`p-2 rounded-lg transition-colors ${
                  task.completed 
                    ? "bg-amber-100 text-amber-600 hover:bg-amber-200" 
                    : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                }`}
                title={task.completed ? "Mark as incomplete" : "Mark as complete"}
              >
                <CheckCircle size={16} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit(task)}
                className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                title="Edit task"
              >
                <Edit3 size={16} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(task.id)}
                className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                title="Delete task"
              >
                <Trash2 size={16} />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

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
    clearError
  } = useTasksStore();

  const {
    filteredTasks,
    taskStats,
    tasksByPriority,
    tasksByStatus,
    overdueTasks,
    tasksDueToday,
    loading,
    error,
    isLoading
  } = useTasksData();

  // Handle task creation
  const handleTaskCreate = async (taskData: any) => {
    if (!currentHub || !user) return;

    try {
      await createTask({
        hub_id: currentHub.id,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        due_date: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : undefined,
        assigned_to: taskData.assignedTo === profile?.email ? user.id : undefined,
        completed: false
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
    
    if (window.confirm(`Are you sure you want to delete ${selectedTasks.length} selected tasks?`)) {
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
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={24} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Hub Selected</h3>
        <p className="text-gray-500">Please select a hub to view and manage tasks</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Search tasks..."
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filters.completed?.toString() || ""}
              onChange={(e) => handleFilterChange({ 
                completed: e.target.value === "" ? undefined : e.target.value === "true" 
              })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Tasks</option>
              <option value="false">Pending</option>
              <option value="true">Completed</option>
            </select>

            <select
              value={filters.priority?.toString() || ""}
              onChange={(e) => handleFilterChange({ 
                priority: e.target.value ? Number(e.target.value) as TaskPriority : undefined 
              })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Priorities</option>
              <option value={TaskPriority.URGENT}>Urgent Priority</option>
              <option value={TaskPriority.HIGH}>High Priority</option>
              <option value={TaskPriority.MEDIUM}>Medium Priority</option>
              <option value={TaskPriority.LOW}>Low Priority</option>
            </select>

            {(filters.completed !== undefined || filters.priority || filters.search) && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear Filters
              </motion.button>
            )}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCreationFormOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Create Task
        </motion.button>
      </div>

      {/* Bulk Actions */}
      {selectedTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-50 border border-indigo-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-indigo-900">
                {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleBulkPriorityUpdate(TaskPriority.URGENT)}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                >
                  Urgent
                </button>
                <button
                  onClick={() => handleBulkPriorityUpdate(TaskPriority.HIGH)}
                  className="px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded-full hover:bg-orange-200 transition-colors"
                >
                  High
                </button>
                <button
                  onClick={() => handleBulkPriorityUpdate(TaskPriority.MEDIUM)}
                  className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
                >
                  Medium
                </button>
                <button
                  onClick={() => handleBulkPriorityUpdate(TaskPriority.LOW)}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                >
                  Low
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
              >
                <Trash2 size={14} />
                Delete
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Tasks",
            value: taskStats.total,
            color: "bg-blue-100 text-blue-700",
            icon: CheckCircle,
          },
          {
            label: "Pending",
            value: taskStats.pending,
            color: "bg-amber-100 text-amber-700",
            icon: Clock,
          },
          {
            label: "Completed",
            value: taskStats.completed,
            color: "bg-emerald-100 text-emerald-700",
            icon: CheckCircle,
          },
          {
            label: "Overdue",
            value: overdueTasks.length,
            color: "bg-red-100 text-red-700",
            icon: AlertCircle,
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Tasks ({filteredTasks.length})
            </h3>
            
            {filteredTasks.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={selectAllTasks}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Select All
                </button>
                {selectedTasks.length > 0 && (
                  <button
                    onClick={clearSelection}
                    className="text-sm text-gray-600 hover:text-gray-700"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {loading.tasks ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-4 h-4 bg-gray-200 rounded" />
                    <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggleComplete={toggleTaskCompletion}
                    onEdit={handleTaskEdit}
                    onDelete={handleTaskDelete}
                    onToggleSelect={toggleTaskSelection}
                    isSelected={selectedTasks.includes(task.id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filters.completed !== undefined || filters.priority || filters.search
                  ? "No tasks match your filters"
                  : "No tasks yet"}
              </h3>
              <p className="text-gray-500 mb-4">
                {filters.completed !== undefined || filters.priority || filters.search
                  ? "Try adjusting your filters to see more tasks"
                  : "Create your first task to get started"}
              </p>
              {!(filters.completed !== undefined || filters.priority || filters.search) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCreationFormOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Create Your First Task
                </motion.button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Task Creation Form Modal */}
      <ChoreCreationForm
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