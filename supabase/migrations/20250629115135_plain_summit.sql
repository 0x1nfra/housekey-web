/*
  # Fix Event Notification Trigger

  1. Changes
     - Improve event notification trigger to properly create notifications
     - Ensure notifications are created for all relevant hub members
     - Add proper error handling

  2. Security
     - Maintains existing RLS policies
*/

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS event_creation_notification ON public.events;

-- Create an improved version of the function
CREATE OR REPLACE FUNCTION create_event_notification()
RETURNS TRIGGER AS $$
DECLARE
  event_title TEXT;
  creator_name TEXT;
  hub_member RECORD;
BEGIN
  -- Get the name of the person who created the event
  SELECT name INTO creator_name FROM user_profiles WHERE id = NEW.created_by;
  
  -- Set event title
  event_title := NEW.title;
  
  -- Create notifications for all hub members
  FOR hub_member IN 
    SELECT user_id FROM hub_members WHERE hub_id = NEW.hub_id
  LOOP
    -- Skip creating notification for the event creator
    IF hub_member.user_id != NEW.created_by THEN
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
        'New Event Added',
        creator_name || ' added "' || event_title || '" to the calendar',
        hub_member.user_id,
        NEW.created_by,
        NEW.id,
        'event',
        'medium',
        TRUE,
        NEW.hub_id
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't prevent event creation
    RAISE WARNING 'Error creating event notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger
CREATE TRIGGER event_creation_notification
AFTER INSERT ON public.events
FOR EACH ROW
EXECUTE FUNCTION create_event_notification();

-- Add a comment explaining the trigger
COMMENT ON TRIGGER event_creation_notification ON public.events IS 
'Creates notifications for all hub members when a new event is created';