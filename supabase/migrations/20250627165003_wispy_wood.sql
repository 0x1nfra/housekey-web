/*
  # Update task categories to be hub-based instead of user-based

  1. Data Migration
    - Map existing user categories to their hubs
    - Handle users who are members of multiple hubs
    - Clean up orphaned categories

  2. Schema Changes
    - Change user_id column to hub_id
    - Update foreign key constraints
    - Update unique constraints

  3. Security Updates
    - Update RLS policies for hub-based access
    - Create new functions for hub-based category management
*/

-- First, let's create a temporary table to map user categories to hubs
CREATE TEMP TABLE category_hub_mapping AS
SELECT DISTINCT
  tc.id as category_id,
  tc.user_id,
  hm.hub_id,
  tc.name,
  tc.color,
  tc.created_at,
  -- If user is in multiple hubs, prefer the first one (by creation date)
  ROW_NUMBER() OVER (PARTITION BY tc.id ORDER BY h.created_at ASC) as hub_rank
FROM tasks_categories tc
JOIN hub_members hm ON tc.user_id = hm.user_id
JOIN hubs h ON hm.hub_id = h.id;

-- Delete categories that have no corresponding hub (orphaned categories)
DELETE FROM tasks_categories 
WHERE id NOT IN (SELECT category_id FROM category_hub_mapping);

-- Update tasks to remove references to categories that will be deleted
UPDATE tasks 
SET category_id = NULL 
WHERE category_id NOT IN (SELECT category_id FROM category_hub_mapping);

-- Drop existing policies and constraints
DROP POLICY IF EXISTS "Users can manage their own categories" ON tasks_categories;
DROP POLICY IF EXISTS "Users can view own categories" ON tasks_categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON tasks_categories;
DROP POLICY IF EXISTS "Users can update own categories" ON tasks_categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON tasks_categories;

-- Drop the unique constraint
ALTER TABLE tasks_categories DROP CONSTRAINT IF EXISTS unique_category_name_per_user;

-- Drop the foreign key constraint
ALTER TABLE tasks_categories DROP CONSTRAINT IF EXISTS tasks_categories_user_id_fkey;

-- Now update the existing categories with their corresponding hub_ids
UPDATE tasks_categories 
SET user_id = (
  SELECT hub_id 
  FROM category_hub_mapping 
  WHERE category_hub_mapping.category_id = tasks_categories.id 
  AND hub_rank = 1
);

-- Change user_id column to hub_id
ALTER TABLE tasks_categories 
RENAME COLUMN user_id TO hub_id;

-- Add foreign key constraint to hubs table
ALTER TABLE tasks_categories 
ADD CONSTRAINT tasks_categories_hub_id_fkey 
FOREIGN KEY (hub_id) REFERENCES hubs(id) ON DELETE CASCADE;

-- Add unique constraint for category name per hub
ALTER TABLE tasks_categories 
ADD CONSTRAINT unique_category_name_per_hub 
UNIQUE (hub_id, name);

-- Update RLS policies for hub-based access
CREATE POLICY "Hub members can view categories"
  ON tasks_categories
  FOR SELECT
  TO authenticated
  USING (
    hub_id IN (
      SELECT hub_members.hub_id
      FROM hub_members
      WHERE hub_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Hub members can insert categories"
  ON tasks_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    hub_id IN (
      SELECT hub_members.hub_id
      FROM hub_members
      WHERE hub_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Hub members can update categories"
  ON tasks_categories
  FOR UPDATE
  TO authenticated
  USING (
    hub_id IN (
      SELECT hub_members.hub_id
      FROM hub_members
      WHERE hub_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Hub members can delete categories"
  ON tasks_categories
  FOR DELETE
  TO authenticated
  USING (
    hub_id IN (
      SELECT hub_members.hub_id
      FROM hub_members
      WHERE hub_members.user_id = auth.uid()
    )
  );

-- Drop the old function
DROP FUNCTION IF EXISTS get_user_categories(uuid);

-- Create new function to get categories by hub
CREATE OR REPLACE FUNCTION get_hub_categories(hub_uuid uuid)
RETURNS TABLE (
  id uuid,
  hub_id uuid,
  name text,
  color text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is a member of the hub
  IF NOT EXISTS (
    SELECT 1 FROM hub_members 
    WHERE hub_members.hub_id = hub_uuid 
    AND hub_members.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not a member of this hub';
  END IF;

  RETURN QUERY
  SELECT 
    tc.id,
    tc.hub_id,
    tc.name,
    tc.color,
    tc.created_at
  FROM tasks_categories tc
  WHERE tc.hub_id = hub_uuid
  ORDER BY tc.name;
END;
$$;

-- Update the get_hub_tasks_with_users function to use the new structure
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
  assigned_to_name text,
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
  -- Check if user is a member of the hub
  IF NOT EXISTS (
    SELECT 1 FROM hub_members 
    WHERE hub_members.hub_id = hub_uuid 
    AND hub_members.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: User is not a member of this hub';
  END IF;

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
    ab.name::text as assigned_to_name,
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