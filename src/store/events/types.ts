import { RealtimeChannel } from "@supabase/supabase-js";

export interface Event {
  id: string;
  hub_id: string;
  title: string;
  description?: string;
  start_date: string; // ISO timestamp
  end_date?: string; // ISO timestamp
  location?: string;
  attendees: string[]; // Array of user_profile IDs
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
  reminders?: Array<{
    user_id: string;
    reminder_time: string;
    reminder_type: 'email' | 'push' | 'in_app';
  }>;
}

export interface EventsState {
  // Events data
  events: Event[];
  reminders: EventReminder[];
  
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
  
  // CRUD operations
  createEvent: (hubId: string, eventData: CreateEventPayload) => Promise<Event>;
  updateEvent: (eventId: string, updates: UpdateEventPayload) => Promise<void>;
  deleteEvent: (eventId: string) => Promise<void>;
  
  // UI state management
  setSelectedDate: (date: string) => void;
  setCalendarView: (view: 'month' | 'week' | 'day') => void;
  setCurrentHub: (hubId: string | null) => void;
  
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
}

// Event filtering and sorting
export interface EventFilters {
  attendeeId?: string;
  createdBy?: string;
  hasLocation?: boolean;
  allDay?: boolean;
  search?: string;
}

export interface EventSortOptions {
  field: 'start_date' | 'title' | 'created_at';
  direction: 'asc' | 'desc';
}