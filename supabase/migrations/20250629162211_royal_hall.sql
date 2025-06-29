/*
  # Add Delete All Notifications Function

  1. New Functions
    - `delete_all_notifications` - Allows users to delete all their notifications
    - `delete_all_notifications_by_type` - Allows users to delete notifications by type

  2. Security
    - Functions are SECURITY DEFINER to ensure proper access control
    - Only authenticated users can execute these functions
    - Users can only delete their own notifications
*/

-- Drop the existing functions if they exist
DROP FUNCTION IF EXISTS delete_all_notifications(uuid);
DROP FUNCTION IF EXISTS delete_all_notifications_by_type(uuid, text);

-- Create function to delete all notifications for a user
CREATE OR REPLACE FUNCTION delete_all_notifications(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_count integer;
BEGIN
  -- Verify the user is deleting their own notifications
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'You can only delete your own notifications';
  END IF;

  -- Delete all notifications for the user
  DELETE FROM notifications 
  WHERE user_id = p_user_id;
  
  -- Get the count of affected rows
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  
  -- Return the count of notifications that were deleted
  RETURN affected_count;
END;
$$;

-- Create function to delete notifications by type
CREATE OR REPLACE FUNCTION delete_all_notifications_by_type(p_user_id uuid, p_type text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_count integer;
BEGIN
  -- Verify the user is deleting their own notifications
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'You can only delete your own notifications';
  END IF;

  -- Validate notification type
  IF p_type NOT IN ('event', 'task', 'shopping', 'system') THEN
    RAISE EXCEPTION 'Invalid notification type. Must be one of: event, task, shopping, system';
  END IF;

  -- Delete notifications of the specified type for the user
  DELETE FROM notifications 
  WHERE user_id = p_user_id
    AND type = p_type;
  
  -- Get the count of affected rows
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  
  -- Return the count of notifications that were deleted
  RETURN affected_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_all_notifications(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION delete_all_notifications_by_type(uuid, text) TO authenticated;