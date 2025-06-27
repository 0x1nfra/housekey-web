import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, Tag } from 'lucide-react';
import { Task } from '../../store/tasks/types';
import { useHubStore } from '../../store/hubStore';
import { useAuthStore } from '../../store/authStore';
import { shallow } from 'zustand/shallow';

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  task: Task | null;
}

const TaskEditModal: React.FC<TaskEditModalProps> = ({
  isOpen,
  onClose,
  onTaskUpdate,
  task
}) => {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    dueDate: '',
    assignedTo: '',
  });

  const { hubMembers } = useHubStore();
  const { user, profile } = useAuthStore(
    (state) => ({
      user: state.user,
      profile: state.profile,
    }),
    shallow
  );

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setTaskData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        dueDate: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
        assignedTo: task.assigned_to_email || '',
      });
    }
  }, [task]);

  const handleInputChange = (field: string, value: any) => {
    setTaskData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !taskData.title.trim()) return;

    const updates: Partial<Task> = {
      title: taskData.title.trim(),
      description: taskData.description.trim() || undefined,
      priority: taskData.priority,
      due_date: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : undefined,
    };

    // Handle assignment
    if (taskData.assignedTo) {
      if (taskData.assignedTo === profile?.email) {
        updates.assigned_to = user?.id;
      } else {
        // Find the user ID from hub members
        const member = hubMembers.find(m => m.user_profile?.email === taskData.assignedTo);
        updates.assigned_to = member?.user_id;
      }
    } else {
      updates.assigned_to = undefined;
    }

    onTaskUpdate(task.id, updates);
  };

  const priorityOptions = [
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-700' },
    { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700' },
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-700' }
  ];

  // Get available assignees (hub members + current user)
  const availableAssignees = [
    ...(profile ? [{ email: profile.email, name: profile.name }] : []),
    ...hubMembers
      .filter(member => member.user_profile?.email !== profile?.email)
      .map(member => ({
        email: member.user_profile?.email || '',
        name: member.user_profile?.name || 'Unknown User'
      }))
  ].filter(assignee => assignee.email);

  if (!task) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Task</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Task Title */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={taskData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter task title"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Description
                </label>
                <textarea
                  value={taskData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
                  placeholder="Add task details..."
                />
              </div>

              {/* Priority and Due Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Priority
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {priorityOptions.map(priority => (
                      <button
                        key={priority.value}
                        type="button"
                        onClick={() => handleInputChange('priority', priority.value)}
                        className={`p-3 border rounded-lg transition-colors text-center ${
                          taskData.priority === priority.value
                            ? 'border-indigo-300 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center mx-auto mb-1 ${priority.color}`}>
                          <span className="text-xs font-bold">!</span>
                        </div>
                        <span className="text-xs font-medium">{priority.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Due Date
                  </label>
                  <div className="relative">
                    <Calendar
                      size={20}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="date"
                      value={taskData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Assign To */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Assign To
                </label>
                <div className="relative">
                  <Users
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <select
                    value={taskData.assignedTo}
                    onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-10 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  >
                    <option value="">Unassigned</option>
                    {availableAssignees.map(assignee => (
                      <option key={assignee.email} value={assignee.email}>
                        {assignee.name} ({assignee.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!taskData.title.trim()}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Task
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskEditModal;