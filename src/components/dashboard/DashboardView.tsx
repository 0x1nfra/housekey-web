"use client";

import type React from "react";

import QuickActions from "./ui/QuickActions";
import ActivityFeed from "./ui/ActivityFeed";
import Stats from "./ui/Stats";
import Activity from "./ui/Activity";

interface Event {
  id: string;
  title: string;
  time: string;
  assignedTo: string;
  type: "appointment" | "activity" | "reminder";
}

interface Task {
  id: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
}

interface Member {
  id: string;
  name: string;
  role: "parent" | "child" | "roommate";
  avatar: string;
  lastActive: string;
}

const DashboardView: React.FC = () => {
  const todayEvents: Event[] = [
    {
      id: "1",
      title: "Soccer Practice",
      time: "2024-01-15T16:00:00Z",
      assignedTo: "Emma",
      type: "activity",
    },
    {
      id: "2",
      title: "Dentist Appointment",
      time: "2024-01-15T14:30:00Z",
      assignedTo: "Mom",
      type: "appointment",
    },
  ];

  const pendingTasks: Task[] = [
    {
      id: "1",
      title: "Take out trash",
      assignedTo: "Dad",
      dueDate: "2024-01-15",
      priority: "high",
    },
    {
      id: "2",
      title: "Feed the cat",
      assignedTo: "Emma",
      dueDate: "2024-01-15",
      priority: "medium",
    },
  ];

  const householdMembers: Member[] = [
    {
      id: "1",
      name: "Sarah",
      role: "parent",
      avatar: "👩‍💼",
      lastActive: "2024-01-15T08:00:00Z",
    },
    {
      id: "2",
      name: "Mike",
      role: "parent",
      avatar: "👨‍💻",
      lastActive: "2024-01-15T07:30:00Z",
    },
    {
      id: "3",
      name: "Emma",
      role: "child",
      avatar: "👧",
      lastActive: "2024-01-15T07:45:00Z",
    },
  ];

  return (
    <div className="space-y-8">
      <Stats
        eventsCount={todayEvents.length}
        tasksCount={pendingTasks.length}
        membersCount={householdMembers.length}
        completionRate="87%"
      />

      <Activity events={todayEvents} tasks={pendingTasks} />
      <QuickActions />
      <ActivityFeed />
    </div>
  );
};

export default DashboardView;
