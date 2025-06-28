import { EventsState, CalendarDataType, EventType } from './types';

export const initialState: EventsState = {
  // Events data
  events: [],
  reminders: [],
  calendarTasks: [],
  
  // UI State
  loading: {
    fetch: false,
    create: false,
    update: false,
    delete: false,
  },
  error: null,
  selectedDate: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
  calendarView: 'month',
  
  // Filters
  filters: {
    dataType: 'all' as CalendarDataType,
    assignedTo: null,
    eventType: null,
  },
  
  // Current context
  currentHub: null,
  
  // Realtime subscriptions
  subscriptions: {},
};