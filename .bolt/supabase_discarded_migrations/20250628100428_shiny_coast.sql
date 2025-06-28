/*
  # Events System Implementation

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `hub_id` (uuid, references hubs)
      - `title` (text, not null)
      - `description` (text, nullable)
      - `start_date` (timestamptz, not null)
      - `end_date` (timestamptz, nullable)
      - `location` (text, nullable)
      - `attendees` (uuid[], array of user_profile IDs)
      - `created_by` (uuid, references user_profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `all_day` (boolean, default false)
    
    - `event_reminders`
      - `id` (uuid, primary key)
      - `event_id` (uuid, references events)
      - `user_id` (uuid, references user_profiles)
      - `reminder_time` (timestamptz, not null)
      - `reminder_type` (text, check constraint)
      - `sent` (boolean, default false)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for hub-based access control
    - Only hub members can view/manage events

  3. Functions
    - Auto-update timestamps
    - Optimized RPC functions for complex queries
    - Event creation with reminders
*/

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id uuid REFERENCES hubs(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  location text,
  attendees uuid[] DEFAULT '{}',
  created_by uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  all_day boolean DEFAULT false
);

-- Create event_reminders table
CREATE TABLE IF NOT EXISTS event_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  reminder_time timestamptz NOT NULL,
  reminder_type text CHECK (reminder_type IN ('email', 'push', 'in_app')) NOT NULL,
  sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
CREATE POLICY "Users can view events from their hubs"
  ON events FOR SELECT
  TO authenticated
  USING (
    hub_id IN (
      SELECT hub_id FROM hub_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create events in their hubs"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    hub_id IN (
      SELECT hub_id FROM hub_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update events in their hubs"
  ON events FOR UPDATE
  TO authenticated
  USING (
    hub_id IN (
      SELECT hub_id FROM hub_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete events in their hubs"
  ON events FOR DELETE
  TO authenticated
  USING (
    hub_id IN (
      SELECT hub_id FROM hub_members 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for event_reminders
CREATE POLICY "Users can view their own reminders"
  ON event_reminders FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    event_id IN (
      SELECT id FROM events 
      WHERE hub_id IN (
        SELECT hub_id FROM hub_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage reminders for their hub events"
  ON event_reminders FOR ALL
  TO authenticated
  USING (
    event_id IN (
      SELECT id FROM events 
      WHERE hub_id IN (
        SELECT hub_id FROM hub_members 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();

-- RPC Function: Get events for a specific month with attendee details
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

-- RPC Function: Create event with reminders
CREATE OR REPLACE FUNCTION create_event_with_reminders(
  p_hub_id uuid,
  p_title text,
  p_description text DEFAULT NULL,
  p_start_date timestamptz,
  p_end_date timestamptz DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_attendees uuid[] DEFAULT '{}',
  p_all_day boolean DEFAULT false,
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

  -- Insert event
  INSERT INTO events (
    hub_id, title, description, start_date, end_date, 
    location, attendees, all_day, created_by
  )
  VALUES (
    p_hub_id, p_title, p_description, p_start_date, p_end_date, 
    p_location, p_attendees, p_all_day, auth.uid()
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

-- RPC Function: Update event with reminders
CREATE OR REPLACE FUNCTION update_event_with_reminders(
  p_event_id uuid,
  p_title text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL,
  p_location text DEFAULT NULL,
  p_attendees uuid[] DEFAULT NULL,
  p_all_day boolean DEFAULT NULL,
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

  -- Update event (only update non-null values)
  UPDATE events SET
    title = COALESCE(p_title, title),
    description = COALESCE(p_description, description),
    start_date = COALESCE(p_start_date, start_date),
    end_date = COALESCE(p_end_date, end_date),
    location = COALESCE(p_location, location),
    attendees = COALESCE(p_attendees, attendees),
    all_day = COALESCE(p_all_day, all_day),
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

-- RPC Function: Delete event and its reminders
CREATE OR REPLACE FUNCTION delete_event_with_reminders(p_event_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Check if user can delete this event
  IF NOT EXISTS (
    SELECT 1 FROM events e
    JOIN hub_members hm ON e.hub_id = hm.hub_id
    WHERE e.id = p_event_id 
    AND hm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: User cannot delete this event';
  END IF;

  -- Delete event (reminders will be cascade deleted)
  DELETE FROM events WHERE id = p_event_id;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC Function: Get upcoming events for a user
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
    up.name as creator_name
  FROM events e
  JOIN user_profiles up ON e.created_by = up.id
  WHERE e.hub_id = p_hub_id
    AND e.start_date >= now()
  ORDER BY e.start_date
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_hub_id ON events(hub_id);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_attendees ON events USING GIN(attendees);
CREATE INDEX IF NOT EXISTS idx_event_reminders_event_id ON event_reminders(event_id);
CREATE INDEX IF NOT EXISTS idx_event_reminders_user_id ON event_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_event_reminders_reminder_time ON event_reminders(reminder_time);