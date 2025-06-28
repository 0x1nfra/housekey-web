/*
  # Add Event Type Field to Events Table

  1. Schema Changes
    - Add event_type column to events table
    - Add check constraint for valid event types
    - Update RPC functions to support event_type

  2. Event Types
    - PERSONAL
    - FAMILY
    - WORK
    - APPOINTMENT
    - SOCIAL
    - OTHER (default)
*/

-- Add event_type column to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS event_type text NOT NULL DEFAULT 'OTHER' 
CHECK (event_type IN ('PERSONAL', 'FAMILY', 'WORK', 'APPOINTMENT', 'SOCIAL', 'OTHER'));

-- Update get_hub_events_with_attendees function to include event_type
CREATE OR REPLACE FUNCTION get_hub_events_with_attendees(
  p_hub_id uuid,
  p_start_date timestamptz,
  p_end_date timestamptz
)
RETURNS TABLE (
  id uuid,
  hub_id uuid,
  title text,
  description text,
  start_date timestamptz,
  end_date timestamptz,
  location text,
  all_day boolean,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  event_type text,
  creator_name text,
  creator_email text,
  attendees jsonb
) AS $$
BEGIN
  -- Check if user is a member of the hub
  IF NOT EXISTS (
    SELECT 1 FROM hub_members 
    WHERE hub_members.hub_id = p_hub_id 
    AND hub_members.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not a member of this hub';
  END IF;

  RETURN QUERY
  SELECT 
    e.id,
    e.hub_id,
    e.title,
    e.description,
    e.start_date,
    e.end_date,
    e.location,
    e.all_day,
    e.created_by,
    e.created_at,
    e.updated_at,
    e.event_type,
    up.name as creator_name,
    up.email as creator_email,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', attendee_profiles.id,
            'name', attendee_profiles.name,
            'email', attendee_profiles.email
          )
        )
        FROM unnest(e.attendees) AS attendee_id
        JOIN user_profiles attendee_profiles ON attendee_profiles.id = attendee_id
      ),
      '[]'::jsonb
    ) as attendees
  FROM events e
  JOIN user_profiles up ON e.created_by = up.id
  WHERE e.hub_id = p_hub_id
    AND e.start_date >= p_start_date
    AND e.start_date <= p_end_date
  ORDER BY e.start_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update create_event_with_reminders function to include event_type
