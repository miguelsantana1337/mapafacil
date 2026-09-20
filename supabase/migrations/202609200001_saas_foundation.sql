begin;

create extension if not exists pgcrypto;
create schema if not exists private;

do $$ begin create type public.workspace_role as enum ('owner','admin','editor','viewer'); exception when duplicate_object then null; end $$;
do $$ begin create type public.project_type as enum ('mindmap','funnel'); exception when duplicate_object then null; end $$;
do $$ begin create type public.project_status as enum ('active','archived'); exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '', avatar_url text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(), name text not null check (char_length(name) between 1 and 120),
  owner_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.workspace_role not null default 'viewer', created_at timestamptz not null default now(),
  primary key (workspace_id,user_id)
);
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete restrict,
  name text not null check (char_length(name) between 1 and 160), description text not null default '',
  project_type public.project_type not null, status public.project_status not null default 'active',
  thumbnail_path text, viewport jsonb not null default '{"x":0,"y":0,"zoom":1}'::jsonb,
  settings jsonb not null default '{"snapToGrid":true,"showGrid":true,"gridSize":20,"showMiniMap":true}'::jsonb,
  revision bigint not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.project_nodes (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  node_type text not null check (char_length(node_type) between 1 and 60),
  position_x double precision not null default 0, position_y double precision not null default 0,
  width double precision check (width is null or width between 40 and 2400), height double precision check (height is null or height between 30 and 2400),
  parent_node_id uuid,
  data jsonb not null default '{}'::jsonb, style jsonb not null default '{}'::jsonb,
  z_index integer not null default 0, locked boolean not null default false,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(project_id,id), foreign key(project_id,parent_node_id) references public.project_nodes(project_id,id) on delete cascade
);
create table if not exists public.project_edges (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  source_node_id uuid not null, target_node_id uuid not null,
  source_handle text, target_handle text, edge_type text not null default 'smoothstep' check (edge_type in ('smoothstep','straight','bezier')),
  label text, data jsonb not null default '{}'::jsonb, style jsonb not null default '{}'::jsonb,
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (source_node_id <> target_node_id),
  foreign key(project_id,source_node_id) references public.project_nodes(project_id,id) on delete cascade,
  foreign key(project_id,target_node_id) references public.project_nodes(project_id,id) on delete cascade
);
create table if not exists public.project_versions (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  version_number integer not null check (version_number > 0), snapshot jsonb not null,
  created_by uuid not null references public.profiles(id) on delete restrict, reason text,
  created_at timestamptz not null default now(), unique(project_id,version_number)
);
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(), workspace_id uuid references public.workspaces(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160), description text not null default '',
  project_type public.project_type not null, scope text not null check (scope in ('system','workspace')),
  thumbnail_path text, snapshot jsonb not null, is_published boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check ((scope='system' and workspace_id is null) or (scope='workspace' and workspace_id is not null))
);
create table if not exists public.project_assets (
  id uuid primary key default gen_random_uuid(), project_id uuid not null references public.projects(id) on delete cascade,
  storage_path text not null unique, file_name text not null, mime_type text not null,
  file_size bigint not null check (file_size between 1 and 20971520),
  created_by uuid not null references public.profiles(id) on delete restrict, created_at timestamptz not null default now()
);

create index if not exists workspace_members_user_idx on public.workspace_members(user_id);
create index if not exists projects_workspace_updated_idx on public.projects(workspace_id,updated_at desc);
create index if not exists project_nodes_project_updated_idx on public.project_nodes(project_id,updated_at);
create index if not exists project_edges_project_updated_idx on public.project_edges(project_id,updated_at);
create index if not exists project_versions_project_idx on public.project_versions(project_id,version_number desc);
create index if not exists project_assets_project_idx on public.project_assets(project_id);

create or replace function private.current_workspace_role(target_workspace_id uuid) returns public.workspace_role
language sql stable security definer set search_path='' as $$
  select wm.role from public.workspace_members wm where wm.workspace_id=target_workspace_id and wm.user_id=(select auth.uid()) limit 1
