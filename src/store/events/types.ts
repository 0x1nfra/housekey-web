import { RealtimeChannel } from "@supabase/supabase-js";

export type EventType = 'PERSONAL' | 'FAMILY' | 'WORK' | 'APPOINTMENT' | 'SOCIAL' | 'OTHER';
export type CalendarDataType = 'all' | 'events' | 'tasks';

export const EVENT_TYPES = {
  PERSONAL: { label: 'Personal', color: '#3B82F6' },      // Blue
  FAMILY: { label: 'Family', color: '#10B981' },         // Green
  WORK: { label: 'Work', color: '#F59E0B' },             // Amber
  APPOINTMENT: { label: 'Appointment', color: '#EF4444' }, // Red
  SOCIAL: { label: 'Social', color: '#8B5CF6' },         // Purple
  OTHER: { label: 'Other', color: '#6B7280' }            // Gray
} as const;

export interface Event {
  id: string;
  hub_id: string;
  title: string;
  description?: string;
  start_date: string; // ISO timestamp
  end_date?: string; // ISO timestamp
  location?: string;
  attendees: string[]; // Array of user_profile IDs
  event_type: EventType;
  created_by: string;
  created_at: string;
  updated_at: string;
  all_day: boolean;
  // Joined data from RPC
  creator_name?: string;
  creator_email?: string;
  attendee_details?: Array<{
    id: string;
    name: string;
    email: string;
  }>;
}

export interface EventReminder {
  id: string;
  event_id: string;
  user_id: string;
  reminder_time: string; // ISO timestamp
  reminder_type: 'email' | 'push' | 'in_app';
  sent: boolean;
  created_at: string;
}

export interface CreateEventPayload {
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  attendees?: string[];
  all_day?: boolean;
  event_type?: EventType;
  reminders?: Array<{
    user_id: string;
    reminder_time: string;
    reminder_type: 'email' | 'push' | 'in_app';
  }>;
}

export interface UpdateEventPayload {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  attendees?: string[];
  all_day?: boolean;
  event_type?: EventType;
  reminders?: Array<{
    user_id: string;
    reminder_time: string;
    reminder_type: 'email' | 'push' | 'in_app';
  }>;
}

export interface CalendarTask {
  id: string;
  title: string;
  description?: string;
  due_date: string;
  assigned_to?: string;
  assigned_to_name?: string;
  priority: number; // 1-4 from existing schema
  color: string;
}

export interface CalendarItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  type: 'event' | 'task';
  event_type?: EventType;
  assigned_to?: string;
  assigned_to_name?: string;
  priority?: number;
  color: string;
  all_day?: boolean;
  start_time?: string;
  end_time?: string;
  location?: string;
}

export interface CalendarFilters {
  dataType: CalendarDataType;
  assignedTo: string | null; // null = all, user_id = specific user
  eventType: EventType | null; // null = all types
}

export interface EventsState {
  // Events data
  events: Event[];
  reminders: EventReminder[];
  calendarTasks: CalendarTask[];
  
  // UI State
  loading: {
    fetch: boolean;
    create: boolean;
    update: boolean;
    delete: boolean;
  };
  error: string | null;
  selectedDate: string; // ISO date string (YYYY-MM-DD)
  calendarView: 'month' | 'week' | 'day';
  
  // Filters
  filters: CalendarFilters;
  
  // Current context
  currentHub: string | null;
  
  // Realtime subscriptions
  subscriptions: Record<string, SubscriptionGroup>;
}

export interface SubscriptionGroup {
  events: RealtimeChannel;
  reminders: RealtimeChannel;
  unsubscribe: () => void;
}

export interface EventsActions {
  // Data fetching
  fetchEvents: (hubId: string, startDate: string, endDate: string) => Promise<void>;
  fetchUpcomingEvents: (hubId: string, limit?: number) => Promise<Event[]>;
  fetchCalendarData: (hubId: string, startDate: string, endDate: string, filters?: Partial<CalendarFilters>) => Promise<void>;
  
  // CRUD operations
  createEvent: (hubId: string, eventData: CreateEventPayload) => Promise<Event>;
  updateEvent: (eventId: string, updates: UpdateEventPayload) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  
  // UI state management
  setSelectedDate: (date: string) => void;
  setCalendarView: (view: 'month' | 'week' | 'day') => void;
  setCurrentHub: (hubId: string | null) => void;
  
  // Filter management
  setFilters: (filters: Partial<CalendarFilters>) => void;
  clearFilters: () => void;
  
  // Subscription management
  subscribeToHub: (hubId: string) => void;
  unsubscribeFromHub: (hubId: string) => void;
  unsubscribeAll: () => void;
  
  // Utility
  clearError: () => void;
  reset: () => void;
}

export type EventsStore = EventsState & EventsActions;

// Helper types for function signatures
export type SetStateFunction = (fn: (state: EventsState) => void) => void;
export type GetStateFunction = () => EventsStore;

export interface Result<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Calendar helper types
export interface CalendarDay {
  date: string; // YYYY-MM-DD
  events: Event[];
  tasks: CalendarTask[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

export interface CalendarWeek {
  days: CalendarDay[];
  weekNumber: number;
}

export interface CalendarMonth {
  year: number;
  month: number; // 0-11
  weeks: CalendarWeek[];
  events: Event[];
  tasks: CalendarTask[];
}

// Event filtering and sorting
export interface EventFilters {
  attendeeId?: string;
  createdBy?: string;
  hasLocation?: boolean;
  allDay?: boolean;
  eventType?: EventType;
  search?: string;
}

export interface EventSortOptions {
  field: 'start_date' | 'title' | 'created_at';
  direction: 'asc' | 'desc';
}