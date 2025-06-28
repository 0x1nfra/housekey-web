import { useEffect } from 'react';
import { useEventsStore, useEventsSelectors } from '../../../store/events';
import { useHubStore } from '../../../store/hubStore';
import { useTasksStore } from '../../../store/tasks';

export const useCalendarData = () => {
  const { currentHub } = useHubStore();
  const {
    loading,
    error,
    selectedDate,
    calendarView,
    filters,
    fetchCalendarData,
    setCurrentHub,
    subscribeToHub,
    unsubscribeFromHub,
    clearError,
    setFilters,
    clearFilters,
  } = useEventsStore();

  const selectors = useEventsSelectors();

  // Initialize events for current hub
  useEffect(() => {
    if (currentHub) {
      setCurrentHub(currentHub.id);
      
      // Calculate date range based on current view and selected date
      const date = new Date(selectedDate);
      let startDate: string;
      let endDate: string;

      if (calendarView === 'month') {
        // Get full month range plus padding for calendar display
        const year = date.getFullYear();
        const month = date.getMonth();
        
        // Start from beginning of first week (might be previous month)
        const firstDay = new Date(year, month, 1);
        const startOfCalendar = new Date(firstDay);
        startOfCalendar.setDate(firstDay.getDate() - firstDay.getDay());
        startOfCalendar.setHours(0, 0, 0, 0);
        
        // End at last day of last week (might be next month)
        const lastDay = new Date(year, month + 1, 0);
        const endOfCalendar = new Date(lastDay);
        const daysToAdd = 6 - lastDay.getDay();
        endOfCalendar.setDate(lastDay.getDate() + daysToAdd);
        endOfCalendar.setHours(23, 59, 59, 999);
        
        startDate = startOfCalendar.toISOString();
        endDate = endOfCalendar.toISOString();
      } else if (calendarView === 'week') {
        // Get week range
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        
        startDate = startOfWeek.toISOString();
        endDate = endOfWeek.toISOString();
      } else {
        // Day view
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        startDate = startOfDay.toISOString();
        endDate = endOfDay.toISOString();
      }

      fetchCalendarData(currentHub.id, startDate, endDate);
    }
  }, [currentHub, selectedDate, calendarView, fetchCalendarData, setCurrentHub]);

  // Subscribe to real-time updates when current hub changes
  useEffect(() => {
    if (currentHub) {
      subscribeToHub(currentHub.id);

      // Cleanup subscription when hub changes
      return () => {
        unsubscribeFromHub(currentHub.id);
      };
    }
  }, [currentHub, subscribeToHub, unsubscribeFromHub]);

  // Get calendar-specific data using selectors
  const selectedDateEvents = selectors.getEventsByDate(selectedDate);
  const selectedDateTasks = selectors.getTasksByDate(selectedDate);
  const selectedDateItems = selectors.getCalendarItemsByDate(selectedDate);
  const upcomingEvents = selectors.getUpcomingEvents(5);
  const todayEvents = selectors.getEventsToday();
  
  // Get calendar month data if in month view
  const calendarMonth = calendarView === 'month' ? 
    selectors.getCalendarMonth(
      new Date(selectedDate).getFullYear(),
      new Date(selectedDate).getMonth()
    ) : null;

  // Get week events if in week view
  const weekEvents = calendarView === 'week' ? 
    selectors.getEventsForWeek(selectedDate) : [];
    
  // Get week tasks if in week view
  const weekTasks = calendarView === 'week' ?
    selectors.getTasksForWeek(selectedDate) : [];
    
  // Get week calendar items if in week view
  const weekItems = calendarView === 'week' ?
    selectors.getCalendarItemsForWeek(selectedDate) : {};

  return {
    // Data
    selectedDateEvents,
    selectedDateTasks,
    selectedDateItems,
    upcomingEvents,
    todayEvents,
    calendarMonth,
    weekEvents,
    weekTasks,
    weekItems,
    
    // State
    loading,
    error,
    selectedDate,
    calendarView,
    filters,
    
    // Actions
    clearError,
    setFilters,
    clearFilters,
    
    // Selectors
    selectors,
  };
};