$$;
create or replace function private.can_view_project(target_project_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.projects p join public.workspace_members wm on wm.workspace_id=p.workspace_id where p.id=target_project_id and wm.user_id=(select auth.uid()))
$$;
create or replace function private.can_edit_project(target_project_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.projects p join public.workspace_members wm on wm.workspace_id=p.workspace_id where p.id=target_project_id and wm.user_id=(select auth.uid()) and wm.role in ('owner','admin','editor'))
$$;
create or replace function private.can_admin_project(target_project_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.projects p join public.workspace_members wm on wm.workspace_id=p.workspace_id where p.id=target_project_id and wm.user_id=(select auth.uid()) and wm.role in ('owner','admin'))
$$;

create or replace function private.set_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now(); return new; end $$;
create or replace function private.touch_project() returns trigger language plpgsql security definer set search_path='' as $$
begin update public.projects set updated_at=now(),revision=revision+1 where id=coalesce(new.project_id,old.project_id); return coalesce(new,old); end $$;
create or replace function private.bootstrap_user() returns trigger language plpgsql security definer set search_path='' as $$
declare workspace_id uuid:=gen_random_uuid(); display_name text:=coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'),''),split_part(new.email,'@',1),'Usuário');
begin
  insert into public.profiles(id,full_name,avatar_url) values(new.id,display_name,new.raw_user_meta_data->>'avatar_url') on conflict(id) do nothing;
  insert into public.workspaces(id,name,owner_id) values(workspace_id,'Meu Workspace',new.id);
  insert into public.workspace_members(workspace_id,user_id,role) values(workspace_id,new.id,'owner');
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.bootstrap_user();
do $$ declare item text; begin foreach item in array array['profiles','workspaces','projects','project_nodes','project_edges','templates'] loop execute format('drop trigger if exists set_updated_at on public.%I',item); execute format('create trigger set_updated_at before update on public.%I for each row execute function private.set_updated_at()',item); end loop; end $$;
drop trigger if exists touch_project_from_nodes on public.project_nodes;
create trigger touch_project_from_nodes after insert or update or delete on public.project_nodes for each row execute function private.touch_project();
drop trigger if exists touch_project_from_edges on public.project_edges;
create trigger touch_project_from_edges after insert or update or delete on public.project_edges for each row execute function private.touch_project();

alter table public.profiles enable row level security; alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security; alter table public.projects enable row level security;
alter table public.project_nodes enable row level security; alter table public.project_edges enable row level security;
alter table public.project_versions enable row level security; alter table public.templates enable row level security;
alter table public.project_assets enable row level security;

revoke all on all tables in schema public from anon;
revoke all on table public.profiles,public.workspaces,public.workspace_members,public.projects,public.project_nodes,public.project_edges,public.project_versions,public.templates,public.project_assets from authenticated;
grant select,update on public.profiles to authenticated;
grant select,update on public.workspaces to authenticated;
grant select,insert,update,delete on public.workspace_members,public.projects,public.project_nodes,public.project_edges,public.project_versions,public.templates,public.project_assets to authenticated;
revoke execute on all functions in schema private from public,anon,authenticated;
grant usage on schema private to authenticated;
grant execute on function private.current_workspace_role(uuid),private.can_view_project(uuid),private.can_edit_project(uuid),private.can_admin_project(uuid) to authenticated;

create policy profiles_select_self on public.profiles for select to authenticated using ((select auth.uid())=id);
create policy profiles_update_self on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
create policy workspaces_select_member on public.workspaces for select to authenticated using (private.current_workspace_role(id) is not null);
create policy workspaces_update_admin on public.workspaces for update to authenticated using (private.current_workspace_role(id) in ('owner','admin')) with check (private.current_workspace_role(id) in ('owner','admin'));
create policy members_select_member on public.workspace_members for select to authenticated using (private.current_workspace_role(workspace_id) is not null);
create policy members_insert_admin on public.workspace_members for insert to authenticated with check (private.current_workspace_role(workspace_id) in ('owner','admin'));
create policy members_update_admin on public.workspace_members for update to authenticated using (private.current_workspace_role(workspace_id) in ('owner','admin')) with check (private.current_workspace_role(workspace_id) in ('owner','admin'));
create policy members_delete_admin on public.workspace_members for delete to authenticated using (private.current_workspace_role(workspace_id) in ('owner','admin') and not (user_id=(select auth.uid()) and role='owner'));
create policy projects_select_member on public.projects for select to authenticated using (private.current_workspace_role(workspace_id) is not null);
create policy projects_insert_editor on public.projects for insert to authenticated with check (created_by=(select auth.uid()) and private.current_workspace_role(workspace_id) in ('owner','admin','editor'));
create policy projects_update_editor on public.projects for update to authenticated using (private.current_workspace_role(workspace_id) in ('owner','admin','editor')) with check (private.current_workspace_role(workspace_id) in ('owner','admin','editor'));
create policy projects_delete_admin on public.projects for delete to authenticated using (private.current_workspace_role(workspace_id) in ('owner','admin'));

