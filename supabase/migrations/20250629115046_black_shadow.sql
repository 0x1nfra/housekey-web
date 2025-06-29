/*
  # Fix Task Completion Notification Trigger

  1. Changes
     - Fix the task_completion_notification trigger to properly create notifications
     - Ensure notifications are created for all hub members when a task is completed
     - Add proper error handling

  2. Security
     - Maintains existing RLS policies
*/

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS task_completion_notification ON public.tasks;

-- Create an improved version of the function
CREATE OR REPLACE FUNCTION create_task_completion_notification()
RETURNS TRIGGER AS $$
DECLARE
  task_title TEXT;
  task_hub_id UUID;
  completer_name TEXT;
  hub_member RECORD;
BEGIN
  -- Only proceed if the task was marked as completed
  IF (NEW.completed = TRUE AND OLD.completed = FALSE) THEN
    -- Get task information
    SELECT title, hub_id INTO task_title, task_hub_id FROM tasks WHERE id = NEW.id;
    
    -- Get the name of the person who completed the task
    SELECT name INTO completer_name FROM user_profiles WHERE id = auth.uid();
    
    -- Create notifications for all hub members
    FOR hub_member IN 
      SELECT user_id FROM hub_members WHERE hub_id = task_hub_id
    LOOP
      -- Skip creating notification for the person who completed the task
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
          'task',
          'Task Completed',
          completer_name || ' completed "' || task_title || '"',
          hub_member.user_id,
          auth.uid(),
          NEW.id,
          'task',
          'medium',
          TRUE,
          task_hub_id
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't prevent task update
    RAISE WARNING 'Error creating task completion notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger
CREATE TRIGGER task_completion_notification
AFTER UPDATE OF completed ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION create_task_completion_notification();

-- Add a comment explaining the trigger
COMMENT ON TRIGGER task_completion_notification ON public.tasks IS 
'Creates notifications for all hub members when a task is marked as completed';