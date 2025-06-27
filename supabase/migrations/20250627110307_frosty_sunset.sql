/*
  # Tasks System Implementation

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `hub_id` (uuid, references hubs)
      - `title` (text, not null)
      - `description` (text, nullable)
      - `completed` (boolean, default false)
      - `priority` (varchar, check constraint)
      - `due_date` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `created_by` (uuid, references auth.users)
      - `assigned_to` (uuid, references auth.users)

  2. Security
    - Enable RLS on tasks table
    - Add policies for hub-based access control

  3. Functions
    - Toggle task completion
    - Bulk update task priorities
    - Get tasks with user details
*/

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  hub_id UUID NOT NULL REFERENCES hubs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority VARCHAR(10) CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read tasks from their hubs" ON tasks
  FOR SELECT USING (
    hub_id IN (
      SELECT hub_id FROM hub_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tasks to their hubs" ON tasks
  FOR INSERT WITH CHECK (
    hub_id IN (
      SELECT hub_id FROM hub_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tasks in their hubs" ON tasks
  FOR UPDATE USING (
    hub_id IN (
      SELECT hub_id FROM hub_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tasks from their hubs" ON tasks
  FOR DELETE USING (
    hub_id IN (
      SELECT hub_id FROM hub_members 
      WHERE user_id = auth.uid()
    )
  );

-- Function to toggle task completion
CREATE OR REPLACE FUNCTION toggle_task_completion(task_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  UPDATE tasks 
  SET completed = NOT completed, updated_at = NOW()
  WHERE id = task_id;
  
  SELECT json_build_object(
    'success', true,
    'task_id', task_id,
    'completed', completed
  ) INTO result
  FROM tasks WHERE id = task_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to bulk update task priorities
CREATE OR REPLACE FUNCTION bulk_update_task_priority(task_ids UUID[], new_priority TEXT)
RETURNS JSON AS $$
BEGIN
  UPDATE tasks 
  SET priority = new_priority, updated_at = NOW()
  WHERE id = ANY(task_ids);
  
  RETURN json_build_object(
    'success', true,
    'updated_count', (SELECT COUNT(*) FROM tasks WHERE id = ANY(task_ids))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get tasks with user details
CREATE OR REPLACE FUNCTION get_hub_tasks_with_users(hub_uuid UUID)
RETURNS TABLE(
  id UUID,
  hub_id UUID,
  title TEXT,
  description TEXT,
  completed BOOLEAN,
  priority TEXT,
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
    t.priority,
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
  ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_hub_id ON tasks(hub_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);