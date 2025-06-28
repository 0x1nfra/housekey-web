-- Drop existing functions first to avoid return type conflicts
DROP FUNCTION IF EXISTS get_hub_events_with_attendees(uuid, timestamptz, timestamptz);
DROP FUNCTION IF EXISTS get_upcoming_events(uuid, integer);
DROP FUNCTION IF EXISTS create_event_with_reminders(uuid, text, timestamptz, text, timestamptz, text, uuid[], boolean, text, jsonb);
DROP FUNCTION IF EXISTS update_event_with_reminders(uuid, text, text, timestamptz, timestamptz, text, uuid[], boolean, text, jsonb);
DROP FUNCTION IF EXISTS delete_event_with_reminders(uuid);
DROP FUNCTION IF EXISTS get_calendar_data(uuid, timestamptz, timestamptz, text, uuid, text);

-- Function to get combined calendar data (events and tasks)
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
    COALESCE(e.event_type, 'OTHER') as event_type,
    'event'::text as item_type
  FROM events e
  LEFT JOIN user_profiles up ON e.created_by = up.id
  WHERE e.hub_id = p_hub_id
    AND e.start_date >= p_start_date
    AND e.start_date <= p_end_date
    AND (p_data_type = 'all' OR p_data_type = 'events')
    AND (p_assigned_to IS NULL OR e.created_by = p_assigned_to)
    AND (p_event_type IS NULL OR e.event_type = p_event_type)
    AND e.hub_id IN (
      SELECT hub_members.hub_id 
      FROM hub_members 
      WHERE hub_members.user_id = auth.uid()
    )

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
    NULL::text as event_type,
    'task'::text as item_type
  FROM tasks t
  LEFT JOIN user_profiles up ON t.assigned_to = up.id
  LEFT JOIN tasks_categories tc ON t.category_id = tc.id
  WHERE t.hub_id = p_hub_id
    AND t.due_date IS NOT NULL
    AND t.due_date >= p_start_date
    AND t.due_date <= p_end_date
    AND (p_data_type = 'all' OR p_data_type = 'tasks')
    AND (p_assigned_to IS NULL OR t.assigned_to = p_assigned_to)
    AND t.hub_id IN (
      SELECT hub_members.hub_id 
      FROM hub_members 
      WHERE hub_members.user_id = auth.uid()
    )
  
  ORDER BY date_time ASC;
END;
$$;

-- Function to get events with attendee details
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
  attendees jsonb,
  event_type text,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  all_day boolean,
  creator_name text,
  creator_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.hub_id,
    e.title,
    e.description,
    e.start_date,
    e.end_date,
    e.location,
    COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'id', up.id,
            'name', up.name,
            'email', up.email
          )
        )
        FROM unnest(e.attendees) AS attendee_id
        JOIN user_profiles up ON up.id = attendee_id
      ),
      '[]'::jsonb
    ) as attendees,
    COALESCE(e.event_type, 'OTHER') as event_type,
    e.created_by,
    e.created_at,
    e.updated_at,
    e.all_day,
    creator.name as creator_name,
    creator.email as creator_email
  FROM events e
  LEFT JOIN user_profiles creator ON e.created_by = creator.id
  WHERE e.hub_id = p_hub_id
    AND e.start_date >= p_start_date
    AND e.start_date <= p_end_date
    AND e.hub_id IN (
      SELECT hub_members.hub_id 
      FROM hub_members 
      WHERE hub_members.user_id = auth.uid()
    )
  ORDER BY e.start_date ASC;
END;
$$;

-- Function to get upcoming events
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
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id,
    e.title,
    e.start_date,
    e.end_date,
    e.location,
    e.all_day,
    COALESCE(e.event_type, 'OTHER') as event_type,
    up.name as creator_name
  FROM events e
  LEFT JOIN user_profiles up ON e.created_by = up.id
  WHERE e.hub_id = p_hub_id
    AND e.start_date >= NOW()
    AND e.hub_id IN (
      SELECT hub_members.hub_id 
      FROM hub_members 
      WHERE hub_members.user_id = auth.uid()
    )
  ORDER BY e.start_date ASC
  LIMIT p_limit;
END;
$$;

-- Function to create event with reminders
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
  p_reminders text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id uuid;
  v_reminder jsonb;
BEGIN
  -- Insert the event
  INSERT INTO events (
    hub_id,
    title,
    description,
    start_date,
    end_date,
    location,
    attendees,
    all_day,
    event_type,
    created_by
  ) VALUES (
    p_hub_id,
    p_title,
    p_description,
    p_start_date,
    p_end_date,
    p_location,
    p_attendees,
    p_all_day,
    p_event_type,
    auth.uid()
  )
  RETURNING id INTO v_event_id;

  -- Insert reminders if provided
  IF p_reminders IS NOT NULL THEN
    FOR v_reminder IN SELECT * FROM jsonb_array_elements(p_reminders::jsonb)
    LOOP
      INSERT INTO event_reminders (
        event_id,
        user_id,
        reminder_time,
        reminder_type
      ) VALUES (
        v_event_id,
        (v_reminder->>'user_id')::uuid,
        (v_reminder->>'reminder_time')::timestamptz,
        v_reminder->>'reminder_type'
      );
    END LOOP;
  END IF;

  RETURN v_event_id;
END;
$$;

-- Function to update event with reminders
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
  p_reminders text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_reminder jsonb;
BEGIN
  -- Update the event
  UPDATE events SET
    title = COALESCE(p_title, title),
    description = COALESCE(p_description, description),
    start_date = COALESCE(p_start_date, start_date),
    end_date = COALESCE(p_end_date, end_date),
    location = COALESCE(p_location, location),
    attendees = COALESCE(p_attendees, attendees),
    all_day = COALESCE(p_all_day, all_day),
    event_type = COALESCE(p_event_type, event_type),
    updated_at = NOW()
  WHERE id = p_event_id
    AND hub_id IN (
      SELECT hub_members.hub_id 
      FROM hub_members 
      WHERE hub_members.user_id = auth.uid()
    );

  -- Update reminders if provided
  IF p_reminders IS NOT NULL THEN
    -- Delete existing reminders
    DELETE FROM event_reminders WHERE event_id = p_event_id;
    
    -- Insert new reminders
    FOR v_reminder IN SELECT * FROM jsonb_array_elements(p_reminders::jsonb)
    LOOP
      INSERT INTO event_reminders (
        event_id,
        user_id,
        reminder_time,
        reminder_type
      ) VALUES (
        p_event_id,
        (v_reminder->>'user_id')::uuid,
        (v_reminder->>'reminder_time')::timestamptz,
        v_reminder->>'reminder_type'
      );
    END LOOP;
  END IF;
END;
$$;

-- Function to delete event with reminders
CREATE OR REPLACE FUNCTION delete_event_with_reminders(
  p_event_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete reminders first (due to foreign key constraint)
  DELETE FROM event_reminders WHERE event_id = p_event_id;
  
  -- Delete the event
  DELETE FROM events 
  WHERE id = p_event_id
    AND hub_id IN (
      SELECT hub_members.hub_id 
      FROM hub_members 
      WHERE hub_members.user_id = auth.uid()
    );
END;
$$;