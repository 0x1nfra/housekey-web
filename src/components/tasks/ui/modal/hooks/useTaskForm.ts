import { useState, useEffect } from 'react';
import { TaskData, TaskPriority } from '../../../../../types/tasks';
import { useAuthStore } from '../../../../../store/auth';
import { shallow } from 'zustand/shallow';

const INITIAL_TASK_DATA: TaskData = {
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
};

export const useTaskForm = (isOpen: boolean) => {
  const { profile } = useAuthStore(
    (state) => ({ profile: state.profile }),
    shallow
  );

  const [taskData, setTaskData] = useState<TaskData>(INITIAL_TASK_DATA);

  // Set default assignee when modal opens
  useEffect(() => {
    if (isOpen && profile?.id) {
      setTaskData((prev) => ({
        ...prev,
        assignedTo: profile.id,
      }));
    }
  }, [isOpen, profile?.id]);

  const handleInputChange = (field: keyof TaskData, value: any) => {
    setTaskData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setTaskData({
      ...INITIAL_TASK_DATA,
      assignedTo: profile?.id || "",
    });
  };

  return {
    taskData,
    handleInputChange,
    resetForm,
  };
};
