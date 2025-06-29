/*
  # Fix Event Update Notification Trigger

  1. Schema Changes
     - Add updated_by column to events table to track who updated an event
     - Update the event_update_notification trigger function to use this column
     - Ensure the trigger properly creates notifications for all hub members

  2. Changes
     - Add updated_by column to events table
     - Modify the update_events_updated_at trigger to also set updated_by
     - Fix the event_update_notification function to properly create notifications
*/

-- Add updated_by column to events table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'updated_by'
  ) THEN
    ALTER TABLE events ADD COLUMN updated_by uuid REFERENCES user_profiles(id);
  END IF;
END $$;

-- Update the update_events_updated_at function to also set updated_by
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS event_update_notification ON public.events;

-- Create an improved version of the function
CREATE OR REPLACE FUNCTION event_update_notification()
RETURNS TRIGGER AS $$
DECLARE
  event_title TEXT;
  updater_name TEXT;
  hub_member RECORD;
BEGIN
  -- Only proceed if there are meaningful changes
  IF (
    NEW.title != OLD.title OR 
    NEW.description IS DISTINCT FROM OLD.description OR 
    NEW.start_date != OLD.start_date OR 
    NEW.end_date IS DISTINCT FROM OLD.end_date OR 
    NEW.location IS DISTINCT FROM OLD.location OR 
    NEW.all_day != OLD.all_day OR
    NEW.event_type != OLD.event_type
  ) THEN
    -- Get the name of the person who updated the event
    SELECT name INTO updater_name FROM user_profiles WHERE id = auth.uid();
    
    -- Set event title
    event_title := NEW.title;
    
    -- Create notifications for all hub members
    FOR hub_member IN 
      SELECT user_id FROM hub_members WHERE hub_id = NEW.hub_id
    LOOP
      -- Skip creating notification for the person who updated the event
      IF hub_member.user_id != auth.uid() THEN
        INSERT INTO notifications (
          type,
          title,
          message,
          user_id,
          actor_id,
          related_id,
          related_type,
          priority,
          actionable,
          hub_id
        ) VALUES (
          'event',
          'Event Updated',
          updater_name || ' updated "' || event_title || '" in the calendar',
          hub_member.user_id,
          auth.uid(),
          NEW.id,
          'event',
          'medium',
          TRUE,
          NEW.hub_id
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't prevent event update
    RAISE WARNING 'Error creating event update notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER event_update_notification
AFTER UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION event_update_notification();

-- Add a comment explaining the trigger
COMMENT ON TRIGGER event_update_notification ON public.events IS 
'Creates notifications for all hub members when an event is updated';