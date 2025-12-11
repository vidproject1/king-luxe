-- Create a storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Enable RLS on storage.objects if it's not already
alter table storage.objects enable row level security;

-- Allow public access to view images
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

-- Allow public uploads (WARNING: For development only, since we don't have auth yet)
create policy "Public Upload"
  on storage.objects for insert
  with check ( bucket_id = 'product-images' );

-- Allow public updates
create policy "Public Update"
  on storage.objects for update
  using ( bucket_id = 'product-images' );

-- Allow public deletes
create policy "Public Delete"
  on storage.objects for delete
  using ( bucket_id = 'product-images' );
