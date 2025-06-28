import { supabase } from "../../lib/supabase";
import {
  EventsState,
  Event,
  EventReminder,
  CreateEventPayload,
  UpdateEventPayload,
  SetStateFunction,
  GetStateFunction,
  CalendarFilters,
  CalendarTask,
} from "./types";

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
      const { data, error } = await supabase.rpc(
        "get_hub_events_with_attendees",
        {
          p_hub_id: hubId,
          p_start_date: startDate,
          p_end_date: endDate,
        }
      );

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
        event_type: event.event_type || "OTHER",
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
      console.error("Error fetching events:", error);
      set((state) => {
        state.error =
          error instanceof Error ? error.message : "Failed to fetch events";
        state.loading.fetch = false;
      });
    }
  },

  fetchCalendarData: async (
    hubId: string,
    startDate: string,
    endDate: string,
    filters?: Partial<CalendarFilters>
  ) => {
    set((state) => {
      state.loading.fetch = true;
      state.error = null;
    });

    try {
      // Apply filters from state and override with any provided filters
      const currentFilters = get().filters;
      const appliedFilters = {
        dataType: filters?.dataType || currentFilters.dataType,
        assignedTo:
          filters?.assignedTo !== undefined
            ? filters.assignedTo
            : currentFilters.assignedTo,
        eventType:
          filters?.eventType !== undefined
            ? filters.eventType
            : currentFilters.eventType,
      };

      // Update filters in state if new ones were provided
      if (filters) {
        set((state) => {
          state.filters = { ...state.filters, ...filters };
        });
      }

      // Convert date strings to ISO format for timestamp compatibility
      const formatDateForDB = (dateStr: string): string => {
        // If it's already an ISO string, return as is
        if (dateStr.includes("T")) {
          return dateStr;
        }

        // If it's a date string like '2024-12-01', convert to ISO
        const date = new Date(dateStr);
        return date.toISOString();
      };

      const { data, error } = await supabase.rpc("get_calendar_data", {
        p_hub_id: hubId,
        p_start_date: formatDateForDB(startDate),
        p_end_date: formatDateForDB(endDate),
        p_data_type: appliedFilters.dataType,
        p_assigned_to: appliedFilters.assignedTo,
        p_event_type: appliedFilters.eventType,
      });

      if (error) throw error;

      // Process and separate events and tasks
      const events: Event[] = [];
      const tasks: CalendarTask[] = [];

      (data || []).forEach((item: any) => {
        if (item.item_type === "event") {
          events.push({
            id: item.id,
            hub_id: hubId,
            title: item.title,
            description: item.description,
            start_date: item.date_time,
            end_date: item.end_date,
            location: item.location,
            attendees: [], // We don't have this in the combined query
            event_type: item.event_type || "OTHER",
            created_by: item.assigned_to,
            created_at: "", // Not available in this query
            updated_at: "", // Not available in this query
            all_day: item.all_day,
            creator_name: item.assigned_to_name,
          });
        } else if (item.item_type === "task") {
          tasks.push({
            id: item.id,
            title: item.title,
            description: item.description,
            due_date: item.date_time,
            assigned_to: item.assigned_to,
            assigned_to_name: item.assigned_to_name,
            priority: item.priority,
            color: item.color,
          });
        }
      });

      set((state) => {
        state.events = events;
        state.calendarTasks = tasks;
        state.currentHub = hubId;
        state.loading.fetch = false;
      });
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      set((state) => {
        state.error =
          error instanceof Error
            ? error.message
            : "Failed to fetch calendar data";
        state.loading.fetch = false;
      });
    }
  },

  fetchUpcomingEvents: async (
    hubId: string,
    limit: number = 5
  ): Promise<Event[]> => {
    try {
      const { data, error } = await supabase.rpc("get_upcoming_events", {
        p_hub_id: hubId,
        p_limit: limit,
      });

      if (error) throw error;

      return (data || []).map((event: any) => ({
        id: event.id,
        hub_id: hubId,
        title: event.title,
        description: "",
        start_date: event.start_date,
        end_date: event.end_date,
        location: event.location,
        attendees: [],
        event_type: event.event_type || "OTHER",
        created_by: "",
        created_at: "",
        updated_at: "",
        all_day: event.all_day,
        creator_name: event.creator_name,
      }));
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
      throw error;
    }
  },

  // CRUD operations
  createEvent: async (
    hubId: string,
    eventData: CreateEventPayload
  ): Promise<Event> => {
    set((state) => {
      state.loading.create = true;
      state.error = null;
    });

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      // Prepare reminders for RPC call
      const reminders = eventData.reminders
        ? eventData.reminders.map((reminder) => ({
            user_id: reminder.user_id,
            reminder_time: reminder.reminder_time,
            reminder_type: reminder.reminder_type,
          }))
        : null;

      const { data: eventId, error } = await supabase.rpc(
        "create_event_with_reminders",
        {
          p_hub_id: hubId,
          p_title: eventData.title,
          p_start_date: eventData.start_date,
          p_description: eventData.description || null,
          p_end_date: eventData.end_date || null,
          p_location: eventData.location || null,
          p_attendees: eventData.attendees || [],
          p_all_day: eventData.all_day || false,
          p_event_type: eventData.event_type || "OTHER",
          p_reminders: reminders ? JSON.stringify(reminders) : null,
        }
      );

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
        event_type: eventData.event_type || "OTHER",
        created_by: user.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        all_day: eventData.all_day || false,
      };

      // Optimistically update state
      set((state) => {
        state.events.push(newEvent);
        state.events.sort(
          (a, b) =>
            new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
        );
        state.loading.create = false;
      });

      return newEvent;
    } catch (error) {
      console.error("Error creating event:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create event";
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
      const reminders = updates.reminders
        ? updates.reminders.map((reminder) => ({
            user_id: reminder.user_id,
            reminder_time: reminder.reminder_time,
            reminder_type: reminder.reminder_type,
          }))
        : null;

      const { error } = await supabase.rpc("update_event_with_reminders", {
        p_event_id: eventId,
        p_title: updates.title || null,
        p_description: updates.description || null,
        p_start_date: updates.start_date || null,
        p_end_date: updates.end_date || null,
        p_location: updates.location || null,
        p_attendees: updates.attendees || null,
        p_all_day: updates.all_day !== undefined ? updates.all_day : null,
        p_event_type: updates.event_type || null,
        p_reminders: reminders ? JSON.stringify(reminders) : null,
      });

      if (error) throw error;

      // Optimistically update state
      set((state) => {
        const eventIndex = state.events.findIndex((e) => e.id === eventId);
        if (eventIndex !== -1) {
          state.events[eventIndex] = {
            ...state.events[eventIndex],
            ...updates,
            updated_at: new Date().toISOString(),
          };
          state.events.sort(
            (a, b) =>
              new Date(a.start_date).getTime() -
              new Date(b.start_date).getTime()
          );
        }
        state.loading.update = false;
      });
    } catch (error) {
      console.error("Error updating event:", error);
      set((state) => {
        state.error =
          error instanceof Error ? error.message : "Failed to update event";
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
      const { error } = await supabase.rpc("delete_event_with_reminders", {
        p_event_id: eventId,
      });

      if (error) throw error;

      // Optimistically update state
      set((state) => {
        state.events = state.events.filter((e) => e.id !== eventId);
        state.reminders = state.reminders.filter((r) => r.event_id !== eventId);
        state.loading.delete = false;
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      set((state) => {
        state.error =
          error instanceof Error ? error.message : "Failed to delete event";
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

  setCalendarView: (view: "month" | "week" | "day") => {
    set((state) => {
      state.calendarView = view;
    });
  },

  setCurrentHub: (hubId: string | null) => {
    set((state) => {
      state.currentHub = hubId;
    });
  },

  // Filter management
  setFilters: (filters: Partial<CalendarFilters>) => {
    set((state) => {
      state.filters = { ...state.filters, ...filters };
    });

    // Refetch data with new filters if we have a current hub
    const { currentHub, selectedDate, calendarView } = get();
    if (currentHub) {
      const date = new Date(selectedDate);
      let startDate: string;
      let endDate: string;

      if (calendarView === "month") {
        const year = date.getFullYear();
        const month = date.getMonth();
        startDate = new Date(year, month, 1).toISOString();
        endDate = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();
      } else if (calendarView === "week") {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        startDate = startOfWeek.toISOString();
        endDate = endOfWeek.toISOString();
      } else {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        startDate = startOfDay.toISOString();
        endDate = endOfDay.toISOString();
      }

      get().fetchCalendarData(currentHub, startDate, endDate);
    }
  },

  clearFilters: () => {
    set((state) => {
      state.filters = {
        dataType: "all",
        assignedTo: null,
        eventType: null,
      };
    });

    // Refetch data with cleared filters
    const { currentHub, selectedDate, calendarView } = get();
    if (currentHub) {
      const date = new Date(selectedDate);
      let startDate: string;
      let endDate: string;

      if (calendarView === "month") {
        const year = date.getFullYear();
        const month = date.getMonth();
        startDate = new Date(year, month, 1).toISOString();
        endDate = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();
      } else if (calendarView === "week") {
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);

        startDate = startOfWeek.toISOString();
        endDate = endOfWeek.toISOString();
      } else {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        startDate = startOfDay.toISOString();
        endDate = endOfDay.toISOString();
      }

      get().fetchCalendarData(currentHub, startDate, endDate);
    }
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
      state.calendarTasks = [];
      state.loading = {
        fetch: false,
        create: false,
        update: false,
        delete: false,
      };
      state.error = null;
      state.selectedDate = new Date().toISOString().split("T")[0];
      state.calendarView = "month";
      state.filters = {
        dataType: "all",
        assignedTo: null,
        eventType: null,
      };
      state.currentHub = null;
      state.subscriptions = {};
    });
  },
});
