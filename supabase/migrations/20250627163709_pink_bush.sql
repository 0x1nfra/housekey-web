/*
  # Add Task Features: Categories and Recurring Tasks

  1. New Tables
    - `tasks_categories` table for user-defined task categories
  
  2. Table Updates
    - Add category_id to tasks table
    - Add recurring task fields to tasks table
    - Update get_hub_tasks_with_users function to include assigned user names and categories
  
  3. Security
    - Enable RLS on tasks_categories table
    - Add policies for category management
    - Update existing task policies
*/

-- Create tasks_categories table
CREATE TABLE IF NOT EXISTS tasks_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new columns to tasks table
DO $$
BEGIN
  -- Add category_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE tasks ADD COLUMN category_id UUID REFERENCES tasks_categories(id) ON DELETE SET NULL;
  END IF;

  -- Add recurring task columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'is_recurring'
  ) THEN
    ALTER TABLE tasks ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'recurrence_pattern'
  ) THEN
    ALTER TABLE tasks ADD COLUMN recurrence_pattern TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'recurrence_interval'
  ) THEN
    ALTER TABLE tasks ADD COLUMN recurrence_interval INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'next_due_date'
  ) THEN
    ALTER TABLE tasks ADD COLUMN next_due_date TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Add constraint for recurrence_pattern
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'tasks_recurrence_pattern_check'
  ) THEN
    ALTER TABLE tasks ADD CONSTRAINT tasks_recurrence_pattern_check 
    CHECK (recurrence_pattern IN ('daily', 'weekly', 'monthly', 'yearly') OR recurrence_pattern IS NULL);
  END IF;
END $$;

-- Enable RLS on tasks_categories
ALTER TABLE tasks_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for tasks_categories
CREATE POLICY "Users can manage their own categories" ON tasks_categories
  FOR ALL USING (auth.uid() = user_id);

-- Drop the existing function first to avoid return type conflict
DROP FUNCTION IF EXISTS get_hub_tasks_with_users(UUID);

-- Update the get_hub_tasks_with_users function to include categories and assigned user names
CREATE OR REPLACE FUNCTION get_hub_tasks_with_users(hub_uuid UUID)
RETURNS TABLE(
  id UUID,
  hub_id UUID,
  title TEXT,
  description TEXT,
  completed BOOLEAN,
  priority INTEGER,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  assigned_to UUID,
  created_by_email TEXT,
  assigned_to_email TEXT,
  assigned_to_name TEXT,
  category_id UUID,
  category_name TEXT,
  category_color TEXT,
  is_recurring BOOLEAN,
  recurrence_pattern TEXT,
  recurrence_interval INTEGER,
  next_due_date TIMESTAMP WITH TIME ZONE
) AS $$
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
    creator.email as created_by_email,
    assignee.email as assigned_to_email,
    assignee_profile.name as assigned_to_name,
    t.category_id,
    tc.name as category_name,
    tc.color as category_color,
    t.is_recurring,
    t.recurrence_pattern,
    t.recurrence_interval,
    t.next_due_date
  FROM tasks t
  LEFT JOIN auth.users creator ON t.created_by = creator.id
  LEFT JOIN auth.users assignee ON t.assigned_to = assignee.id
  LEFT JOIN user_profiles assignee_profile ON t.assigned_to = assignee_profile.id
  LEFT JOIN tasks_categories tc ON t.category_id = tc.id
  WHERE t.hub_id = hub_uuid
  ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create next recurring task instance
CREATE OR REPLACE FUNCTION create_next_recurring_task(task_id UUID)
RETURNS JSON AS $$
DECLARE
  task_record RECORD;
  next_due TIMESTAMP WITH TIME ZONE;
  new_task_id UUID;
BEGIN
  -- Get the task details
  SELECT * INTO task_record FROM tasks WHERE id = task_id AND is_recurring = TRUE;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Task not found or not recurring');
  END IF;
  
  -- Calculate next due date based on recurrence pattern
  CASE task_record.recurrence_pattern
    WHEN 'daily' THEN
      next_due := COALESCE(task_record.due_date, NOW()) + (task_record.recurrence_interval || ' days')::INTERVAL;
    WHEN 'weekly' THEN
      next_due := COALESCE(task_record.due_date, NOW()) + (task_record.recurrence_interval || ' weeks')::INTERVAL;
    WHEN 'monthly' THEN
      next_due := COALESCE(task_record.due_date, NOW()) + (task_record.recurrence_interval || ' months')::INTERVAL;
    WHEN 'yearly' THEN
      next_due := COALESCE(task_record.due_date, NOW()) + (task_record.recurrence_interval || ' years')::INTERVAL;
    ELSE
      RETURN json_build_object('success', false, 'error', 'Invalid recurrence pattern');
  END CASE;
  
  -- Create the new task instance
  INSERT INTO tasks (
    hub_id, title, description, priority, due_date, created_by, assigned_to,
    category_id, is_recurring, recurrence_pattern, recurrence_interval, next_due_date
  ) VALUES (
    task_record.hub_id,
    task_record.title,
    task_record.description,
    task_record.priority,
    next_due,
    task_record.created_by,
    task_record.assigned_to,
    task_record.category_id,
    task_record.is_recurring,
    task_record.recurrence_pattern,
    task_record.recurrence_interval,
    CASE 
      WHEN task_record.recurrence_pattern = 'daily' THEN next_due + (task_record.recurrence_interval || ' days')::INTERVAL
      WHEN task_record.recurrence_pattern = 'weekly' THEN next_due + (task_record.recurrence_interval || ' weeks')::INTERVAL
      WHEN task_record.recurrence_pattern = 'monthly' THEN next_due + (task_record.recurrence_interval || ' months')::INTERVAL
      WHEN task_record.recurrence_pattern = 'yearly' THEN next_due + (task_record.recurrence_interval || ' years')::INTERVAL
    END
  ) RETURNING id INTO new_task_id;
  
  RETURN json_build_object(
    'success', true,
    'new_task_id', new_task_id,
    'next_due_date', next_due
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user categories
CREATE OR REPLACE FUNCTION get_user_categories(user_uuid UUID)
RETURNS TABLE(
  id UUID,
  name TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    tc.id,
    tc.name,
    tc.color,
    tc.created_at
  FROM tasks_categories tc
  WHERE tc.user_id = user_uuid
  ORDER BY tc.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;