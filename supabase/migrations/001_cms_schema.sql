-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    is_home BOOLEAN DEFAULT FALSE,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create page_components table to store components on pages
CREATE TABLE IF NOT EXISTS page_components (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('navigation', 'hero', 'product_grid', 'footer')),
    config JSONB NOT NULL DEFAULT '{}',
    position INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(page_id, position)
);

-- Create navigation_links table for navigation components
CREATE TABLE IF NOT EXISTS navigation_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    component_id UUID REFERENCES page_components(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    url TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default home page if it doesn't exist
INSERT INTO pages (title, slug, is_home) 
SELECT 'Home', '', TRUE 
WHERE NOT EXISTS (SELECT 1 FROM pages WHERE slug = '');

-- Create indexes for better performance (IF NOT EXISTS is not standard for indexes in all postgres versions, but typically safe to re-run if we drop first or check)
DROP INDEX IF EXISTS idx_page_components_page_id;
CREATE INDEX idx_page_components_page_id ON page_components(page_id);

DROP INDEX IF EXISTS idx_page_components_position;
CREATE INDEX idx_page_components_position ON page_components(position);

DROP INDEX IF EXISTS idx_navigation_links_component_id;
CREATE INDEX idx_navigation_links_component_id ON navigation_links(component_id);

-- Set up Row Level Security (RLS)
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_links ENABLE ROW LEVEL SECURITY;

-- Create policies (drop first to ensure we can re-create)
DROP POLICY IF EXISTS "Allow public read access on pages" ON pages;
CREATE POLICY "Allow public read access on pages" ON pages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on page_components" ON page_components;
CREATE POLICY "Allow public read access on page_components" ON page_components FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access on navigation_links" ON navigation_links;
CREATE POLICY "Allow public read access on navigation_links" ON navigation_links FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow full access to authenticated users" ON pages;
CREATE POLICY "Allow full access to authenticated users" ON pages FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to authenticated users" ON page_components;
CREATE POLICY "Allow full access to authenticated users" ON page_components FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to authenticated users" ON navigation_links;
CREATE POLICY "Allow full access to authenticated users" ON navigation_links FOR ALL TO authenticated USING (true) WITH CHECK (true);
