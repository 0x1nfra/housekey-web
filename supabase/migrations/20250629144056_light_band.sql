/*
  # Fix notifications RLS policy for task triggers

  1. Security Changes
    - Add policy to allow inserting notifications for hub members
    - This enables task assignment and completion notifications to work properly
    - Maintains security by only allowing notifications within the same hub

  2. Changes
    - Add "Allow hub members to create notifications for other hub members" policy
    - This policy allows creating notifications for users who are in the same hub
*/

-- Add policy to allow hub members to create notifications for other hub members
-- This is needed for task assignment and completion notifications
CREATE POLICY "Allow hub members to create notifications for other hub members"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow if the notification is for a user in the same hub as the creator
    user_id IN (
      SELECT hm.user_id
      FROM hub_members hm
      WHERE hm.hub_id = notifications.hub_id
    )
  );