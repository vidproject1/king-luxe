-- Enable RLS (Row Level Security) for all tables
-- This is a best practice, even if we allow public access for now
alter default privileges in schema public grant all on tables to postgres, anon, authenticated, service_role;

-- 1. PAGES TABLE
CREATE TABLE IF NOT EXISTS pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    is_home BOOLEAN DEFAULT FALSE,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- 2. PAGE COMPONENTS TABLE
CREATE TABLE IF NOT EXISTS page_components (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- Removed CHECK constraint to allow flexibility
    config JSONB NOT NULL DEFAULT '{}',
    position INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(page_id, position)
);

ALTER TABLE page_components ENABLE ROW LEVEL SECURITY;

-- 3. NAVIGATION LINKS TABLE (Legacy/Optional, but kept for schema compatibility)
CREATE TABLE IF NOT EXISTS navigation_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    component_id UUID REFERENCES page_components(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    url TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE navigation_links ENABLE ROW LEVEL SECURITY;

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    images TEXT[] DEFAULT '{}',
    colors TEXT[] DEFAULT '{}',
    sizes TEXT[] DEFAULT '{}',
    stock INTEGER DEFAULT 0,
    category TEXT,
    theme_color TEXT DEFAULT '#000000',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 5. STORAGE BUCKET
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- NOTE: We skipped 'alter table storage.objects enable row level security;' as it often causes permission errors.

-- ==========================================
-- POLICIES (DEVELOPMENT MODE - PUBLIC ACCESS)
-- ==========================================

-- Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Public Access Pages" ON pages;
DROP POLICY IF EXISTS "Public Access Components" ON page_components;
DROP POLICY IF EXISTS "Public Access Nav" ON navigation_links;
DROP POLICY IF EXISTS "Public Access Products" ON products;

-- Pages
CREATE POLICY "Public Access Pages" ON pages FOR ALL USING (true) WITH CHECK (true);

-- Page Components
CREATE POLICY "Public Access Components" ON page_components FOR ALL USING (true) WITH CHECK (true);

-- Navigation Links
CREATE POLICY "Public Access Nav" ON navigation_links FOR ALL USING (true) WITH CHECK (true);

-- Products
CREATE POLICY "Public Access Products" ON products FOR ALL USING (true) WITH CHECK (true);

-- Storage Policies
-- We wrap these in a DO block to ignore errors if policies already exist or permissions are denied
DO $$
BEGIN
    BEGIN
        CREATE POLICY "Public Access Storage" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN OTHERS THEN NULL;
    END;

    BEGIN
        CREATE POLICY "Public Upload Storage" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN OTHERS THEN NULL;
    END;

    BEGIN
        CREATE POLICY "Public Update Storage" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN OTHERS THEN NULL;
    END;

    BEGIN
        CREATE POLICY "Public Delete Storage" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');
    EXCEPTION WHEN duplicate_object THEN NULL; WHEN OTHERS THEN NULL;
    END;
END $$;

-- Insert default home page if it doesn't exist
INSERT INTO pages (title, slug, is_home) 
SELECT 'Home', '', TRUE 
WHERE NOT EXISTS (SELECT 1 FROM pages WHERE slug = '');
