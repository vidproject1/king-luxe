-- Create products table
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Allow public read access on products" ON products;
CREATE POLICY "Allow public read access on products" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow full access to authenticated users" ON products;
CREATE POLICY "Allow full access to authenticated users" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create index for category for faster filtering
DROP INDEX IF EXISTS idx_products_category;
CREATE INDEX idx_products_category ON products(category);
