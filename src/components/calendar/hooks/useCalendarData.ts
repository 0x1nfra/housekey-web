import { useEffect } from 'react';
import { useEventsStore, useEventsSelectors } from '../../../store/events';
import { useHubStore } from '../../../store/hubStore';

export const useCalendarData = () => {
  const { currentHub } = useHubStore();
  const {
    loading,
    error,
    selectedDate,
    calendarView,
    fetchEvents,
    setCurrentHub,
    subscribeToHub,
    unsubscribeFromHub,
    clearError,
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
        // Get full month range
        const year = date.getFullYear();
        const month = date.getMonth();
        startDate = new Date(year, month, 1).toISOString();
        endDate = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();
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

      fetchEvents(currentHub.id, startDate, endDate);
    }
  }, [currentHub, selectedDate, calendarView, fetchEvents, setCurrentHub]);

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

  return {
    // Data
    selectedDateEvents,
    upcomingEvents,
    todayEvents,
    calendarMonth,
    weekEvents,
    
    // State
    loading,
    error,
    selectedDate,
    calendarView,
    
    // Actions
    clearError,
    
    // Selectors
    selectors,
  };
};