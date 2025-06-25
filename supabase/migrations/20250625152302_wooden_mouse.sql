/*
  # Shopping Lists System

  1. New Tables
    - `shopping_lists`
      - `id` (uuid, primary key)
      - `hub_id` (uuid, references hubs)
      - `name` (text, not null)
      - `description` (text, nullable)
      - `created_by` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `shopping_list_items`
      - `id` (uuid, primary key)
      - `list_id` (uuid, references shopping_lists)
      - `name` (text, not null)
      - `quantity` (integer, default 1)
      - `category` (text, nullable)
      - `note` (text, nullable)
      - `is_completed` (boolean, default false)
      - `created_by` (uuid, references auth.users)
      - `completed_by` (uuid, references auth.users, nullable)
      - `completed_at` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `shopping_list_collaborators`
      - `id` (uuid, primary key)
      - `list_id` (uuid, references shopping_lists)
      - `user_id` (uuid, references auth.users)
      - `role` (text, check constraint)
      - `invited_by` (uuid, references auth.users)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Ensure hub membership validation

  3. Functions
    - Auto-update timestamps
    - Auto-add creator as owner
    - Completion tracking
*/

-- Create shopping_lists table
CREATE TABLE IF NOT EXISTS shopping_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id uuid REFERENCES hubs(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shopping_list_items table
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES shopping_lists(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  category text,
  note text,
  is_completed boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  completed_by uuid REFERENCES auth.users(id),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shopping_list_collaborators table
CREATE TABLE IF NOT EXISTS shopping_list_collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES shopping_lists(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text CHECK (role IN ('owner', 'editor', 'member')) NOT NULL DEFAULT 'member',
  invited_by uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(list_id, user_id)
);

-- Enable RLS
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_collaborators ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shopping_lists
CREATE POLICY "Users can view lists they collaborate on"
  ON shopping_lists FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT list_id FROM shopping_list_collaborators 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create lists in their hubs"
  ON shopping_lists FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    hub_id IN (
      SELECT hub_id FROM hub_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "List owners and editors can update lists"
  ON shopping_lists FOR UPDATE
  TO authenticated
  USING (
    id IN (
      SELECT list_id FROM shopping_list_collaborators 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'editor')
    )
  );

CREATE POLICY "List owners can delete lists"
  ON shopping_lists FOR DELETE
  TO authenticated
  USING (
    id IN (
      SELECT list_id FROM shopping_list_collaborators 
      WHERE user_id = auth.uid() 
      AND role = 'owner'
    )
  );

-- RLS Policies for shopping_list_items
CREATE POLICY "Users can view items from lists they collaborate on"
  ON shopping_list_items FOR SELECT
  TO authenticated
  USING (
    list_id IN (
      SELECT list_id FROM shopping_list_collaborators 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "List collaborators can add items"
  ON shopping_list_items FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() AND
    list_id IN (
      SELECT list_id FROM shopping_list_collaborators 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "List collaborators can update items"
  ON shopping_list_items FOR UPDATE
  TO authenticated
  USING (
    list_id IN (
      SELECT list_id FROM shopping_list_collaborators 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Item creators and list owners can delete items"
  ON shopping_list_items FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR
    list_id IN (
      SELECT list_id FROM shopping_list_collaborators 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'editor')
    )
  );

-- RLS Policies for shopping_list_collaborators
CREATE POLICY "Users can view collaborators of lists they collaborate on"
  ON shopping_list_collaborators FOR SELECT
  TO authenticated
  USING (
    list_id IN (
      SELECT list_id FROM shopping_list_collaborators 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "List owners can manage collaborators"
  ON shopping_list_collaborators FOR ALL
  TO authenticated
  USING (
    list_id IN (
      SELECT list_id FROM shopping_list_collaborators 
      WHERE user_id = auth.uid() 
      AND role = 'owner'
    )
  );

-- Function to automatically add creator as owner when list is created
CREATE OR REPLACE FUNCTION add_list_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO shopping_list_collaborators (list_id, user_id, role, invited_by)
  VALUES (NEW.id, NEW.created_by, 'owner', NEW.created_by);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to add creator as owner
CREATE TRIGGER add_list_creator_as_owner_trigger
  AFTER INSERT ON shopping_lists
  FOR EACH ROW
  EXECUTE FUNCTION add_list_creator_as_owner();

-- Function to update shopping_lists updated_at timestamp
CREATE OR REPLACE FUNCTION update_shopping_list_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update shopping_list_items updated_at timestamp
CREATE OR REPLACE FUNCTION update_shopping_item_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  
  -- If item is being completed, set completion details
  IF NEW.is_completed = true AND OLD.is_completed = false THEN
    NEW.completed_by = auth.uid();
    NEW.completed_at = now();
  ELSIF NEW.is_completed = false AND OLD.is_completed = true THEN
    NEW.completed_by = NULL;
    NEW.completed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to update updated_at
CREATE TRIGGER update_shopping_lists_updated_at
  BEFORE UPDATE ON shopping_lists
  FOR EACH ROW
  EXECUTE FUNCTION update_shopping_list_updated_at();

CREATE TRIGGER update_shopping_list_items_updated_at
  BEFORE UPDATE ON shopping_list_items
  FOR EACH ROW
  EXECUTE FUNCTION update_shopping_item_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shopping_lists_hub_id ON shopping_lists(hub_id);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_created_by ON shopping_lists(created_by);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_list_id ON shopping_list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_created_by ON shopping_list_items(created_by);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_is_completed ON shopping_list_items(is_completed);
CREATE INDEX IF NOT EXISTS idx_shopping_list_collaborators_list_id ON shopping_list_collaborators(list_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_collaborators_user_id ON shopping_list_collaborators(user_id);