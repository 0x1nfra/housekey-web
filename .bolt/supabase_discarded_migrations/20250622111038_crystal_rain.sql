/*
  # Add Foreign Key Relationship Between hub_members and user_profiles

  1. Schema Changes
    - Verify user_id column exists in hub_members (already exists)
    - Add foreign key constraint to user_profiles table
    - Create indexes for optimal join performance
    - Handle existing data validation

  2. Data Integrity
    - Validate existing relationships
    - Handle orphaned records if any
    - Ensure referential integrity

  3. Performance
    - Add composite indexes for common query patterns
    - Optimize for PostgREST automatic joins

  4. Security
    - Maintain existing RLS policies
    - Ensure foreign key doesn't break security model

  Note: The hub_members.user_id column already exists and references auth.users(id).
  This migration adds a relationship to user_profiles for easier joins and data access.
*/

-- Start transaction
BEGIN;

-- Step 1: Verify the current state and add validation
DO $$
BEGIN
  -- Check if user_id column exists in hub_members (should already exist)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'hub_members' 
    AND column_name = 'user_id'
  ) THEN
    RAISE EXCEPTION 'user_id column does not exist in hub_members table. Please check the schema.';
  END IF;

  -- Check if user_profiles table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'user_profiles'
  ) THEN
    RAISE EXCEPTION 'user_profiles table does not exist. Please run user profiles migration first.';
  END IF;

  RAISE NOTICE 'Schema validation passed. Proceeding with migration.';
END $$;

-- Step 2: Data integrity check - identify any orphaned records
DO $$
DECLARE
  orphaned_count INTEGER;
BEGIN
  -- Count hub_members records that don't have corresponding user_profiles
  SELECT COUNT(*) INTO orphaned_count
  FROM hub_members hm
  LEFT JOIN user_profiles up ON hm.user_id = up.id
  WHERE up.id IS NULL;

  IF orphaned_count > 0 THEN
    RAISE WARNING 'Found % hub_members records without corresponding user_profiles. These will need to be handled.', orphaned_count;
    
    -- Log the orphaned records for reference
    RAISE NOTICE 'Orphaned hub_members user_ids: %', (
      SELECT string_agg(hm.user_id::text, ', ')
      FROM hub_members hm
      LEFT JOIN user_profiles up ON hm.user_id = up.id
      WHERE up.id IS NULL
    );
  ELSE
    RAISE NOTICE 'No orphaned records found. All hub_members have corresponding user_profiles.';
  END IF;
END $$;

-- Step 3: Create missing user_profiles for any orphaned hub_members
-- This ensures referential integrity before adding the foreign key
INSERT INTO user_profiles (id, name, email, created_at, updated_at)
SELECT DISTINCT 
  hm.user_id,
  COALESCE(au.email, 'Unknown User') as name,
  COALESCE(au.email, 'unknown@example.com') as email,
  COALESCE(au.created_at, now()) as created_at,
  now() as updated_at
FROM hub_members hm
LEFT JOIN user_profiles up ON hm.user_id = up.id
LEFT JOIN auth.users au ON hm.user_id = au.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 4: Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  -- Check if the foreign key constraint already exists
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema    = kcu.table_schema
    JOIN information_schema.referential_constraints rc
      ON tc.constraint_name = rc.constraint_name
      AND tc.table_schema    = rc.constraint_schema
    JOIN information_schema.key_column_usage kcu2
      ON rc.unique_constraint_name = kcu2.constraint_name
      AND rc.unique_constraint_schema = kcu2.constraint_schema
    WHERE tc.table_name      = 'hub_members'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name    = 'user_id'
      AND kcu2.table_name    = 'user_profiles'
      AND kcu2.column_name   = 'id'
  ) THEN
    -- Add the foreign key constraint
    ALTER TABLE hub_members 
    ADD CONSTRAINT fk_hub_members_user_profiles 
    FOREIGN KEY (user_id) 
    REFERENCES user_profiles(id) 
    ON UPDATE CASCADE 
    ON DELETE CASCADE;
    
    RAISE NOTICE 'Added foreign key constraint: fk_hub_members_user_profiles';
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists between hub_members and user_profiles';
  END IF;
END $$;

-- Step 5: Create optimized indexes for join performance
-- Index for hub_members.user_id (if not already exists from previous migration)
CREATE INDEX IF NOT EXISTS idx_hub_members_user_id_profiles 
ON hub_members(user_id);

-- Composite index for common query patterns (hub + user lookups)
CREATE INDEX IF NOT EXISTS idx_hub_members_hub_user_composite 
ON hub_members(hub_id, user_id);

-- Index for user_profiles.id (should already exist as primary key, but ensuring)
-- This is automatically created for primary keys, but we'll verify
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'user_profiles' 
    AND indexname = 'user_profiles_pkey'
  ) THEN
    RAISE WARNING 'Primary key index missing on user_profiles.id';
  END IF;
END $$;

-- Step 6: Update RLS policies to work with the new relationship
-- Ensure that the existing RLS policies on hub_members still work correctly
-- and that joins with user_profiles are properly secured

-- Verify that user_profiles RLS policies allow the necessary access
DO $$
BEGIN
  -- Check if user_profiles has RLS enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'user_profiles' 
    AND rowsecurity = true
  ) THEN
    RAISE WARNING 'RLS is not enabled on user_profiles table. This may affect security.';
  END IF;
END $$;

-- Step 7: Create a view for easier hub member queries with user details
-- This view will be useful for PostgREST and application queries
CREATE OR REPLACE VIEW hub_members_with_profiles AS
SELECT 
  hm.id,
  hm.hub_id,
  hm.user_id,
  hm.role,
  hm.joined_at,
  hm.invited_by,
  up.name as user_name,
  up.email as user_email,
  up.created_at as user_created_at
FROM hub_members hm
JOIN user_profiles up ON hm.user_id = up.id;

-- Apply RLS to the view
ALTER VIEW hub_members_with_profiles SET (security_barrier = true);

-- Create RLS policy for the view
DROP POLICY IF EXISTS "Users can view hub members with profiles" ON hub_members_with_profiles;
CREATE POLICY "Users can view hub members with profiles"
  ON hub_members_with_profiles FOR SELECT
  TO authenticated
  USING (
    hub_id IN (
      SELECT hub_id FROM hub_members 
      WHERE user_id = auth.uid()
    )
  );

-- Step 8: Add helpful functions for common operations
-- Function to get hub members with user details
CREATE OR REPLACE FUNCTION get_hub_members_with_profiles(target_hub_id uuid)
RETURNS TABLE (
  member_id   uuid,
  hub_id      uuid,
  user_id     uuid,
  role        text,
  joined_at   timestamptz,
  invited_by  uuid,
  user_name   text,
  user_email  text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
-- (lines 221–245: function body unchanged)
$$;
BEGIN
  -- Verify user has access to this hub
  IF NOT EXISTS (
    SELECT 1 FROM hub_members 
    WHERE hub_members.hub_id = target_hub_id 
      AND hub_members.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied to hub %', target_hub_id;
  END IF;

  RETURN QUERY
  SELECT 
    hm.id as member_id,
    hm.hub_id,
    hm.user_id,
    hm.role,
    hm.joined_at,
    hm.invited_by,
    up.name as user_name,
    up.email as user_email
  FROM hub_members hm
  JOIN user_profiles up ON hm.user_id = up.id
  WHERE hm.hub_id = target_hub_id
  ORDER BY hm.joined_at;
END $$;

-- Step 9: Create validation function to ensure data integrity
CREATE OR REPLACE FUNCTION validate_hub_member_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure the user_profile exists when inserting/updating hub_members
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'User profile does not exist for user_id: %', NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate on insert/update
DROP TRIGGER IF EXISTS validate_hub_member_user_profile_trigger ON hub_members;
CREATE TRIGGER validate_hub_member_user_profile_trigger
  BEFORE INSERT OR UPDATE ON hub_members
  FOR EACH ROW
  EXECUTE FUNCTION validate_hub_member_user_profile();

-- Step 10: Add comments for documentation
COMMENT ON CONSTRAINT fk_hub_members_user_profiles ON hub_members IS 
'Foreign key linking hub members to user profiles for enhanced data access and joins';

COMMENT ON INDEX idx_hub_members_user_id_profiles IS 
'Index to optimize joins between hub_members and user_profiles';

COMMENT ON INDEX idx_hub_members_hub_user_composite IS 
'Composite index for efficient hub and user lookups';

COMMENT ON VIEW hub_members_with_profiles IS 
'View combining hub members with user profile information for easier querying';

COMMENT ON FUNCTION get_hub_members_with_profiles(uuid) IS 
'Secure function to retrieve hub members with user profile details';

-- Step 11: Final validation
DO $$
DECLARE
  constraint_count INTEGER;
  index_count INTEGER;
BEGIN
  -- Verify foreign key constraint was created
  SELECT COUNT(*) INTO constraint_count
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_name = 'hub_members'
  AND tc.constraint_type = 'FOREIGN KEY'
  AND kcu.column_name = 'user_id'
  AND kcu.referenced_table_name = 'user_profiles';

  -- Verify indexes were created
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes 
  WHERE tablename = 'hub_members' 
  AND (indexname = 'idx_hub_members_user_id_profiles' OR indexname = 'idx_hub_members_hub_user_composite');

  IF constraint_count = 0 THEN
    RAISE EXCEPTION 'Foreign key constraint was not created successfully';
  END IF;

  IF index_count < 2 THEN
    RAISE WARNING 'Not all expected indexes were created. Expected 2, found %', index_count;
  END IF;

  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Foreign key constraints: %', constraint_count;
  RAISE NOTICE 'Indexes created: %', index_count;
END $$;

-- Commit the transaction
COMMIT;

-- Rollback script (commented out - uncomment if rollback is needed)
/*
-- ROLLBACK SCRIPT - Uncomment and run if you need to reverse this migration

BEGIN;

-- Drop the view
DROP VIEW IF EXISTS hub_members_with_profiles;

-- Drop the function
DROP FUNCTION IF EXISTS get_hub_members_with_profiles(uuid);

-- Drop the validation function and trigger
DROP TRIGGER IF EXISTS validate_hub_member_user_profile_trigger ON hub_members;
DROP FUNCTION IF EXISTS validate_hub_member_user_profile();

-- Drop the indexes
DROP INDEX IF EXISTS idx_hub_members_user_id_profiles;
DROP INDEX IF EXISTS idx_hub_members_hub_user_composite;

-- Drop the foreign key constraint
ALTER TABLE hub_members DROP CONSTRAINT IF EXISTS fk_hub_members_user_profiles;

COMMIT;
*/