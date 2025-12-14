-- Existing Tables (Profiles, Leads, Invoices)

-- Create a table for public profiles using Supabase Auth
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text,
  website text,
  role text default 'user',
  streak_days integer default 0
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- Leads Table
create table leads (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  company text not null,
  company_email text,
  value numeric,
  stage_id text not null,
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table leads enable row level security;

create policy "Users can view their own leads." on leads for select using ( auth.uid() = user_id );
create policy "Users can create their own leads." on leads for insert with check ( auth.uid() = user_id );
create policy "Users can update their own leads." on leads for update using ( auth.uid() = user_id );
create policy "Users can delete their own leads." on leads for delete using ( auth.uid() = user_id );

-- Invoices Table
create table invoices (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  client_name text not null,
  amount numeric not null,
  status text not null,
  issue_date date,
  due_date date,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table invoices enable row level security;

create policy "Users can view their own invoices." on invoices for select using ( auth.uid() = user_id );
create policy "Users can create their own invoices." on invoices for insert with check ( auth.uid() = user_id );
create policy "Users can update their own invoices." on invoices for update using ( auth.uid() = user_id );
create policy "Users can delete their own invoices." on invoices for delete using ( auth.uid() = user_id );

-- [NEW] Tasks Table
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  priority text default 'Medium' check (priority in ('Low', 'Medium', 'High', 'Critical')),
  status text default 'Open' check (status in ('Open', 'In Progress', 'Completed', 'Archived')),
  due_date timestamp with time zone,
  lead_ids uuid[], -- Array of UUIDs linking to leads
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table tasks enable row level security;

create policy "Users can view their own tasks." on tasks for select using ( auth.uid() = user_id );
create policy "Users can create their own tasks." on tasks for insert with check ( auth.uid() = user_id );
create policy "Users can update their own tasks." on tasks for update using ( auth.uid() = user_id );
create policy "Users can delete their own tasks." on tasks for delete using ( auth.uid() = user_id );

-- [NEW] Saved Lists Table
create table saved_lists (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  description text,
  type text not null check (type in ('ManualSelection', 'FilterBased')),
  lead_ids uuid[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table saved_lists enable row level security;

create policy "Users can view their own saved lists." on saved_lists for select using ( auth.uid() = user_id );
create policy "Users can create their own saved lists." on saved_lists for insert with check ( auth.uid() = user_id );
create policy "Users can update their own saved lists." on saved_lists for update using ( auth.uid() = user_id );
create policy "Users can delete their own saved lists." on saved_lists for delete using ( auth.uid() = user_id );


-- User Trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid error on rerun (optional, but cleaner)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
