/*
  # Fix Event Update Notification Trigger

  1. Changes
     - Create or fix the event_update_notification trigger
     - Ensure notifications are created when events are updated
     - Add proper error handling

  2. Security
     - Works with existing RLS policies
*/

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
    NEW.description != OLD.description OR 
    NEW.start_date != OLD.start_date OR 
    NEW.end_date != OLD.end_date OR 
    NEW.location != OLD.location OR 
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