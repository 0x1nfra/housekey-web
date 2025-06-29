/*
  # Fix Notifications RLS Policies

  1. Changes
     - Ensure proper RLS policies exist for notifications table
     - Add missing INSERT policy for notifications
     - Fix UPDATE and DELETE policies

  2. Security
     - Maintains proper row-level security
     - Ensures users can only access their own notifications
*/

-- First, check if the INSERT policy already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND operation = 'INSERT' 
    AND cmd = 'INSERT'
  ) THEN
    -- Create INSERT policy if it doesn't exist
    CREATE POLICY "Users can insert notifications for themselves"
      ON notifications
      FOR INSERT
      TO public
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- Ensure UPDATE policy exists and is correct
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND operation = 'UPDATE' 
    AND cmd = 'UPDATE'
  ) THEN
    -- Create UPDATE policy if it doesn't exist
    CREATE POLICY "Users can update their own notifications"
      ON notifications
      FOR UPDATE
      TO public
      USING (user_id = auth.uid());
  END IF;
END
$$;

-- Ensure DELETE policy exists and is correct
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND operation = 'DELETE' 
    AND cmd = 'DELETE'
  ) THEN
    -- Create DELETE policy if it doesn't exist
    CREATE POLICY "Users can delete their own notifications"
      ON notifications
      FOR DELETE
      TO public
      USING (user_id = auth.uid());
  END IF;
END
$$;

-- Ensure SELECT policy exists and is correct
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'notifications' 
    AND operation = 'SELECT' 
    AND cmd = 'SELECT'
  ) THEN
    -- Create SELECT policy if it doesn't exist
    CREATE POLICY "Users can view their own notifications"
      ON notifications
      FOR SELECT
      TO public
      USING (user_id = auth.uid());
  END IF;
END
$$;

-- Make sure RLS is enabled on the notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;