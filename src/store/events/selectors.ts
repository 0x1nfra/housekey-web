import { EventsState, Event, CalendarDay, CalendarWeek, CalendarMonth, EventFilters, EventSortOptions } from './types';

export const createEventsSelectors = (state: EventsState) => ({
  // Basic selectors
  getAllEvents: (): Event[] => state.events,
  
  getEventById: (eventId: string): Event | undefined =>
    state.events.find(event => event.id === eventId),

  // Date-based selectors
  getEventsByDate: (date: string): Event[] => {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    return state.events.filter(event => {
      const eventStart = new Date(event.start_date);
      const eventEnd = event.end_date ? new Date(event.end_date) : eventStart;
      
      // Check if event overlaps with the target date
      return eventStart <= endOfDay && eventEnd >= startOfDay;
    });
  },

  getEventsForMonth: (year: number, month: number): Event[] => {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    return state.events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate >= startOfMonth && eventDate <= endOfMonth;
    });
  },

  getEventsForWeek: (date: string): Event[] => {
    const targetDate = new Date(date);
    const startOfWeek = new Date(targetDate);
    startOfWeek.setDate(targetDate.getDate() - targetDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return state.events.filter(event => {
      const eventDate = new Date(event.start_date);
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });
  },

  getUpcomingEvents: (limit: number = 5): Event[] => {
    const now = new Date();
    return state.events
      .filter(event => new Date(event.start_date) >= now)
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
      .slice(0, limit);
  },

  getPastEvents: (limit: number = 10): Event[] => {
    const now = new Date();
    return state.events
      .filter(event => new Date(event.start_date) < now)
      .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
      .slice(0, limit);
  },

  // Calendar view helpers
  getCalendarMonth: (year: number, month: number): CalendarMonth => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
    
    const weeks: CalendarWeek[] = [];
    let currentDate = new Date(startDate);
    let weekNumber = 0;

    while (currentDate <= lastDay || currentDate.getDay() !== 0) {
      const days: CalendarDay[] = [];
      
      for (let i = 0; i < 7; i++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const isCurrentMonth = currentDate.getMonth() === month;
        const isToday = dateStr === new Date().toISOString().split('T')[0];
        const isSelected = dateStr === state.selectedDate;
        const events = createEventsSelectors(state).getEventsByDate(dateStr);

        days.push({
          date: dateStr,
          events,
          isCurrentMonth,
          isToday,
          isSelected,
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      weeks.push({ days, weekNumber: weekNumber++ });

      if (currentDate.getMonth() !== month && currentDate.getDay() === 0) {
        break;
      }
    }

    const monthEvents = createEventsSelectors(state).getEventsForMonth(year, month);

    return {
      year,
      month,
      weeks,
      events: monthEvents,
    };
  },

  // Filtering and searching
  getFilteredEvents: (filters: EventFilters): Event[] => {
    return state.events.filter(event => {
      if (filters.attendeeId && !event.attendees.includes(filters.attendeeId)) {
        return false;
      }
      
      if (filters.createdBy && event.created_by !== filters.createdBy) {
        return false;
      }
      
      if (filters.hasLocation !== undefined) {
        const hasLocation = Boolean(event.location && event.location.trim());
        if (hasLocation !== filters.hasLocation) {
          return false;
        }
      }
      
      if (filters.allDay !== undefined && event.all_day !== filters.allDay) {
        return false;
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = [
          event.title,
          event.description,
          event.location,
          event.creator_name,
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }
      
      return true;
    });
  },

  getSortedEvents: (events: Event[], sortOptions: EventSortOptions): Event[] => {
    return [...events].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortOptions.field) {
        case 'start_date':
          aValue = new Date(a.start_date).getTime();
          bValue = new Date(b.start_date).getTime();
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }

      if (sortOptions.direction === 'desc') {
        return bValue > aValue ? 1 : bValue < aValue ? -1 : 0;
      } else {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      }
    });
  },

  // Attendee-based selectors
  getEventsByAttendee: (userId: string): Event[] => {
    return state.events.filter(event => 
      event.attendees.includes(userId) || event.created_by === userId
    );
  },

  getUserEventCount: (userId: string): number => {
    return createEventsSelectors(state).getEventsByAttendee(userId).length;
  },

  // Time-based helpers
  getEventsToday: (): Event[] => {
    const today = new Date().toISOString().split('T')[0];
    return createEventsSelectors(state).getEventsByDate(today);
  },

  getEventsTomorrow: (): Event[] => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    return createEventsSelectors(state).getEventsByDate(tomorrowStr);
  },

  getEventsThisWeek: (): Event[] => {
    const today = new Date().toISOString().split('T')[0];
    return createEventsSelectors(state).getEventsForWeek(today);
  },

  // Statistics
  getEventStats: () => {
    const now = new Date();
    const thisMonth = createEventsSelectors(state).getEventsForMonth(now.getFullYear(), now.getMonth());
    const upcoming = createEventsSelectors(state).getUpcomingEvents(100); // Get more for stats
    const past = createEventsSelectors(state).getPastEvents(100);

    return {
      total: state.events.length,
      thisMonth: thisMonth.length,
      upcoming: upcoming.length,
      past: past.length,
      withLocation: state.events.filter(e => e.location).length,
      allDay: state.events.filter(e => e.all_day).length,
    };
  },

  // Loading and error states
  isLoading: (type?: keyof EventsState['loading']): boolean => {
    if (type) {
      return state.loading[type];
    }
    return Object.values(state.loading).some(loading => loading);
  },

  hasError: (): boolean => Boolean(state.error),
  getError: (): string | null => state.error,

  // UI state
  getSelectedDate: (): string => state.selectedDate,
  getCalendarView: (): 'month' | 'week' | 'day' => state.calendarView,
  getCurrentHub: (): string | null => state.currentHub,
});