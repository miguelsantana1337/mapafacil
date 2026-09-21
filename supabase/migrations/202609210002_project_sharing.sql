begin;

alter table public.projects add column if not exists share_token uuid not null default gen_random_uuid();
alter table public.projects add column if not exists is_public boolean not null default false;
create unique index if not exists projects_share_token_idx on public.projects(share_token);

alter table public.project_edges drop constraint if exists project_edges_edge_type_check;
alter table public.project_edges add constraint project_edges_edge_type_check check (edge_type in ('smoothstep','straight','bezier','step'));

grant select on public.projects,public.project_nodes,public.project_edges to anon;
create policy projects_public_select on public.projects for select to anon using (is_public);
create policy nodes_public_select on public.project_nodes for select to anon using (exists(select 1 from public.projects p where p.id=project_id and p.is_public));
create policy edges_public_select on public.project_edges for select to anon using (exists(select 1 from public.projects p where p.id=project_id and p.is_public));

commit;
