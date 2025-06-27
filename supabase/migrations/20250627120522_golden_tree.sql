/*
  # Implement Numeric Priority Enum System

  1. Database Changes
    - Update tasks table to use INTEGER for priority
    - Add constraint to ensure valid priority values (1-4)
    - Update RPC function to return INTEGER priority
    - Migrate existing text priorities to numeric values

  2. Priority Mapping
    - 1 = Low
    - 2 = Medium  
    - 3 = High
    - 4 = Urgent
*/

-- First, update existing priority values to numeric equivalents
UPDATE tasks 
SET priority = CASE 
  WHEN priority = 'low' THEN '1'
  WHEN priority = 'medium' THEN '2'  
  WHEN priority = 'high' THEN '3'
  ELSE '2'  -- Default to medium for any unexpected values
END;

-- Change the column type to INTEGER
ALTER TABLE tasks 
ALTER COLUMN priority TYPE INTEGER 
USING priority::INTEGER;

-- Add constraint to ensure valid priority values (1-4)
ALTER TABLE tasks 
ADD CONSTRAINT check_priority_range 
CHECK (priority >= 1 AND priority <= 4);

-- Set default value to 2 (medium)
ALTER TABLE tasks 
ALTER COLUMN priority SET DEFAULT 2;

-- Drop and recreate the get_hub_tasks_with_users function with INTEGER priority
DROP FUNCTION IF EXISTS get_hub_tasks_with_users(UUID);

CREATE OR REPLACE FUNCTION get_hub_tasks_with_users(hub_uuid UUID)
RETURNS TABLE(
  id UUID,
  hub_id UUID,
  title TEXT,
  description TEXT,
  completed BOOLEAN,
  priority INTEGER,  -- Use INTEGER instead of TEXT/VARCHAR
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  assigned_to UUID,
  created_by_email TEXT,
  assigned_to_email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.hub_id,
    t.title,
    t.description,
    t.completed,
    t.priority,  -- No casting needed since it's already INTEGER
    t.due_date,
    t.created_at,
    t.updated_at,
    t.created_by,
    t.assigned_to,
    creator.email as created_by_email,
    assignee.email as assigned_to_email
  FROM tasks t
  LEFT JOIN auth.users creator ON t.created_by = creator.id
  LEFT JOIN auth.users assignee ON t.assigned_to = assignee.id
  WHERE t.hub_id = hub_uuid
  ORDER BY t.priority DESC, t.created_at DESC;  -- Order by priority (high to low), then by creation date
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the bulk_update_task_priority function to accept INTEGER
DROP FUNCTION IF EXISTS bulk_update_task_priority(UUID[], TEXT);

CREATE OR REPLACE FUNCTION bulk_update_task_priority(task_ids UUID[], new_priority INTEGER)
RETURNS JSON AS $$
BEGIN
  -- Validate priority value
  IF new_priority < 1 OR new_priority > 4 THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Priority must be between 1 and 4'
    );
  END IF;

  UPDATE tasks 
  SET priority = new_priority, updated_at = NOW()
  WHERE id = ANY(task_ids);
  
  RETURN json_build_object(
    'success', true,
    'updated_count', (SELECT COUNT(*) FROM tasks WHERE id = ANY(task_ids))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;