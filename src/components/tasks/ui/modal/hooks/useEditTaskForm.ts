import { useState, useEffect } from 'react';
import { TaskData, TaskPriority } from '../../../../../types/tasks';
import { Task } from '../../../../../store/tasks/types';

export const useEditTaskForm = (isOpen: boolean, task: Task | null) => {
  const [taskData, setTaskData] = useState<TaskData>({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    priority: TaskPriority.MEDIUM,
    category: "",
    recurring: false,
    recurrencePattern: "weekly",
    recurrenceInterval: 1,
    notes: "",
  });

  // Initialize form data when task changes
  useEffect(() => {
    if (isOpen && task) {
      setTaskData({
        title: task.title,
        description: task.description || "",
        assignedTo: task.assigned_to || "",
        dueDate: task.due_date
          ? new Date(task.due_date).toISOString().split("T")[0]
          : "",
        priority: task.priority,
        category: task.category_id || "",
        recurring: task.is_recurring || false,
        recurrencePattern: task.recurrence_pattern || "weekly",
        recurrenceInterval: task.recurrence_interval || 1,
        notes: "", // This would need to be added to the task schema if needed
      });
    }
  }, [isOpen, task]);

  const handleInputChange = (field: keyof TaskData, value: any) => {
    setTaskData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    if (task) {
      setTaskData({
        title: task.title,
        description: task.description || "",
        assignedTo: task.assigned_to || "",
        dueDate: task.due_date
          ? new Date(task.due_date).toISOString().split("T")[0]
          : "",
        priority: task.priority,
        category: task.category_id || "",
        recurring: task.is_recurring || false,
        recurrencePattern: task.recurrence_pattern || "weekly",
        recurrenceInterval: task.recurrence_interval || 1,
        notes: "",
      });
    }
  };

  return {
    taskData,
    handleInputChange,
    resetForm,
  };
};
