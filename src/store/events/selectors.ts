import { 
  EventsState, 
  Event, 
  CalendarDay, 
  CalendarWeek, 
  CalendarMonth, 
  EventFilters, 
  EventSortOptions,
  CalendarTask,
  CalendarItem,
  EVENT_TYPES
} from './types';
import { format, startOfMonth, endOfMonth, addDays, isSameMonth, isToday, isSameDay, parseISO } from 'date-fns';

export const createEventsSelectors = (state: EventsState) => ({
  // Basic selectors
  getAllEvents: (): Event[] => state.events,
  
  getAllCalendarTasks: (): CalendarTask[] => state.calendarTasks,
  
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

  getTasksByDate: (date: string): CalendarTask[] => {
    const targetDate = new Date(date);
    const dateStr = targetDate.toISOString().split('T')[0];

    return state.calendarTasks.filter(task => {
      const taskDate = new Date(task.due_date).toISOString().split('T')[0];
      return taskDate === dateStr;
    });
  },

  getCalendarItemsByDate: (date: string): CalendarItem[] => {
    const events = createEventsSelectors(state).getEventsByDate(date);
    const tasks = createEventsSelectors(state).getTasksByDate(date);
    
    const eventItems: CalendarItem[] = events.map(event => {
      const startDate = new Date(event.start_date);
      const endDate = event.end_date ? new Date(event.end_date) : null;
      
      return {
        id: event.id,
        title: event.title,
        description: event.description,
        date: date,
        type: 'event',
        event_type: event.event_type,
        assigned_to: event.created_by,
        assigned_to_name: event.creator_name,
        color: EVENT_TYPES[event.event_type]?.color || EVENT_TYPES.OTHER.color,
        all_day: event.all_day,
        start_time: event.all_day ? undefined : format(startDate, 'HH:mm'),
        end_time: event.all_day || !endDate ? undefined : format(endDate, 'HH:mm'),
        location: event.location
      };
    });
    
    const taskItems: CalendarItem[] = tasks.map(task => {
      return {
        id: task.id,
        title: task.title,
        description: task.description,
        date: date,
        type: 'task',
        assigned_to: task.assigned_to,
        assigned_to_name: task.assigned_to_name,
        priority: task.priority,
        color: task.color,
      };
    });
    
    return [...eventItems, ...taskItems].sort((a, b) => {
      // Sort by all_day first (all-day events at the top)
      if (a.all_day && !b.all_day) return -1;
      if (!a.all_day && b.all_day) return 1;
      
      // Then sort by start_time if available
      if (a.start_time && b.start_time) {
        return a.start_time.localeCompare(b.start_time);
      }
      
      // Then sort by type (events before tasks)
      if (a.type === 'event' && b.type === 'task') return -1;
      if (a.type === 'task' && b.type === 'event') return 1;
      
      // Finally sort by title
      return a.title.localeCompare(b.title);
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

  getTasksForMonth: (year: number, month: number): CalendarTask[] => {
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

    return state.calendarTasks.filter(task => {
      const taskDate = new Date(task.due_date);
      return taskDate >= startOfMonth && taskDate <= endOfMonth;
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

  getTasksForWeek: (date: string): CalendarTask[] => {
    const targetDate = new Date(date);
    const startOfWeek = new Date(targetDate);
    startOfWeek.setDate(targetDate.getDate() - targetDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return state.calendarTasks.filter(task => {
      const taskDate = new Date(task.due_date);
      return taskDate >= startOfWeek && taskDate <= endOfWeek;
    });
  },

  getCalendarItemsForWeek: (date: string): Record<string, CalendarItem[]> => {
    const targetDate = new Date(date);
    const startOfWeek = new Date(targetDate);
    startOfWeek.setDate(targetDate.getDate() - targetDate.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const result: Record<string, CalendarItem[]> = {};
    
    // Initialize all days of the week
    for (let i = 0; i < 7; i++) {
      const currentDate = addDays(startOfWeek, i);
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      result[dateStr] = [];
    }
    
    // Get all events and tasks for the week
    const events = createEventsSelectors(state).getEventsForWeek(date);
    const tasks = createEventsSelectors(state).getTasksForWeek(date);
    
    // Process events
    events.forEach(event => {
      const eventDate = new Date(event.start_date);
      const dateStr = format(eventDate, 'yyyy-MM-dd');
      
      if (result[dateStr]) {
        const startDate = new Date(event.start_date);
        const endDate = event.end_date ? new Date(event.end_date) : null;
        
        result[dateStr].push({
          id: event.id,
          title: event.title,
          description: event.description,
          date: dateStr,
          type: 'event',
          event_type: event.event_type,
          assigned_to: event.created_by,
          assigned_to_name: event.creator_name,
          color: EVENT_TYPES[event.event_type]?.color || EVENT_TYPES.OTHER.color,
          all_day: event.all_day,
          start_time: event.all_day ? undefined : format(startDate, 'HH:mm'),
          end_time: event.all_day || !endDate ? undefined : format(endDate, 'HH:mm'),
          location: event.location
        });
      }
    });
    
    // Process tasks
    tasks.forEach(task => {
      const taskDate = new Date(task.due_date);
      const dateStr = format(taskDate, 'yyyy-MM-dd');
      
      if (result[dateStr]) {
        result[dateStr].push({
          id: task.id,
          title: task.title,
          description: task.description,
          date: dateStr,
          type: 'task',
          assigned_to: task.assigned_to,
          assigned_to_name: task.assigned_to_name,
          priority: task.priority,
          color: task.color,
        });
      }
    });
    
    // Sort items for each day
    Object.keys(result).forEach(dateStr => {
      result[dateStr].sort((a, b) => {
        // Sort by all_day first (all-day events at the top)
        if (a.all_day && !b.all_day) return -1;
        if (!a.all_day && b.all_day) return 1;
        
        // Then sort by start_time if available
        if (a.start_time && b.start_time) {
          return a.start_time.localeCompare(b.start_time);
        }
        
        // Then sort by type (events before tasks)
        if (a.type === 'event' && b.type === 'task') return -1;
        if (a.type === 'task' && b.type === 'event') return 1;
        
        // Finally sort by title
        return a.title.localeCompare(b.title);
      });
    });
    
    return result;
  },

  getUpcomingEvents: (limit: number = 5): Event[] => {
    const now = new Date();
    return state.events
      .filter(event => new Date(event.start_date) >= now)
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
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
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const isCurrentMonth = isSameMonth(currentDate, firstDay);
        const isTodayDate = isToday(currentDate);
        const isSelected = dateStr === state.selectedDate;
        
        // Get events and tasks for this day
        const events = state.events.filter(event => {
          const eventDate = format(new Date(event.start_date), 'yyyy-MM-dd');
          return eventDate === dateStr;
        });
        
        const tasks = state.calendarTasks.filter(task => {
          const taskDate = format(new Date(task.due_date), 'yyyy-MM-dd');
          return taskDate === dateStr;
        });

        days.push({
          date: dateStr,
          events,
          tasks,
          isCurrentMonth,
          isToday: isTodayDate,
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
    const monthTasks = createEventsSelectors(state).getTasksForMonth(year, month);

    return {
      year,
      month,
      weeks,
      events: monthEvents,
      tasks: monthTasks,
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
      
      if (filters.eventType && event.event_type !== filters.eventType) {
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

  // UI state
  getSelectedDate: (): string => state.selectedDate,
  getCalendarView: (): 'month' | 'week' | 'day' => state.calendarView,
  getCurrentHub: (): string | null => state.currentHub,
  getFilters: () => state.filters,
});