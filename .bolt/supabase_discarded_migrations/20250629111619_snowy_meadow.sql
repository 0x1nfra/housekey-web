-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('event', 'task', 'shopping', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  read boolean DEFAULT false,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  related_id uuid,
  related_type text,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  actionable boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  hub_id uuid NOT NULL REFERENCES hubs(id) ON DELETE CASCADE
);

-- Enable RLS if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'notifications' AND rowsecurity = true
  ) THEN
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist to avoid conflicts
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' AND policyname = 'Users can view their own notifications'
  ) THEN
    DROP POLICY "Users can view their own notifications" ON notifications;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' AND policyname = 'Users can update their own notifications'
  ) THEN
    DROP POLICY "Users can update their own notifications" ON notifications;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' AND policyname = 'Users can delete their own notifications'
  ) THEN
    DROP POLICY "Users can delete their own notifications" ON notifications;
  END IF;
END $$;

-- Create RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_user_id') THEN
    CREATE INDEX idx_notifications_user_id ON notifications(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_read') THEN
    CREATE INDEX idx_notifications_read ON notifications(read);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_created_at') THEN
    CREATE INDEX idx_notifications_created_at ON notifications(created_at);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_type') THEN
    CREATE INDEX idx_notifications_type ON notifications(type);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_related_id') THEN
    CREATE INDEX idx_notifications_related_id ON notifications(related_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_hub_id') THEN
    CREATE INDEX idx_notifications_hub_id ON notifications(hub_id);
  END IF;
END $$;

-- Function to create a task assignment notification
CREATE OR REPLACE FUNCTION create_task_assignment_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create notification if assigned_to is set and it's a new task or assignment changed
  IF NEW.assigned_to IS NOT NULL AND (TG_OP = 'INSERT' OR OLD.assigned_to IS NULL OR OLD.assigned_to <> NEW.assigned_to) THEN
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
    )
    VALUES (
      'task',
      'Task Assigned',
      'You have been assigned a new task: ' || NEW.title,
      NEW.assigned_to,
      NEW.created_by,
      NEW.id,
      'task',
      CASE 
        WHEN NEW.priority = 4 THEN 'high'
        WHEN NEW.priority = 3 THEN 'medium'
        ELSE 'low'
      END,
      true,
      NEW.hub_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS task_assignment_notification ON tasks;

-- Trigger for task assignment notifications
CREATE TRIGGER task_assignment_notification
  AFTER INSERT OR UPDATE OF assigned_to ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION create_task_assignment_notification();

-- Function to create a task completion notification
CREATE OR REPLACE FUNCTION create_task_completion_notification()
RETURNS TRIGGER AS $$
DECLARE
  task_creator uuid;
  task_title text;
  completer_name text;
BEGIN
  -- Only trigger when task is marked as completed
  IF NEW.completed = true AND (OLD.completed = false OR TG_OP = 'INSERT') THEN
    -- Get task creator and title
    SELECT created_by, title INTO task_creator, task_title FROM tasks WHERE id = NEW.id;
    
    -- Get completer name
    SELECT name INTO completer_name FROM user_profiles WHERE id = auth.uid();
    
    -- Only notify if the completer is not the creator
    IF task_creator IS NOT NULL AND task_creator <> auth.uid() THEN
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
      )
      VALUES (
        'task',
        'Task Completed',
        completer_name || ' completed the task: ' || task_title,
        task_creator,
        auth.uid(),
        NEW.id,
        'task',
        'low',
        false,
        NEW.hub_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS task_completion_notification ON tasks;

-- Trigger for task completion notifications
CREATE TRIGGER task_completion_notification
  AFTER UPDATE OF completed ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION create_task_completion_notification();

-- Function to create an event notification
CREATE OR REPLACE FUNCTION create_event_notification()
RETURNS TRIGGER AS $$
DECLARE
  attendee uuid;
  creator_name text;
BEGIN
  -- Get creator name
  SELECT name INTO creator_name FROM user_profiles WHERE id = NEW.created_by;
  
  -- Notify all attendees except the creator
  IF NEW.attendees IS NOT NULL AND array_length(NEW.attendees, 1) > 0 THEN
    FOREACH attendee IN ARRAY NEW.attendees
    LOOP
      IF attendee <> NEW.created_by THEN
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
        )
        VALUES (
          'event',
          'New Event',
          creator_name || ' added you to event: ' || NEW.title,
          attendee,
          NEW.created_by,
          NEW.id,
          'event',
          'medium',
          true,
          NEW.hub_id
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS event_creation_notification ON events;

-- Trigger for event creation notifications
CREATE TRIGGER event_creation_notification
  AFTER INSERT ON events
  FOR EACH ROW
  EXECUTE FUNCTION create_event_notification();

-- Function to create a shopping item completion notification
CREATE OR REPLACE FUNCTION create_shopping_item_completion_notification()
RETURNS TRIGGER AS $$
DECLARE
  item_creator uuid;
  item_name text;
  list_id uuid;
  list_name text;
  hub_id uuid;
  completer_name text;
BEGIN
  -- Only trigger when item is marked as completed
  IF NEW.is_completed = true AND OLD.is_completed = false THEN
    -- Get item details
    SELECT created_by, name, list_id INTO item_creator, item_name, list_id FROM shopping_list_items WHERE id = NEW.id;
    
    -- Get list name and hub_id
    SELECT name, hub_id INTO list_name, hub_id FROM shopping_lists WHERE id = list_id;
    
    -- Get completer name
    SELECT name INTO completer_name FROM user_profiles WHERE id = auth.uid();
    
    -- Only notify if the completer is not the creator
    IF item_creator IS NOT NULL AND item_creator <> auth.uid() THEN
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
      )
      VALUES (
        'shopping',
        'Shopping Item Completed',
        completer_name || ' purchased ' || item_name || ' from list: ' || list_name,
        item_creator,
        auth.uid(),
        NEW.id,
        'shopping_item',
        'low',
        false,
        hub_id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS shopping_item_completion_notification ON shopping_list_items;

-- Trigger for shopping item completion notifications
CREATE TRIGGER shopping_item_completion_notification
  AFTER UPDATE OF is_completed ON shopping_list_items
  FOR EACH ROW
  EXECUTE FUNCTION create_shopping_item_completion_notification();

-- Function to create a hub invitation notification
CREATE OR REPLACE FUNCTION create_hub_invitation_notification()
RETURNS TRIGGER AS $$
DECLARE
  invitee_id uuid;
  inviter_name text;
  hub_name text;
BEGIN
  -- Check if the invited email matches a user
  SELECT id INTO invitee_id FROM user_profiles WHERE email = NEW.email;
  
  -- Only create notification if we found a matching user
  IF invitee_id IS NOT NULL THEN
    -- Get inviter name
    SELECT name INTO inviter_name FROM user_profiles WHERE id = NEW.invited_by;
    
    -- Get hub name
    SELECT name INTO hub_name FROM hubs WHERE id = NEW.hub_id;
    
    -- Create notification
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
    )
    VALUES (
      'system',
      'Hub Invitation',
      inviter_name || ' invited you to join hub: ' || hub_name,
      invitee_id,
      NEW.invited_by,
      NEW.id,
      'hub_invitation',
      'high',
      true,
      NEW.hub_id
    );
    
    -- Update the invitation with the invitee id for easier tracking
    UPDATE hub_invitations SET invitee = invitee_id WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS hub_invitation_notification ON hub_invitations;

-- Trigger for hub invitation notifications
CREATE TRIGGER hub_invitation_notification
  AFTER INSERT ON hub_invitations
  FOR EACH ROW
  EXECUTE FUNCTION create_hub_invitation_notification();

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE notifications
  SET read = true
  WHERE user_id = p_user_id AND read = false
  RETURNING COUNT(*) INTO updated_count;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete read notifications older than a certain date
CREATE OR REPLACE FUNCTION delete_old_read_notifications(p_user_id uuid, p_days_old integer DEFAULT 30)
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM notifications
  WHERE user_id = p_user_id
    AND read = true
    AND created_at < (NOW() - (p_days_old || ' days')::interval)
  RETURNING COUNT(*) INTO deleted_count;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get notifications with actor details
CREATE OR REPLACE FUNCTION get_user_notifications(
  p_user_id uuid,
  p_limit integer DEFAULT 20,
  p_offset integer DEFAULT 0,
  p_type text DEFAULT NULL,
  p_read boolean DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  type text,
  title text,
  message text,
  created_at timestamptz,
  read boolean,
  user_id uuid,
  actor_id uuid,
  actor_name text,
  actor_email text,
  related_id uuid,
  related_type text,
  priority text,
  actionable boolean,
  metadata jsonb,
  hub_id uuid
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.type,
    n.title,
    n.message,
    n.created_at,
    n.read,
    n.user_id,
    n.actor_id,
    actor.name as actor_name,
    actor.email as actor_email,
    n.related_id,
    n.related_type,
    n.priority,
    n.actionable,
    n.metadata,
    n.hub_id
  FROM notifications n
  LEFT JOIN user_profiles actor ON n.actor_id = actor.id
  WHERE n.user_id = p_user_id
    AND (p_type IS NULL OR n.type = p_type)
    AND (p_read IS NULL OR n.read = p_read)
  ORDER BY n.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  count integer;
BEGIN
  SELECT COUNT(*) INTO count
  FROM notifications
  WHERE user_id = p_user_id AND read = false;
  
  RETURN count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add invitee column to hub_invitations if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hub_invitations' AND column_name = 'invitee'
  ) THEN
    ALTER TABLE hub_invitations ADD COLUMN invitee uuid REFERENCES user_profiles(id) ON UPDATE CASCADE;
  END IF;
END $$;