CREATE OR REPLACE FUNCTION create_event_with_reminders(
  p_hub_id uuid,
  p_title text,
  p_start_date timestamptz,
  p_description text DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_attendees uuid[] DEFAULT '{}',
  p_all_day boolean DEFAULT false,
  p_event_type text DEFAULT 'OTHER',
  p_reminders jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_event_id uuid;
  v_reminder jsonb;
BEGIN
  -- Check if user is a member of the hub
  IF NOT EXISTS (
    SELECT 1 FROM hub_members 
    WHERE hub_members.hub_id = p_hub_id 
    AND hub_members.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not a member of this hub';
  END IF;

  -- Validate event_type
  IF p_event_type NOT IN ('PERSONAL', 'FAMILY', 'WORK', 'APPOINTMENT', 'SOCIAL', 'OTHER') THEN
    RAISE EXCEPTION 'Invalid event_type. Must be one of: PERSONAL, FAMILY, WORK, APPOINTMENT, SOCIAL, OTHER';
  END IF;

  -- Insert event
  INSERT INTO events (
    hub_id, title, description, start_date, end_date, 
    location, attendees, all_day, event_type, created_by
  )
  VALUES (
    p_hub_id, p_title, p_description, p_start_date, p_end_date, 
    p_location, p_attendees, p_all_day, p_event_type, auth.uid()
  )
  RETURNING id INTO v_event_id;
  
  -- Insert reminders if provided
  IF p_reminders IS NOT NULL THEN
    FOR v_reminder IN SELECT * FROM jsonb_array_elements(p_reminders)
    LOOP
      INSERT INTO event_reminders (event_id, user_id, reminder_time, reminder_type)
      VALUES (
        v_event_id,
        (v_reminder->>'user_id')::uuid,
        (v_reminder->>'reminder_time')::timestamptz,
        v_reminder->>'reminder_type'
      );
    END LOOP;
  END IF;
  
  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update update_event_with_reminders function to include event_type
CREATE OR REPLACE FUNCTION update_event_with_reminders(
  p_event_id uuid,
  p_title text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_attendees uuid[] DEFAULT NULL,
  p_all_day boolean DEFAULT NULL,
  p_event_type text DEFAULT NULL,
  p_reminders jsonb DEFAULT NULL
)
RETURNS boolean AS $$
DECLARE
  v_reminder jsonb;
BEGIN
  -- Check if user can update this event
  IF NOT EXISTS (
    SELECT 1 FROM events e
    JOIN hub_members hm ON e.hub_id = hm.hub_id
    WHERE e.id = p_event_id 
    AND hm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: User cannot update this event';
  END IF;

  -- Validate event_type if provided
  IF p_event_type IS NOT NULL AND p_event_type NOT IN ('PERSONAL', 'FAMILY', 'WORK', 'APPOINTMENT', 'SOCIAL', 'OTHER') THEN
    RAISE EXCEPTION 'Invalid event_type. Must be one of: PERSONAL, FAMILY, WORK, APPOINTMENT, SOCIAL, OTHER';
  END IF;

  -- Update event (only update non-null values)
  UPDATE events SET
    title = COALESCE(p_title, title),
    description = COALESCE(p_description, description),
    start_date = COALESCE(p_start_date, start_date),
    end_date = COALESCE(p_end_date, end_date),
    location = COALESCE(p_location, location),
    attendees = COALESCE(p_attendees, attendees),
    all_day = COALESCE(p_all_day, all_day),
    event_type = COALESCE(p_event_type, event_type),
    updated_at = now()
  WHERE id = p_event_id;
  
  -- Update reminders if provided
  IF p_reminders IS NOT NULL THEN
    -- Delete existing reminders
    DELETE FROM event_reminders WHERE event_id = p_event_id;
    
    -- Insert new reminders
    FOR v_reminder IN SELECT * FROM jsonb_array_elements(p_reminders)
    LOOP
      INSERT INTO event_reminders (event_id, user_id, reminder_time, reminder_type)
      VALUES (
        p_event_id,
        (v_reminder->>'user_id')::uuid,
        (v_reminder->>'reminder_time')::timestamptz,
        v_reminder->>'reminder_type'
      );
    END LOOP;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update get_upcoming_events function to include event_type
CREATE OR REPLACE FUNCTION get_upcoming_events(
  p_hub_id uuid,
  p_limit integer DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  title text,
  start_date timestamptz,
  end_date timestamptz,
  location text,
  all_day boolean,
  event_type text,
  creator_name text
) AS $$
BEGIN
  -- Check if user is a member of the hub
  IF NOT EXISTS (
    SELECT 1 FROM hub_members 
    WHERE hub_members.hub_id = p_hub_id 
    AND hub_members.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not a member of this hub';
  END IF;

  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.start_date,
    e.end_date,
    e.location,
    e.all_day,
    e.event_type,
    up.name as creator_name
  FROM events e
  JOIN user_profiles up ON e.created_by = up.id
  WHERE e.hub_id = p_hub_id
    AND e.start_date >= now()
  ORDER BY e.start_date
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new RPC function for combined calendar data (events + tasks)
CREATE OR REPLACE FUNCTION get_calendar_data(
  p_hub_id uuid,
  p_start_date timestamptz,
  p_end_date timestamptz,
  p_data_type text DEFAULT 'all',
  p_assigned_to uuid DEFAULT NULL,
  p_event_type text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  date_time timestamptz,
  item_type text,
  event_type text,
  assigned_to uuid,
  assigned_to_name text,
  priority integer,
  all_day boolean,
  end_date timestamptz,
  location text,
  color text
) AS $$
BEGIN
  -- Check if user is a member of the hub
  IF NOT EXISTS (
    SELECT 1 FROM hub_members 
    WHERE hub_members.hub_id = p_hub_id 
    AND hub_members.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not a member of this hub';
  END IF;

  -- Validate data_type parameter
  IF p_data_type NOT IN ('all', 'events', 'tasks') THEN
    RAISE EXCEPTION 'Invalid data_type. Must be one of: all, events, tasks';
  END IF;

  -- Validate event_type parameter if provided
  IF p_event_type IS NOT NULL AND p_event_type NOT IN ('PERSONAL', 'FAMILY', 'WORK', 'APPOINTMENT', 'SOCIAL', 'OTHER') THEN
    RAISE EXCEPTION 'Invalid event_type. Must be one of: PERSONAL, FAMILY, WORK, APPOINTMENT, SOCIAL, OTHER';
  END IF;

  RETURN QUERY
  -- Events query
  SELECT 
    e.id,
    e.title,
    e.description,
    e.start_date as date_time,
    'event'::text as item_type,
    e.event_type,
    e.created_by as assigned_to,
    up.name as assigned_to_name,
    NULL::integer as priority,
    e.all_day,
    e.end_date,
    e.location,
    CASE e.event_type
      WHEN 'PERSONAL' THEN '#3B82F6'
      WHEN 'FAMILY' THEN '#10B981'
      WHEN 'WORK' THEN '#F59E0B'
      WHEN 'APPOINTMENT' THEN '#EF4444'
      WHEN 'SOCIAL' THEN '#8B5CF6'
      ELSE '#6B7280'
    END as color
  FROM events e
  JOIN user_profiles up ON e.created_by = up.id
  WHERE e.hub_id = p_hub_id
    AND e.start_date >= p_start_date
    AND e.start_date <= p_end_date
    AND (p_data_type = 'all' OR p_data_type = 'events')
    AND (p_assigned_to IS NULL OR e.created_by = p_assigned_to OR p_assigned_to = ANY(e.attendees))
    AND (p_event_type IS NULL OR e.event_type = p_event_type)
  
  UNION ALL
  
  -- Tasks query
  SELECT 
    t.id,
    t.title,
    t.description,
    t.due_date as date_time,
    'task'::text as item_type,
    NULL::text as event_type,
    t.assigned_to,
    up2.name as assigned_to_name,
    t.priority,
    false as all_day,
    NULL::timestamptz as end_date,
    NULL::text as location,
    CASE t.priority
      WHEN 4 THEN '#DC2626' -- Urgent priority - Red
      WHEN 3 THEN '#F59E0B' -- High priority - Amber
      WHEN 2 THEN '#10B981' -- Medium priority - Green
      WHEN 1 THEN '#6B7280' -- Low priority - Gray
      ELSE '#6B7280'        -- Default - Gray
    END as color
  FROM tasks t
  LEFT JOIN user_profiles up2 ON t.assigned_to = up2.id
  WHERE t.hub_id = p_hub_id
    AND t.due_date IS NOT NULL
    AND t.due_date >= p_start_date
    AND t.due_date <= p_end_date
    AND t.completed = false
    AND (p_data_type = 'all' OR p_data_type = 'tasks')
    AND (p_assigned_to IS NULL OR t.assigned_to = p_assigned_to)
  
  ORDER BY date_time;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;