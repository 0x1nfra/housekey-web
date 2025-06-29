/*
  # Fix mark_all_notifications_read RPC function

  1. Problem
    - The existing `mark_all_notifications_read` function uses aggregate functions in RETURNING clause
    - PostgreSQL doesn't allow aggregate functions in RETURNING clauses
    
  2. Solution
    - Remove the problematic aggregate function from RETURNING
    - Return a simple success indicator or count of affected rows
    - Perform the update operation without aggregate functions in RETURNING
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS mark_all_notifications_read(uuid);

-- Create the corrected function
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_count integer;
BEGIN
  -- Update all unread notifications for the user
  UPDATE notifications 
  SET read = true 
  WHERE user_id = p_user_id 
    AND read = false;
  
  -- Get the count of affected rows
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  
  -- Return the count of notifications that were marked as read
  RETURN affected_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION mark_all_notifications_read(uuid) TO authenticated;