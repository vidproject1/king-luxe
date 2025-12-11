-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_info JSONB NOT NULL,
    items JSONB NOT NULL,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow public access for development (or you could restrict to authenticated users)
DROP POLICY IF EXISTS "Public Access Orders" ON orders;
CREATE POLICY "Public Access Orders" ON orders FOR ALL USING (true) WITH CHECK (true);
