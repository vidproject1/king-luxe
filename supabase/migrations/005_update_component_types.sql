
-- Update the check constraint to include new component types
ALTER TABLE page_components DROP CONSTRAINT IF EXISTS page_components_type_check;

ALTER TABLE page_components ADD CONSTRAINT page_components_type_check 
  CHECK (type IN ('navigation', 'hero', 'product_grid', 'footer', 'contact_form', 'cart'));
