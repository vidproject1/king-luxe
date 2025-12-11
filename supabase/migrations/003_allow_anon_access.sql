-- Allow anonymous users to fully manage content (for development)
-- This is necessary because the frontend is not currently implementing authentication
-- and we need to allow the 'anon' role to INSERT/UPDATE/DELETE rows.

DROP POLICY IF EXISTS "Allow public full access on pages" ON pages;
CREATE POLICY "Allow public full access on pages" ON pages
    FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access on page_components" ON page_components;
CREATE POLICY "Allow public full access on page_components" ON page_components
    FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public full access on navigation_links" ON navigation_links;
CREATE POLICY "Allow public full access on navigation_links" ON navigation_links
    FOR ALL TO anon USING (true) WITH CHECK (true);
