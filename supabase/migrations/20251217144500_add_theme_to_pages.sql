-- Add theme column to pages table
alter table public.pages
add column if not exists theme jsonb default null;
