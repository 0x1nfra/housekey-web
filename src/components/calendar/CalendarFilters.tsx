import React from 'react';
import { motion } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import { useEventsStore } from '../../store/events';
import { useHubStore } from '../../store/hubStore';
import { useAuthStore } from '../../store/authStore';
import { CalendarDataType, EventType, EVENT_TYPES } from '../../store/events/types';
import { shallow } from 'zustand/shallow';

const CalendarFilters: React.FC = () => {
  const { filters, setFilters, clearFilters } = useEventsStore(
    (state) => ({
      filters: state.filters,
      setFilters: state.setFilters,
      clearFilters: state.clearFilters,
    }),
    shallow
  );

  const { hubMembers } = useHubStore();
  const { user } = useAuthStore();

  const dataTypeOptions: { value: CalendarDataType; label: string }[] = [
    { value: 'all', label: 'All Items' },
    { value: 'events', label: 'Events Only' },
    { value: 'tasks', label: 'Tasks Only' },
  ];

  const eventTypeOptions: { value: EventType; label: string; color: string }[] = Object.entries(EVENT_TYPES).map(
    ([key, value]) => ({
      value: key as EventType,
      label: value.label,
      color: value.color,
    })
  );

  const hasActiveFilters = 
    filters.dataType !== 'all' || 
    filters.assignedTo !== null || 
    filters.eventType !== null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <h3 className="font-medium text-gray-900">Calendar Filters</h3>
        </div>
        
        {hasActiveFilters && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
          >
            <X size={14} />
            Clear Filters
          </motion.button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Data Type Filter */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Show
          </label>
          <select
            value={filters.dataType}
            onChange={(e) => setFilters({ dataType: e.target.value as CalendarDataType })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {dataTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Assignment Filter */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Assigned To
          </label>
          <select
            value={filters.assignedTo || ''}
            onChange={(e) => setFilters({ assignedTo: e.target.value ? e.target.value : null })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Members</option>
            {user && <option value={user.id}>My Items Only</option>}
            {hubMembers
              .filter((member) => member.user_id !== user?.id)
              .map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.user_profile?.name || 'Unknown User'}
                </option>
              ))}
          </select>
        </div>
        
        {/* Event Type Filter (only shown when events are included) */}
        {(filters.dataType === 'all' || filters.dataType === 'events') && (
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              Event Type
            </label>
            <select
              value={filters.eventType || ''}
              onChange={(e) => setFilters({ eventType: e.target.value ? e.target.value as EventType : null })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Types</option>
              {eventTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarFilters;