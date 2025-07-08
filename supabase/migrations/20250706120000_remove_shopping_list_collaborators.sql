DROP TABLE IF EXISTS shopping_list_collaborators CASCADE;

DROP POLICY IF EXISTS "Users can view lists they collaborate on" ON shopping_lists;
DROP POLICY IF EXISTS "List owners and editors can update lists" ON shopping_lists;
DROP POLICY IF EXISTS "List owners can delete lists" ON shopping_lists;

DROP POLICY IF EXISTS "Users can view items from lists they collaborate on" ON shopping_list_items;
DROP POLICY IF EXISTS "List collaborators can add items" ON shopping_list_items;
DROP POLICY IF EXISTS "List collaborators can update items" ON shopping_list_items;
DROP POLICY IF EXISTS "Item creators and list owners can delete items" ON shopping_list_items;

DROP TRIGGER IF EXISTS add_list_creator_as_owner_trigger ON shopping_lists;
DROP FUNCTION IF EXISTS add_list_creator_as_owner();

CREATE POLICY "Users can view their own lists" ON shopping_lists FOR SELECT TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Users can update their own lists" ON shopping_lists FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Users can delete their own lists" ON shopping_lists FOR DELETE TO authenticated USING (created_by = auth.uid());

CREATE POLICY "Users can view items from their own lists" ON shopping_list_items FOR SELECT TO authenticated USING (list_id IN (SELECT id FROM shopping_lists WHERE created_by = auth.uid()));
CREATE POLICY "Users can add items to their own lists" ON shopping_list_items FOR INSERT TO authenticated WITH CHECK (list_id IN (SELECT id FROM shopping_lists WHERE created_by = auth.uid()));
CREATE POLICY "Users can update items in their own lists" ON shopping_list_items FOR UPDATE TO authenticated USING (list_id IN (SELECT id FROM shopping_lists WHERE created_by = auth.uid()));
CREATE POLICY "Users can delete items from their own lists" ON shopping_list_items FOR DELETE TO authenticated USING (list_id IN (SELECT id FROM shopping_lists WHERE created_by = auth.uid()));
