create table if not exists public.mind_maps (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Mapa sem título',
  favorite boolean not null default false,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.mind_maps enable row level security;
create policy "users_select_own_maps" on public.mind_maps for select to authenticated using ((select auth.uid()) = user_id);
create policy "users_insert_own_maps" on public.mind_maps for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users_update_own_maps" on public.mind_maps for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users_delete_own_maps" on public.mind_maps for delete to authenticated using ((select auth.uid()) = user_id);
create index if not exists mind_maps_user_updated_idx on public.mind_maps (user_id, updated_at desc);
