-- =========================================
-- Fix RLS Policies - Permitir Acesso aos Dados
-- =========================================
-- Este script corrige as policies para permitir que usuários autenticados
-- acessem os dados do sistema.

-- ==========================================
-- 1. REMOVER POLICIES RESTRITIVAS ANTIGAS
-- ==========================================

-- Customer Types
drop policy if exists "Users can view customer types" on public.customer_types;
drop policy if exists "Admins can manage customer types" on public.customer_types;

-- Product Categories
drop policy if exists "Users can view categories" on public.product_categories;
drop policy if exists "Admins can manage categories" on public.product_categories;

-- Product Models
drop policy if exists "Users can view models" on public.product_models;
drop policy if exists "Admins can manage models" on public.product_models;

-- Fabrics
drop policy if exists "Users can view fabrics" on public.fabrics;
drop policy if exists "Admins can manage fabrics" on public.fabrics;

-- Model Fabrics
drop policy if exists "Users can view model fabrics" on public.model_fabrics;
drop policy if exists "Admins can manage model fabrics" on public.model_fabrics;

-- Options
drop policy if exists "Users can view options" on public.options;
drop policy if exists "Admins can manage options" on public.options;

-- Model Options
drop policy if exists "Users can view model options" on public.model_options;
drop policy if exists "Admins can manage model options" on public.model_options;

-- Quotes
drop policy if exists "Users can view own quotes" on public.quotes;
drop policy if exists "Users can create quotes" on public.quotes;
drop policy if exists "Admins can view all quotes" on public.quotes;

-- Quote Items
drop policy if exists "Users can view own quote items" on public.quote_items;
drop policy if exists "Users can manage own quote items" on public.quote_items;

-- Quote Item Options
drop policy if exists "Users can view own quote item options" on public.quote_item_options;
drop policy if exists "Users can manage own quote item options" on public.quote_item_options;

-- ==========================================
-- 2. CRIAR POLICIES PERMISSIVAS
-- ==========================================

-- Habilita RLS em todas as tabelas
alter table public.customer_types enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_models enable row level security;
alter table public.fabrics enable row level security;
alter table public.model_fabrics enable row level security;
alter table public.options enable row level security;
alter table public.model_options enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.quote_item_options enable row level security;

-- ==========================================
-- CUSTOMER TYPES (Tipos de Cliente)
-- ==========================================

-- Todos os usuários autenticados podem visualizar
create policy "Authenticated users can view customer types"
  on public.customer_types
  for select
  using (auth.uid() is not null);

-- Admins podem fazer qualquer operação
create policy "Admins can manage customer types"
  on public.customer_types
  for all
  using (public.is_admin());

-- ==========================================
-- PRODUCT CATEGORIES (Categorias)
-- ==========================================

create policy "Authenticated users can view categories"
  on public.product_categories
  for select
  using (auth.uid() is not null);

create policy "Admins can manage categories"
  on public.product_categories
  for all
  using (public.is_admin());

-- ==========================================
-- PRODUCT MODELS (Modelos)
-- ==========================================

create policy "Authenticated users can view models"
  on public.product_models
  for select
  using (auth.uid() is not null);

create policy "Admins can manage models"
  on public.product_models
  for all
  using (public.is_admin());

-- ==========================================
-- FABRICS (Tecidos)
-- ==========================================

create policy "Authenticated users can view fabrics"
  on public.fabrics
  for select
  using (auth.uid() is not null);

create policy "Admins can manage fabrics"
  on public.fabrics
  for all
  using (public.is_admin());

-- ==========================================
-- MODEL FABRICS (Relação Modelo-Tecido)
-- ==========================================

create policy "Authenticated users can view model fabrics"
  on public.model_fabrics
  for select
  using (auth.uid() is not null);

create policy "Admins can manage model fabrics"
  on public.model_fabrics
  for all
  using (public.is_admin());

-- ==========================================
-- OPTIONS (Variantes e Atributos)
-- ==========================================

create policy "Authenticated users can view options"
  on public.options
  for select
  using (auth.uid() is not null);

create policy "Admins can manage options"
  on public.options
  for all
  using (public.is_admin());

-- ==========================================
-- MODEL OPTIONS (Relação Modelo-Options)
-- ==========================================

create policy "Authenticated users can view model options"
  on public.model_options
  for select
  using (auth.uid() is not null);

create policy "Admins can manage model options"
  on public.model_options
  for all
  using (public.is_admin());

-- ==========================================
-- QUOTES (Orçamentos)
-- ==========================================

-- Usuários podem ver seus próprios orçamentos
create policy "Users can view own quotes"
  on public.quotes
  for select
  using (auth.uid() = created_by);

-- Usuários podem criar orçamentos
create policy "Users can create quotes"
  on public.quotes
  for insert
  with check (auth.uid() = created_by);

-- Usuários podem atualizar seus próprios orçamentos
create policy "Users can update own quotes"
  on public.quotes
  for update
  using (auth.uid() = created_by);

-- Admins podem ver todos os orçamentos
create policy "Admins can view all quotes"
  on public.quotes
  for select
  using (public.is_admin());

-- ==========================================
-- QUOTE ITEMS (Itens de Orçamento)
-- ==========================================

-- Usuários podem ver itens dos seus orçamentos
create policy "Users can view own quote items"
  on public.quote_items
  for select
  using (
    exists (
      select 1 from public.quotes
      where quotes.id = quote_items.quote_id
      and quotes.created_by = auth.uid()
    )
  );

-- Usuários podem criar itens nos seus orçamentos
create policy "Users can create own quote items"
  on public.quote_items
  for insert
  with check (
    exists (
      select 1 from public.quotes
      where quotes.id = quote_items.quote_id
      and quotes.created_by = auth.uid()
    )
  );

-- Admins podem ver todos os itens
create policy "Admins can view all quote items"
  on public.quote_items
  for select
  using (public.is_admin());

-- ==========================================
-- QUOTE ITEM OPTIONS (Opções dos Itens)
-- ==========================================

-- Usuários podem ver opções dos itens dos seus orçamentos
create policy "Users can view own quote item options"
  on public.quote_item_options
  for select
  using (
    exists (
      select 1 from public.quote_items
      join public.quotes on quotes.id = quote_items.quote_id
      where quote_items.id = quote_item_options.quote_item_id
      and quotes.created_by = auth.uid()
    )
  );

-- Usuários podem criar opções nos itens dos seus orçamentos
create policy "Users can create own quote item options"
  on public.quote_item_options
  for insert
  with check (
    exists (
      select 1 from public.quote_items
      join public.quotes on quotes.id = quote_items.quote_id
      where quote_items.id = quote_item_options.quote_item_id
      and quotes.created_by = auth.uid()
    )
  );

-- Admins podem ver todas as opções
create policy "Admins can view all quote item options"
  on public.quote_item_options
  for select
  using (public.is_admin());

-- ==========================================
-- VERIFICAÇÃO
-- ==========================================

-- Lista todas as policies criadas
select schemaname, tablename, policyname
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
