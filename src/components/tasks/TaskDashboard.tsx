import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Filter, CheckCircle, Clock, AlertCircle } from "lucide-react";
import ChoreCreationForm from "./ChoreCreationForm";

interface Task {
  id: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed";
  recurring: boolean;
  category: string;
}

/*
FIXME:
1. change to dayjs
2. move types to type folders
*/

const TaskDashboard: React.FC = () => {
  const [isCreationFormOpen, setIsCreationFormOpen] = useState(false);
  type Filter = "all" | "my-tasks" | "pending" | "in-progress" | "completed";
  type Sort = "dueDate" | "priority" | "title";

  const [filterBy, setFilterBy] = useState<Filter>("all");
  const [sortBy, setSortBy] = useState<Sort>("dueDate");

  // Mock data
  const tasks: Task[] = [
    {
      id: "1",
      title: "Take out trash",
      assignedTo: "Mike",
      dueDate: "2024-01-15",
      priority: "high",
      status: "pending",
      recurring: true,
      category: "Cleaning",
    },
    {
      id: "2",
      title: "Feed the cat",
      assignedTo: "Emma",
      dueDate: "2024-01-15",
      priority: "medium",
      status: "completed",
      recurring: true,
      category: "Pet Care",
    },
    {
      id: "3",
      title: "Grocery shopping",
      assignedTo: "Sarah",
      dueDate: "2024-01-16",
      priority: "medium",
      status: "in-progress",
      recurring: false,
      category: "Shopping",
    },
    {
      id: "4",
      title: "Clean bathroom",
      assignedTo: "Mike",
      dueDate: "2024-01-17",
      priority: "low",
      status: "pending",
      recurring: true,
      category: "Cleaning",
    },
  ];

  const familyMembers = [
    { name: "Sarah", avatar: "👩‍💼", color: "bg-indigo-100 text-indigo-700" },
    { name: "Mike", avatar: "👨‍💻", color: "bg-emerald-100 text-emerald-700" },
    { name: "Emma", avatar: "👧", color: "bg-amber-100 text-amber-700" },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return CheckCircle;
      case "in-progress":
        return Clock;
      case "pending":
        return AlertCircle;
      default:
        return AlertCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-emerald-600 bg-emerald-50";
      case "in-progress":
        return "text-amber-600 bg-amber-50";
      case "pending":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "medium":
        return "border-l-amber-500";
      case "low":
        return "border-l-green-500";
      default:
        return "border-l-gray-500";
    }
  };

  const getMemberColor = (memberName: string) => {
    const member = familyMembers.find((m) => m.name === memberName);
    return member?.color || "bg-gray-100 text-gray-700";
  };

  const getMemberAvatar = (memberName: string) => {
    const member = familyMembers.find((m) => m.name === memberName);
    return member?.avatar || "👤";
  };

  const filteredTasks = tasks.filter((task) => {
    if (filterBy === "all") return true;
    if (filterBy === "my-tasks") return task.assignedTo === "Sarah"; // Current user
    return task.status === filterBy;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "dueDate") {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (sortBy === "priority") {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return a.title.localeCompare(b.title);
  });

  const handleTaskComplete = (taskId: string) => {
    // In real app, this would update the task status
    console.log("Completing task:", taskId);
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex items-center gap-4">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Tasks</option>
            <option value="my-tasks">My Tasks</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="title">Sort by Title</option>
          </select>
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

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Tasks",
            value: tasks.length,
            color: "bg-blue-100 text-blue-700",
          },
          {
            label: "Pending",
            value: tasks.filter((t) => t.status === "pending").length,
            color: "bg-red-100 text-red-700",
          },
          {
            label: "In Progress",
            value: tasks.filter((t) => t.status === "in-progress").length,
            color: "bg-amber-100 text-amber-700",
          },
          {
            label: "Completed",
            value: tasks.filter((t) => t.status === "completed").length,
            color: "bg-emerald-100 text-emerald-700",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4"
          >
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}
            >
              <span className="text-xl font-bold">{stat.value}</span>
            </div>
            <p className="text-sm font-medium text-gray-900">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Tasks ({sortedTasks.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-100">
          {sortedTasks.map((task, index) => {
            const StatusIcon = getStatusIcon(task.status);

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-6 hover:bg-gray-50 transition-colors border-l-4 ${getPriorityColor(
                  task.priority
                )}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${getStatusColor(
                        task.status
                      )}`}
                    >
                      <StatusIcon size={20} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium text-gray-900">
                          {task.title}
                        </h4>
                        {task.recurring && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                            Recurring
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{task.category}</span>
                        <span>•</span>
                        <span className="capitalize">
                          {task.priority} priority
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {getMemberAvatar(task.assignedTo)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getMemberColor(
                          task.assignedTo
                        )}`}
                      >
                        {task.assignedTo}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {task.status !== "completed" && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleTaskComplete(task.id)}
                        className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                      >
                        Mark Complete
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {sortedTasks.length === 0 && (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500">
              No tasks found matching your filters
            </p>
          </div>
        )}
      </div>

      {/* Task Creation Form Modal */}
      <ChoreCreationForm
        isOpen={isCreationFormOpen}
        onClose={() => setIsCreationFormOpen(false)}
        onTaskCreate={(taskData) => {
          console.log("Creating task:", taskData);
          setIsCreationFormOpen(false);
        }}
      />
    </div>
  );
};

export default TaskDashboard;
