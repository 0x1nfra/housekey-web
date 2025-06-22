/*
  # Hub Management System

  1. New Tables
    - `hubs`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `description` (text, optional)
      - `created_by` (uuid, references auth.users)
      - `settings` (jsonb, default '{}')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `hub_members`
      - `id` (uuid, primary key)
      - `hub_id` (uuid, references hubs)
      - `user_id` (uuid, references auth.users)
      - `role` (text, check constraint)
      - `joined_at` (timestamptz)
      - `invited_by` (uuid, references auth.users)
    
    - `hub_invitations`
      - `id` (uuid, primary key)
      - `hub_id` (uuid, references hubs)
      - `email` (text, not null)
      - `role` (text, check constraint)
      - `invited_by` (uuid, references auth.users)
      - `token` (text, unique)
      - `expires_at` (timestamptz)
      - `accepted_at` (timestamptz, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for hub access control
    - Role-based permissions (owner, manager, member)

  3. Functions
    - Auto-update timestamps
    - Hub member validation
    - Invitation token generation
*/

-- Create hubs table
CREATE TABLE IF NOT EXISTS hubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create hub_members table
CREATE TABLE IF NOT EXISTS hub_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id uuid REFERENCES hubs(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text CHECK (role IN ('owner', 'manager', 'member')) NOT NULL DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  invited_by uuid REFERENCES auth.users(id),
  UNIQUE(hub_id, user_id)
);

-- Create hub_invitations table
CREATE TABLE IF NOT EXISTS hub_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id uuid REFERENCES hubs(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  role text CHECK (role IN ('manager', 'member')) NOT NULL DEFAULT 'member',
  invited_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hubs
CREATE POLICY "Users can view hubs they are members of"
  ON hubs FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT hub_id FROM hub_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create hubs"
  ON hubs FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Hub owners and managers can update hubs"
  ON hubs FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT hub_id FROM hub_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Hub owners can delete hubs"
  ON hubs FOR DELETE
  TO authenticated
  USING (
    id IN (
      SELECT hub_id FROM hub_members 
      WHERE user_id = auth.uid() 
      AND role = 'owner'
    )
  );

-- RLS Policies for hub_members
CREATE POLICY "Users can view members of their hubs"
  ON hub_members FOR SELECT
  TO authenticated
  USING (
    hub_id IN (
      SELECT hub_id FROM hub_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Hub owners and managers can manage members"
  ON hub_members FOR ALL
  TO authenticated
  USING (
    hub_id IN (
      SELECT hub_id FROM hub_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'manager')
    )
  );

-- RLS Policies for hub_invitations
CREATE POLICY "Users can view invitations for their hubs"
  ON hub_invitations FOR SELECT
  TO authenticated
  USING (
    hub_id IN (
      SELECT hub_id FROM hub_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Hub owners and managers can manage invitations"
  ON hub_invitations FOR ALL
  TO authenticated
  USING (
    hub_id IN (
      SELECT hub_id FROM hub_members 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'manager')
    )
  );

-- Function to automatically add creator as owner when hub is created
CREATE OR REPLACE FUNCTION add_hub_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO hub_members (hub_id, user_id, role, invited_by)
  VALUES (NEW.id, NEW.created_by, 'owner', NEW.created_by);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to add creator as owner
CREATE TRIGGER add_hub_creator_as_owner_trigger
  AFTER INSERT ON hubs
  FOR EACH ROW
  EXECUTE FUNCTION add_hub_creator_as_owner();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_hub_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_hubs_updated_at
  BEFORE UPDATE ON hubs
  FOR EACH ROW
  EXECUTE FUNCTION update_hub_updated_at();

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
  DELETE FROM hub_invitations 
  WHERE expires_at < now() AND accepted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hub_members_hub_id ON hub_members(hub_id);
CREATE INDEX IF NOT EXISTS idx_hub_members_user_id ON hub_members(user_id);
CREATE INDEX IF NOT EXISTS idx_hub_invitations_hub_id ON hub_invitations(hub_id);
CREATE INDEX IF NOT EXISTS idx_hub_invitations_email ON hub_invitations(email);
CREATE INDEX IF NOT EXISTS idx_hub_invitations_token ON hub_invitations(token);