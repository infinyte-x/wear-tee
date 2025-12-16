-- Enable moddatetime extension
create extension if not exists moddatetime schema extensions;

create table if not exists public.pages (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  
  -- Content
  title text not null,
  content jsonb not null default '[]'::jsonb, -- Stores array of blocks
  
  -- SEO & Metadata
  meta_title text,
  meta_description text,
  meta_image text,
  
  -- Status & Scheduling
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  is_home boolean default false,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists pages_slug_idx on public.pages (slug);
create index if not exists pages_status_idx on public.pages (status);

-- RLS Policies
alter table public.pages enable row level security;

-- Public read access for published pages
create policy "Public pages are viewable by everyone"
  on public.pages for select
  using ( status = 'published' );

-- Admins can do everything
-- Note: Assuming you have an admin role or specialized user check. 
-- For now, allowing authenticated users to CRUD (adjust based on your auth model)
create policy "Authenticated users can manage pages"
  on public.pages for all
  using ( auth.role() = 'authenticated' );

-- Trigger for updated_at
create extension if not exists moddatetime schema extensions;

create trigger handle_updated_at before update on public.pages
  for each row execute procedure extensions.moddatetime (updated_at);
