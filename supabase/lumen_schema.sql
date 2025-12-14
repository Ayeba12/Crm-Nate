-- New Entities for "LumenCRM" PRD (Complementary to existing schema.sql)

-- 1. Workspaces
-- "id, name, address, currency, language, theme, trial_ends_at"
create table workspaces (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references auth.users not null,
  name text not null,
  address text,
  currency text default 'USD',
  language text default 'English',
  theme text default 'light', -- 'light', 'dark', 'system'
  trial_ends_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table workspaces enable row level security;

create policy "Users can view their own workspaces." on workspaces for select using ( auth.uid() = owner_id );
create policy "Users can insert their own workspaces." on workspaces for insert with check ( auth.uid() = owner_id );
create policy "Users can update their own workspaces." on workspaces for update using ( auth.uid() = owner_id );

-- 2. Stages
-- "id, name, order_index, pipeline_id"
-- (Note: leads table currently uses stage_id as text, we might eventually migrate it to reference this table)
create table stages (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references workspaces(id) not null,
  name text not null,
  order_index integer not null default 0,
  pipeline_id uuid, -- Reserved for future multiple pipelines
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table stages enable row level security;

create policy "Users can view stages in their workspace." on stages for select using (
  exists (select 1 from workspaces w where w.id = stages.workspace_id and w.owner_id = auth.uid())
);

-- 3. Activities
-- "id, type, title, description, actor_id, created_at"
create table activities (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references workspaces(id) not null,
  actor_id uuid references auth.users,
  type text not null, -- 'lead_created', 'stage_changed', 'invoice_sent', etc.
  title text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table activities enable row level security;

create policy "Users can view activities in their workspace." on activities for select using (
  exists (select 1 from workspaces w where w.id = activities.workspace_id and w.owner_id = auth.uid())
);
create policy "Users can insert activities in their workspace." on activities for insert with check (
  exists (select 1 from workspaces w where w.id = activities.workspace_id and w.owner_id = auth.uid())
);

-- 4. Subscription Plans & Invoices
create table subscription_plans (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  price_monthly numeric not null,
  lead_limit integer,
  pipeline_limit integer,
  status text default 'active'
);
-- (Publicly readable ideally, or just hardcoded/seeded)
alter table subscription_plans enable row level security;
create policy "Public view plans" on subscription_plans for select using (true);

create table subscription_invoices (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references workspaces(id) not null,
  date timestamp with time zone default now(),
  amount numeric not null,
  currency text default 'USD',
  status text default 'paid', -- 'paid', 'pending'
  download_url text
);

alter table subscription_invoices enable row level security;
create policy "Users can view their subscription invoices." on subscription_invoices for select using (
  exists (select 1 from workspaces w where w.id = subscription_invoices.workspace_id and w.owner_id = auth.uid())
);

-- 5. Notifications
-- "id, type, title, message, created_at, read_at, target"
create table notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  type text not null, -- 'lead_assigned', 'invoice_paid', 'system'
  title text not null,
  message text,
  read_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table notifications enable row level security;

create policy "Users can view their own notifications." on notifications for select using ( auth.uid() = user_id );
create policy "Users can update (mark read) their own notifications." on notifications for update using ( auth.uid() = user_id );

-- 6. Security Sessions
-- "id, device_label, location, last_active_at, status"
create table security_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  device_label text,
  location text,
  last_active_at timestamp with time zone default now(),
  status text default 'active' -- 'active', 'revoked'
);

alter table security_sessions enable row level security;

create policy "Users can view their own sessions." on security_sessions for select using ( auth.uid() = user_id );

-- 7. Integration Configs
-- "id, type, enabled, config_blob"
create table integration_configs (
  id uuid default uuid_generate_v4() primary key,
  workspace_id uuid references workspaces(id) not null,
  type text not null, -- 'gmail', 'slack', 'supabase', 'convex'
  enabled boolean default false,
  config_blob jsonb, -- Encrypted secrets/config
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table integration_configs enable row level security;

create policy "Users can view/manage integrations." on integration_configs for all using (
  exists (select 1 from workspaces w where w.id = integration_configs.workspace_id and w.owner_id = auth.uid())
);
