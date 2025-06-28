import { EventsState } from './types';

export const initialState: EventsState = {
  // Events data
  events: [],
  reminders: [],
  
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
  
  // Current context
  currentHub: null,
  
  // Realtime subscriptions
  subscriptions: {},
};