/*
  # Fix notifications table RLS policy

  1. Security Changes
    - Add INSERT policy for notifications table to allow authenticated users to create notifications
    - This fixes the RLS violation when task creation triggers try to create notifications

  The policy allows authenticated users to insert notifications where they are the recipient (user_id matches auth.uid()).
  This is needed because database triggers create notifications when tasks are created, assigned, or completed.
*/

-- Add INSERT policy for notifications table
CREATE POLICY "Users can insert notifications for themselves"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);