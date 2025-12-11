
-- Insert Shopping Cart page
INSERT INTO pages (title, slug, is_home)
SELECT 'Shopping Cart', 'shopping-cart', false
WHERE NOT EXISTS (SELECT 1 FROM pages WHERE slug = 'shopping-cart');

-- Insert Contact Us page
INSERT INTO pages (title, slug, is_home)
SELECT 'Contact Us', 'contact-us', false
WHERE NOT EXISTS (SELECT 1 FROM pages WHERE slug = 'contact-us');

-- Insert components using a DO block to handle IDs and logic
DO $$
DECLARE
  cart_page_id UUID;
  contact_page_id UUID;
  nav_comp_id UUID;
  footer_comp_id UUID;
BEGIN
  SELECT id INTO cart_page_id FROM pages WHERE slug = 'shopping-cart';
  SELECT id INTO contact_page_id FROM pages WHERE slug = 'contact-us';

  -- Setup Shopping Cart Page
  IF cart_page_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM page_components WHERE page_id = cart_page_id) THEN
    -- 1. Navigation
    INSERT INTO page_components (page_id, type, config, position)
    VALUES (cart_page_id, 'navigation', '{"backgroundColor": "#ffffff", "logoText": "Your Brand", "logoSize": "24px", "logoColor": "#000000", "linkColor": "#374151", "linkSize": "16px", "linkWeight": "500"}', 0)
    RETURNING id INTO nav_comp_id;

    -- 2. Cart Component
    INSERT INTO page_components (page_id, type, config, position)
    VALUES (cart_page_id, 'cart', '{"backgroundColor": "#f8fafc", "title": "Your Shopping Cart", "emptyText": "Your cart is currently empty."}', 1);

    -- 3. Footer
    INSERT INTO page_components (page_id, type, config, position)
    VALUES (cart_page_id, 'footer', '{"backgroundColor": "#1f2937", "textColor": "#ffffff", "copyrightText": "© 2024 Your Brand. All rights reserved."}', 2);
  END IF;

  -- Setup Contact Us Page
  IF contact_page_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM page_components WHERE page_id = contact_page_id) THEN
    -- 1. Navigation
    INSERT INTO page_components (page_id, type, config, position)
    VALUES (contact_page_id, 'navigation', '{"backgroundColor": "#ffffff", "logoText": "Your Brand", "logoSize": "24px", "logoColor": "#000000", "linkColor": "#374151", "linkSize": "16px", "linkWeight": "500"}', 0)
    RETURNING id INTO nav_comp_id;

    -- 2. Contact Form
    INSERT INTO page_components (page_id, type, config, position)
    VALUES (contact_page_id, 'contact_form', '{"backgroundColor": "#ffffff", "title": "Get in Touch", "titleSize": "30px", "submitButtonText": "Send Message", "emailPlaceholder": "Your Email", "messagePlaceholder": "Your Message"}', 1);

    -- 3. Footer
    INSERT INTO page_components (page_id, type, config, position)
    VALUES (contact_page_id, 'footer', '{"backgroundColor": "#1f2937", "textColor": "#ffffff", "copyrightText": "© 2024 Your Brand. All rights reserved."}', 2);
  END IF;

END $$;
