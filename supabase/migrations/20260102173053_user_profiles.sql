-- =========================================
-- User Profiles Table
-- =========================================

-- Tabela de perfis de usuário vinculada ao auth.users do Supabase
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'pcp', 'rep')),
  is_approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

-- Índice para melhor performance
create index if not exists idx_user_profiles_user_id on public.user_profiles(user_id);
create index if not exists idx_user_profiles_role on public.user_profiles(role);
create index if not exists idx_user_profiles_is_approved on public.user_profiles(is_approved);

-- Trigger para updated_at
create trigger trg_user_profiles_updated_at before update on public.user_profiles
for each row execute function public.set_updated_at();

-- =========================================
-- Row Level Security (RLS) Policies
-- =========================================

-- Habilitar RLS
alter table public.user_profiles enable row level security;

-- Policy: Usuários podem ver seu próprio perfil
create policy "Users can view their own profile"
  on public.user_profiles
  for select
  using (auth.uid() = user_id);

-- Policy: Usuários podem criar seu próprio perfil (apenas no registro)
create policy "Users can create their own profile"
  on public.user_profiles
  for insert
  with check (auth.uid() = user_id);

-- Policy: Admins podem ver todos os perfis
create policy "Admins can view all profiles"
  on public.user_profiles
  for select
  using (
    exists (
      select 1 from public.user_profiles
      where user_id = auth.uid()
      and role = 'admin'
      and is_approved = true
    )
  );

-- Policy: Admins podem atualizar todos os perfis
create policy "Admins can update all profiles"
  on public.user_profiles
  for update
  using (
    exists (
      select 1 from public.user_profiles
      where user_id = auth.uid()
      and role = 'admin'
      and is_approved = true
    )
  );

-- Policy: Usuários podem atualizar apenas seu próprio perfil (mas não role ou is_approved)
-- Isso permite que usuários vejam seu status, mas não possam se auto-promover
create policy "Users can update their own profile (limited)"
  on public.user_profiles
  for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and role = (select role from public.user_profiles where user_id = auth.uid())
    and is_approved = (select is_approved from public.user_profiles where user_id = auth.uid())
  );

