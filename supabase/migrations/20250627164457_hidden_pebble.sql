/*
  # Fix type mismatch in get_hub_tasks_with_users function

  1. Function Updates
    - Drop and recreate the `get_hub_tasks_with_users` function
    - Cast email columns to `text` type to match expected schema
    - Ensure all returned columns match the expected types

  2. Changes Made
    - Cast `created_by_email` and `assigned_to_email` columns to `text`
    - Maintain all existing functionality while fixing type compatibility
*/

-- Drop the existing function
DROP FUNCTION IF EXISTS get_hub_tasks_with_users(uuid);

-- Recreate the function with proper type casting
CREATE OR REPLACE FUNCTION get_hub_tasks_with_users(hub_uuid uuid)
RETURNS TABLE (
  id uuid,
  hub_id uuid,
  title text,
  description text,
  completed boolean,
  priority integer,
  due_date timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  created_by uuid,
  assigned_to uuid,
  created_by_email text,
  assigned_to_email text,
  category_id uuid,
  category_name text,
  category_color text,
  is_recurring boolean,
  recurrence_pattern text,
  recurrence_interval integer,
  next_due_date timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.hub_id,
    t.title,
    t.description,
    t.completed,
    t.priority,
    t.due_date,
    t.created_at,
    t.updated_at,
    t.created_by,
    t.assigned_to,
    cb.email::text as created_by_email,
    ab.email::text as assigned_to_email,
    t.category_id,
    tc.name as category_name,
    tc.color as category_color,
    t.is_recurring,
    t.recurrence_pattern,
    t.recurrence_interval,
    t.next_due_date
  FROM tasks t
  LEFT JOIN user_profiles cb ON t.created_by = cb.id
  LEFT JOIN user_profiles ab ON t.assigned_to = ab.id
  LEFT JOIN tasks_categories tc ON t.category_id = tc.id
  WHERE t.hub_id = hub_uuid
  ORDER BY t.created_at DESC;
END;
$$;