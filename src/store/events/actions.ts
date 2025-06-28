import { supabase } from '../../lib/supabase';
import {
  EventsState,
  Event,
  EventReminder,
  CreateEventPayload,
  UpdateEventPayload,
  SetStateFunction,
  GetStateFunction,
} from './types';

export const createEventsActions = (
  set: SetStateFunction,
  get: GetStateFunction
) => ({
  // Data fetching
  fetchEvents: async (hubId: string, startDate: string, endDate: string) => {
    set((state) => {
      state.loading.fetch = true;
      state.error = null;
    });

    try {
      const { data, error } = await supabase.rpc('get_hub_events_with_attendees', {
        p_hub_id: hubId,
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (error) throw error;

      // Transform the data to match our Event interface
      const events: Event[] = (data || []).map((event: any) => ({
        id: event.id,
        hub_id: event.hub_id,
        title: event.title,
        description: event.description,
        start_date: event.start_date,
        end_date: event.end_date,
        location: event.location,
        attendees: event.attendees ? event.attendees.map((a: any) => a.id) : [],
        created_by: event.created_by,
        created_at: event.created_at,
        updated_at: event.updated_at,
        all_day: event.all_day,
        creator_name: event.creator_name,
        creator_email: event.creator_email,
        attendee_details: event.attendees || [],
      }));

      set((state) => {
        state.events = events;
        state.currentHub = hubId;
        state.loading.fetch = false;
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Failed to fetch events';
        state.loading.fetch = false;
      });
    }
  },

  fetchUpcomingEvents: async (hubId: string, limit: number = 5): Promise<Event[]> => {
    try {
      const { data, error } = await supabase.rpc('get_upcoming_events', {
        p_hub_id: hubId,
        p_limit: limit,
      });

      if (error) throw error;

      return (data || []).map((event: any) => ({
        id: event.id,
        hub_id: hubId,
        title: event.title,
        description: '',
        start_date: event.start_date,
        end_date: event.end_date,
        location: event.location,
        attendees: [],
        created_by: '',
        created_at: '',
        updated_at: '',
        all_day: event.all_day,
        creator_name: event.creator_name,
      }));
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      throw error;
    }
  },

  // CRUD operations
  createEvent: async (hubId: string, eventData: CreateEventPayload): Promise<Event> => {
    set((state) => {
      state.loading.create = true;
      state.error = null;
    });

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Prepare reminders for RPC call
      const reminders = eventData.reminders ? 
        eventData.reminders.map(reminder => ({
          user_id: reminder.user_id,
          reminder_time: reminder.reminder_time,
          reminder_type: reminder.reminder_type,
        })) : null;

      const { data: eventId, error } = await supabase.rpc('create_event_with_reminders', {
        p_hub_id: hubId,
        p_title: eventData.title,
        p_description: eventData.description || null,
        p_start_date: eventData.start_date,
        p_end_date: eventData.end_date || null,
        p_location: eventData.location || null,
        p_attendees: eventData.attendees || [],
        p_all_day: eventData.all_day || false,
        p_reminders: reminders ? JSON.stringify(reminders) : null,
      });

      if (error) throw error;

      // Create optimistic event object
      const newEvent: Event = {
        id: eventId,
        hub_id: hubId,
        title: eventData.title,
        description: eventData.description,
        start_date: eventData.start_date,
        end_date: eventData.end_date,
        location: eventData.location,
        attendees: eventData.attendees || [],
        created_by: user.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        all_day: eventData.all_day || false,
      };

      // Optimistically update state
      set((state) => {
        state.events.push(newEvent);
        state.events.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
        state.loading.create = false;
      });

      return newEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
      set((state) => {
        state.error = errorMessage;
        state.loading.create = false;
      });
      throw error;
    }
  },

  updateEvent: async (eventId: string, updates: UpdateEventPayload) => {
    set((state) => {
      state.loading.update = true;
      state.error = null;
    });

    try {
      // Prepare reminders for RPC call
      const reminders = updates.reminders ? 
        updates.reminders.map(reminder => ({
          user_id: reminder.user_id,
          reminder_time: reminder.reminder_time,
          reminder_type: reminder.reminder_type,
        })) : null;

      const { error } = await supabase.rpc('update_event_with_reminders', {
        p_event_id: eventId,
        p_title: updates.title || null,
        p_description: updates.description || null,
        p_start_date: updates.start_date || null,
        p_end_date: updates.end_date || null,
        p_location: updates.location || null,
        p_attendees: updates.attendees || null,
        p_all_day: updates.all_day || null,
        p_reminders: reminders ? JSON.stringify(reminders) : null,
      });

      if (error) throw error;

      // Optimistically update state
      set((state) => {
        const eventIndex = state.events.findIndex(e => e.id === eventId);
        if (eventIndex !== -1) {
          state.events[eventIndex] = {
            ...state.events[eventIndex],
            ...updates,
            updated_at: new Date().toISOString(),
          };
          state.events.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
        }
        state.loading.update = false;
      });
    } catch (error) {
      console.error('Error updating event:', error);
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Failed to update event';
        state.loading.update = false;
      });
    }
  },

  deleteEvent: async (eventId: string) => {
    set((state) => {
      state.loading.delete = true;
      state.error = null;
    });

    try {
      const { error } = await supabase.rpc('delete_event_with_reminders', {
        p_event_id: eventId,
      });

      if (error) throw error;

      // Optimistically update state
      set((state) => {
        state.events = state.events.filter(e => e.id !== eventId);
        state.reminders = state.reminders.filter(r => r.event_id !== eventId);
        state.loading.delete = false;
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      set((state) => {
        state.error = error instanceof Error ? error.message : 'Failed to delete event';
        state.loading.delete = false;
      });
    }
  },

  // UI state management
  setSelectedDate: (date: string) => {
    set((state) => {
      state.selectedDate = date;
    });
  },

  setCalendarView: (view: 'month' | 'week' | 'day') => {
    set((state) => {
      state.calendarView = view;
    });
  },

  setCurrentHub: (hubId: string | null) => {
    set((state) => {
      state.currentHub = hubId;
    });
  },

  // Utility
  clearError: () => {
    set((state) => {
      state.error = null;
    });
  },

  reset: () => {
    // Unsubscribe from all subscriptions
    const state = get();
    Object.values(state.subscriptions).forEach((subscription: unknown) => {
      if (
        subscription &&
        typeof subscription === "object" &&
        "unsubscribe" in subscription &&
        typeof subscription.unsubscribe === "function"
      ) {
        subscription.unsubscribe();
      }
    });

    set((state) => {
      state.events = [];
      state.reminders = [];
      state.loading = {
        fetch: false,
        create: false,
        update: false,
        delete: false,
      };
      state.error = null;
      state.selectedDate = new Date().toISOString().split('T')[0];
      state.calendarView = 'month';
      state.currentHub = null;
      state.subscriptions = {};
    });
  },
});