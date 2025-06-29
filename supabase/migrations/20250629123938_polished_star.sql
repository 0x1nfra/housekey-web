/*
  # Fix Notifications Table RLS Policies

  1. Security Changes
    - Add INSERT policy for notifications table to allow authenticated users to create notifications
    - Ensure all necessary policies exist for proper access control
    - Fix RLS violation when task creation triggers try to create notifications
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert notifications for themselves" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;

-- Create INSERT policy
CREATE POLICY "Users can insert notifications for themselves"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create UPDATE policy
CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create DELETE policy
CREATE POLICY "Users can delete their own notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create SELECT policy
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Make sure RLS is enabled on the notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;