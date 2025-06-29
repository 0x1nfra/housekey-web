-- First drop existing triggers if they exist
DROP TRIGGER IF EXISTS hub_invitation_accepted_notification ON hub_invitations;
DROP TRIGGER IF EXISTS hub_invitation_declined_notification ON hub_invitations;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS create_hub_invitation_accepted_notification();
DROP FUNCTION IF EXISTS create_hub_invitation_declined_notification();
DROP FUNCTION IF EXISTS accept_hub_invitation_notification();

-- Create a function to handle invitation acceptance notifications
CREATE OR REPLACE FUNCTION create_hub_invitation_accepted_notification()
RETURNS TRIGGER AS $$
DECLARE
  accepter_name TEXT;
  hub_name TEXT;
BEGIN
  -- Only trigger when accepted_at changes from NULL to a timestamp
  IF NEW.accepted_at IS NOT NULL AND OLD.accepted_at IS NULL THEN
    -- Get the name of the person who accepted the invitation
    SELECT name INTO accepter_name FROM user_profiles WHERE id = NEW.invitee;
    
    -- Get the hub name
    SELECT name INTO hub_name FROM hubs WHERE id = NEW.hub_id;
    
    -- Create notification for the person who sent the invitation
    INSERT INTO notifications (
      type,
      title,
      message,
      user_id,
      actor_id,
      related_id,
      related_type,
      priority,
      actionable,
      hub_id
    ) VALUES (
      'system',
      'Invitation Accepted',
      accepter_name || ' accepted your invitation to join the ' || hub_name || ' hub',
      NEW.invited_by,
      NEW.invitee,
      NEW.id,
      'hub_invitation',
      'medium',
      FALSE,
      NEW.hub_id
    );
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't prevent invitation update
    RAISE WARNING 'Error creating hub invitation accepted notification: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger for accepted invitations
CREATE TRIGGER hub_invitation_accepted_notification
AFTER UPDATE OF accepted_at ON hub_invitations
FOR EACH ROW
EXECUTE FUNCTION create_hub_invitation_accepted_notification();

-- Add a comment explaining the trigger
COMMENT ON TRIGGER hub_invitation_accepted_notification ON hub_invitations IS 
'Creates a notification for the inviter when someone accepts their hub invitation';

-- Modify the RPC function for accepting invitations to keep the record
CREATE OR REPLACE FUNCTION accept_hub_invitation(
  invitation_id UUID,
  user_id UUID
) RETURNS UUID AS $$
DECLARE
  v_hub_id UUID;
  v_role TEXT;
  v_invited_by UUID;
  v_email TEXT;
BEGIN
  -- Check if invitation exists and is valid
  SELECT hub_id, role, invited_by, email INTO v_hub_id, v_role, v_invited_by, v_email
  FROM hub_invitations
  WHERE id = invitation_id
    AND (invitee = user_id OR email = (SELECT email FROM user_profiles WHERE id = user_id))
    AND accepted_at IS NULL
    AND expires_at > NOW();
  
  IF v_hub_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;
  
  -- Add user to hub with the specified role
  INSERT INTO hub_members (hub_id, user_id, role, invited_by)
  VALUES (v_hub_id, user_id, v_role, v_invited_by);
  
  -- Mark invitation as accepted (instead of deleting it)
  UPDATE hub_invitations
  SET 
    accepted_at = NOW(),
    invitee = user_id
  WHERE id = invitation_id;
  
  RETURN v_hub_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function for handling invitation declination
CREATE OR REPLACE FUNCTION create_hub_invitation_declined_notification()
RETURNS TRIGGER AS $$
DECLARE
  decliner_name TEXT;
  hub_name TEXT;
BEGIN
  -- Get the name of the person who declined the invitation
  SELECT name INTO decliner_name FROM user_profiles WHERE id = auth.uid();
  
  -- Get the hub name
  SELECT name INTO hub_name FROM hubs WHERE id = OLD.hub_id;
  
  -- Create notification for the person who sent the invitation
  INSERT INTO notifications (
    type,
    title,
    message,
    user_id,
    actor_id,
    related_id,
    related_type,
    priority,
    actionable,
    hub_id
  ) VALUES (
    'system',
    'Invitation Declined',
    decliner_name || ' declined your invitation to join the ' || hub_name || ' hub',
    OLD.invited_by,
    auth.uid(),
    OLD.id,
    'hub_invitation',
    'medium',
    FALSE,
    OLD.hub_id
  );
  
  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't prevent invitation deletion
    RAISE WARNING 'Error creating hub invitation declined notification: %', SQLERRM;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger for declined invitations
CREATE TRIGGER hub_invitation_declined_notification
BEFORE DELETE ON hub_invitations
FOR EACH ROW
WHEN (OLD.invitee = auth.uid())
EXECUTE FUNCTION create_hub_invitation_declined_notification();

-- Add a comment explaining the trigger
COMMENT ON TRIGGER hub_invitation_declined_notification ON hub_invitations IS 
'Creates a notification for the inviter when someone declines their hub invitation';

-- Update the decline_hub_invitation function to properly handle declination
CREATE OR REPLACE FUNCTION decline_hub_invitation(
  invitation_id UUID,
  user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_hub_id UUID;
  v_invited_by UUID;
BEGIN
  -- Check if invitation exists and is valid
  SELECT hub_id, invited_by INTO v_hub_id, v_invited_by
  FROM hub_invitations
  WHERE id = invitation_id
    AND (invitee = user_id OR email = (SELECT email FROM user_profiles WHERE id = user_id))
    AND accepted_at IS NULL
    AND expires_at > NOW();
  
  IF v_hub_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;
  
  -- Update the invitee field to ensure the trigger can identify who declined
  UPDATE hub_invitations
  SET invitee = user_id
  WHERE id = invitation_id;
  
  -- Delete the invitation (this will trigger the declined notification)
  DELETE FROM hub_invitations
  WHERE id = invitation_id;
  
  RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;