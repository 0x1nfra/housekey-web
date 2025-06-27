/*
  # Fix Task RPC Function Return Type

  1. Problem
    - The `get_hub_tasks_with_users` RPC function returns `character varying(10)` for priority column
    - Client expects `text` type, causing schema mismatch error

  2. Solution
    - Update the RPC function to return `text` instead of `character varying(10)` for priority column
    - This aligns with the Task interface in the client application
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS get_hub_tasks_with_users(UUID);

-- Recreate the function with correct return types
CREATE OR REPLACE FUNCTION get_hub_tasks_with_users(hub_uuid UUID)
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  completed BOOLEAN,
  priority TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_by_email TEXT,
  assigned_to_email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.title,
    t.description,
    t.completed,
    t.priority::TEXT,  -- Explicitly cast to TEXT to ensure correct return type
    t.due_date,
    t.created_at,
    t.updated_at,
    creator.email as created_by_email,
    assignee.email as assigned_to_email
  FROM tasks t
  LEFT JOIN auth.users creator ON t.created_by = creator.id
  LEFT JOIN auth.users assignee ON t.assigned_to = assignee.id
  WHERE t.hub_id = hub_uuid
  ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;