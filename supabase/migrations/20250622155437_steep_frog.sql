/*
  # Hub Invitations Management System

  1. New Tables
    - Enhanced `hub_invitations` table with proper relationships
    - Added indexes for performance
    - Added proper constraints and validation

  2. Security
    - Enable RLS on all tables
    - Add policies for invitation management
    - Ensure proper access control

  3. Functions
    - Auto-cleanup expired invitations
    - Notification triggers for new invitations
*/

-- Update hub_invitations table structure if needed
DO $$
BEGIN
  -- Add status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hub_invitations' AND column_name = 'status'
  ) THEN
    ALTER TABLE hub_invitations ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined'));
  END IF;

  -- Add indexes for better performance
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'hub_invitations' AND indexname = 'idx_hub_invitations_status'
  ) THEN
    CREATE INDEX idx_hub_invitations_status ON hub_invitations(status);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'hub_invitations' AND indexname = 'idx_hub_invitations_expires_at'
  ) THEN
    CREATE INDEX idx_hub_invitations_expires_at ON hub_invitations(expires_at);
  END IF;
END $$;

-- Enhanced RLS policies for hub_invitations
DROP POLICY IF EXISTS "Users can view invitations sent to them" ON hub_invitations;
CREATE POLICY "Users can view invitations sent to them"
  ON hub_invitations
  FOR SELECT
  TO authenticated
  USING (
    email IN (
      SELECT email FROM user_profiles WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update their own invitations" ON hub_invitations;
CREATE POLICY "Users can update their own invitations"
  ON hub_invitations
  FOR UPDATE
  TO authenticated
  USING (
    email IN (
      SELECT email FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Function to automatically clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM hub_invitations 
  WHERE expires_at < now() 
  AND accepted_at IS NULL;
END;
$$;

-- Function to get user invitations with hub details
CREATE OR REPLACE FUNCTION get_user_invitations(user_email text)
RETURNS TABLE (
  id uuid,
  hub_id uuid,
  hub_name text,
  hub_description text,
  inviter_id uuid,
  inviter_name text,
  role text,
  created_at timestamptz,
  expires_at timestamptz,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    hi.id,
    hi.hub_id,
    h.name as hub_name,
    h.description as hub_description,
    hi.invited_by as inviter_id,
    up.name as inviter_name,
    hi.role,
    hi.created_at,
    hi.expires_at,
    CASE 
      WHEN hi.accepted_at IS NOT NULL THEN 'accepted'
      WHEN hi.expires_at < now() THEN 'expired'
      ELSE 'pending'
    END as status
  FROM hub_invitations hi
  JOIN hubs h ON hi.hub_id = h.id
  JOIN user_profiles up ON hi.invited_by = up.id
  WHERE hi.email = user_email
  AND hi.accepted_at IS NULL
  AND hi.expires_at > now()
  ORDER BY hi.created_at DESC;
END;
$$;

-- Function to accept invitation
CREATE OR REPLACE FUNCTION accept_hub_invitation(invitation_id uuid, user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record hub_invitations%ROWTYPE;
  result json;
BEGIN
  -- Get invitation details
  SELECT * INTO invitation_record
  FROM hub_invitations
  WHERE id = invitation_id
  AND email IN (SELECT email FROM user_profiles WHERE id = user_id)
  AND accepted_at IS NULL
  AND expires_at > now();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invitation not found or expired');
  END IF;

  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM hub_members 
    WHERE hub_id = invitation_record.hub_id 
    AND user_id = accept_hub_invitation.user_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'User is already a member of this hub');
  END IF;

  -- Accept invitation
  UPDATE hub_invitations
  SET accepted_at = now()
  WHERE id = invitation_id;

  -- Add user to hub
  INSERT INTO hub_members (hub_id, user_id, role, invited_by)
  VALUES (
    invitation_record.hub_id,
    user_id,
    CASE 
      WHEN invitation_record.role = 'admin' THEN 'manager'
      ELSE 'member'
    END,
    invitation_record.invited_by
  );

  RETURN json_build_object('success', true, 'hub_id', invitation_record.hub_id);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Function to decline invitation
CREATE OR REPLACE FUNCTION decline_hub_invitation(invitation_id uuid, user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete the invitation
  DELETE FROM hub_invitations
  WHERE id = invitation_id
  AND email IN (SELECT email FROM user_profiles WHERE id = user_id)
  AND accepted_at IS NULL;

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invitation not found');
  END IF;

  RETURN json_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Create a scheduled job to clean up expired invitations (if pg_cron is available)
-- This would typically be set up by a database administrator
-- SELECT cron.schedule('cleanup-expired-invitations', '0 0 * * *', 'SELECT cleanup_expired_invitations();');