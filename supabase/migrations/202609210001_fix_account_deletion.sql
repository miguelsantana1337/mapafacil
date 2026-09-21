begin;

alter table public.workspaces
  drop constraint if exists workspaces_owner_id_fkey;
alter table public.workspaces
  add constraint workspaces_owner_id_fkey
  foreign key (owner_id) references public.profiles(id) on delete cascade;

alter table public.projects alter column created_by drop not null;
alter table public.projects drop constraint if exists projects_created_by_fkey;
alter table public.projects
  add constraint projects_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete set null;

alter table public.project_nodes alter column created_by drop not null;
alter table public.project_nodes drop constraint if exists project_nodes_created_by_fkey;
alter table public.project_nodes
  add constraint project_nodes_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete set null;

alter table public.project_edges alter column created_by drop not null;
alter table public.project_edges drop constraint if exists project_edges_created_by_fkey;
alter table public.project_edges
  add constraint project_edges_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete set null;

alter table public.project_versions alter column created_by drop not null;
alter table public.project_versions drop constraint if exists project_versions_created_by_fkey;
alter table public.project_versions
  add constraint project_versions_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete set null;

alter table public.project_assets alter column created_by drop not null;
alter table public.project_assets drop constraint if exists project_assets_created_by_fkey;
alter table public.project_assets
  add constraint project_assets_created_by_fkey
  foreign key (created_by) references public.profiles(id) on delete set null;

commit;
