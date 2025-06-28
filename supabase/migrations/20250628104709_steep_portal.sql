/*
  # Fix get_calendar_data RPC function

  1. Updates
    - Fix the get_calendar_data function to handle missing event_type column
    - Ensure proper column alignment in UNION ALL query
    - Add placeholder values for missing columns

  2. Changes
    - Remove or replace e.event_type reference with appropriate placeholder
    - Ensure all SELECT statements in UNION have matching column structure
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_calendar_data(uuid, text, text, text, uuid, text);

-- Create the corrected get_calendar_data function
CREATE OR REPLACE FUNCTION get_calendar_data(
  p_hub_id uuid,
  p_start_date text,
  p_end_date text,
  p_data_type text DEFAULT 'all',
  p_assigned_to uuid DEFAULT NULL,
  p_event_type text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  date_time timestamptz,
  end_date timestamptz,
  location text,
  assigned_to uuid,
  assigned_to_name text,
  priority integer,
  color text,
  all_day boolean,
  event_type text,
  item_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.description,
    e.start_date as date_time,
    e.end_date,
    e.location,
    e.created_by as assigned_to,
    up.name as assigned_to_name,
    NULL::integer as priority,
    NULL::text as color,
    e.all_day,
    'OTHER'::text as event_type, -- Provide default event_type since column doesn't exist
    'event'::text as item_type
  FROM events e
  LEFT JOIN user_profiles up ON e.created_by = up.id
  WHERE e.hub_id = p_hub_id
    AND e.start_date >= p_start_date::timestamptz
    AND e.start_date <= p_end_date::timestamptz
    AND (p_data_type = 'all' OR p_data_type = 'events')
    AND (p_assigned_to IS NULL OR e.created_by = p_assigned_to)

  UNION ALL

  SELECT 
    t.id,
    t.title,
    t.description,
    t.due_date as date_time,
    NULL::timestamptz as end_date,
    NULL::text as location,
    t.assigned_to,
    up.name as assigned_to_name,
    t.priority,
    tc.color,
    false as all_day,
    NULL::text as event_type, -- Tasks don't have event_type
    'task'::text as item_type
  FROM tasks t
  LEFT JOIN user_profiles up ON t.assigned_to = up.id
  LEFT JOIN tasks_categories tc ON t.category_id = tc.id
  WHERE t.hub_id = p_hub_id
    AND t.due_date IS NOT NULL
    AND t.due_date >= p_start_date::timestamptz
    AND t.due_date <= p_end_date::timestamptz
    AND (p_data_type = 'all' OR p_data_type = 'tasks')
    AND (p_assigned_to IS NULL OR t.assigned_to = p_assigned_to)

  ORDER BY date_time ASC;
END;
$$;