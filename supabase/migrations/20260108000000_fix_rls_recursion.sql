-- =========================================
-- Fix RLS Recursion Issue in user_profiles
-- =========================================
-- O problema: As policies anteriores causavam recursão infinita ao verificar
-- se um usuário é admin consultando a própria tabela user_profiles.
-- Solução: Remover policies recursivas e simplificar o acesso.

-- Drop das policies antigas que causavam recursão
drop policy if exists "Admins can view all profiles" on public.user_profiles;
drop policy if exists "Admins can update all profiles" on public.user_profiles;

-- Nova policy simplificada para admins verem todos os perfis
-- Usa uma subquery com SECURITY DEFINER para evitar recursão
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.user_profiles
    where user_id = auth.uid()
    and role = 'admin'
    and is_approved = true
  );
$$;

-- Policy para admins visualizarem todos os perfis (usando função auxiliar)
create policy "Admins can view all profiles"
  on public.user_profiles
  for select
  using (public.is_admin());

-- Policy para admins atualizarem todos os perfis (usando função auxiliar)
create policy "Admins can update all profiles"
  on public.user_profiles
  for update
  using (public.is_admin());

-- Comentário explicativo
comment on function public.is_admin() is 'Verifica se o usuário autenticado é admin aprovado. Usa SECURITY DEFINER para evitar recursão infinita nas RLS policies.';