create policy nodes_select on public.project_nodes for select to authenticated using (private.can_view_project(project_id));
create policy nodes_insert on public.project_nodes for insert to authenticated with check (created_by=(select auth.uid()) and private.can_edit_project(project_id));
create policy nodes_update on public.project_nodes for update to authenticated using (private.can_edit_project(project_id)) with check (private.can_edit_project(project_id));
create policy nodes_delete on public.project_nodes for delete to authenticated using (private.can_edit_project(project_id));
create policy edges_select on public.project_edges for select to authenticated using (private.can_view_project(project_id));
create policy edges_insert on public.project_edges for insert to authenticated with check (created_by=(select auth.uid()) and private.can_edit_project(project_id));
create policy edges_update on public.project_edges for update to authenticated using (private.can_edit_project(project_id)) with check (private.can_edit_project(project_id));
create policy edges_delete on public.project_edges for delete to authenticated using (private.can_edit_project(project_id));
create policy versions_select on public.project_versions for select to authenticated using (private.can_view_project(project_id));
create policy versions_insert on public.project_versions for insert to authenticated with check (created_by=(select auth.uid()) and private.can_edit_project(project_id));
create policy assets_select on public.project_assets for select to authenticated using (private.can_view_project(project_id));
create policy assets_insert on public.project_assets for insert to authenticated with check (created_by=(select auth.uid()) and private.can_edit_project(project_id));
create policy assets_delete on public.project_assets for delete to authenticated using (private.can_edit_project(project_id));
create policy templates_select on public.templates for select to authenticated using ((scope='system' and is_published) or (workspace_id is not null and private.current_workspace_role(workspace_id) is not null));
create policy templates_insert on public.templates for insert to authenticated with check (scope='workspace' and workspace_id is not null and private.current_workspace_role(workspace_id) in ('owner','admin','editor'));
create policy templates_update on public.templates for update to authenticated using (scope='workspace' and workspace_id is not null and private.current_workspace_role(workspace_id) in ('owner','admin','editor')) with check (scope='workspace' and workspace_id is not null and private.current_workspace_role(workspace_id) in ('owner','admin','editor'));
create policy templates_delete on public.templates for delete to authenticated using (scope='workspace' and workspace_id is not null and private.current_workspace_role(workspace_id) in ('owner','admin'));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('project-assets','project-assets',false,20971520,array['image/png','image/jpeg','image/webp','application/pdf']) on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy project_assets_storage_select on storage.objects for select to authenticated using (bucket_id='project-assets' and exists(select 1 from public.workspace_members wm where wm.user_id=(select auth.uid()) and wm.workspace_id::text=(storage.foldername(name))[1]));
create policy project_assets_storage_insert on storage.objects for insert to authenticated with check (bucket_id='project-assets' and exists(select 1 from public.workspace_members wm where wm.user_id=(select auth.uid()) and wm.role in ('owner','admin','editor') and wm.workspace_id::text=(storage.foldername(name))[1]));
create policy project_assets_storage_update on storage.objects for update to authenticated using (bucket_id='project-assets' and exists(select 1 from public.workspace_members wm where wm.user_id=(select auth.uid()) and wm.role in ('owner','admin','editor') and wm.workspace_id::text=(storage.foldername(name))[1])) with check (bucket_id='project-assets' and exists(select 1 from public.workspace_members wm where wm.user_id=(select auth.uid()) and wm.role in ('owner','admin','editor') and wm.workspace_id::text=(storage.foldername(name))[1]));
create policy project_assets_storage_delete on storage.objects for delete to authenticated using (bucket_id='project-assets' and exists(select 1 from public.workspace_members wm where wm.user_id=(select auth.uid()) and wm.role in ('owner','admin','editor') and wm.workspace_id::text=(storage.foldername(name))[1]));

commit;
