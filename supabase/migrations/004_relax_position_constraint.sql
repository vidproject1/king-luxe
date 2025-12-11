
-- Remove the unique constraint on (page_id, position) to allow easier reordering
-- and prevent issues when swapping items.
ALTER TABLE page_components DROP CONSTRAINT IF EXISTS page_components_page_id_position_key;
