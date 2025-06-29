-- First drop existing triggers if they exist
DROP TRIGGER IF EXISTS hub_invitation_accepted_notification ON hub_invitations;
DROP TRIGGER IF EXISTS hub_invitation_declined_notification ON hub_invitations;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS create_hub_invitation_accepted_notification();
DROP FUNCTION IF EXISTS create_hub_invitation_declined_notification();

-- Create the function for hub invitation accepted notifications
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

-- Create the trigger
CREATE TRIGGER hub_invitation_accepted_notification
AFTER UPDATE OF accepted_at ON hub_invitations
FOR EACH ROW
EXECUTE FUNCTION create_hub_invitation_accepted_notification();

-- Add a comment explaining the trigger
COMMENT ON TRIGGER hub_invitation_accepted_notification ON hub_invitations IS 
'Creates a notification for the inviter when someone accepts their hub invitation';

-- Create a function for hub invitation declined notifications
CREATE OR REPLACE FUNCTION create_hub_invitation_declined_notification()
RETURNS TRIGGER AS $$
DECLARE
  decliner_name TEXT;
  hub_name TEXT;
BEGIN
  -- This trigger is called from the decline_hub_invitation RPC function
  -- which deletes the invitation after recording the decline
  
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