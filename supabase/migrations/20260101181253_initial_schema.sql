-- Enable UUID
create extension if not exists "pgcrypto";

-- =========================================
-- 1) MASTER DATA (ADMIN)
-- =========================================

-- Tipos de Cliente (regras de precificação)
create table if not exists public.customer_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  payment_terms text,
  shipping_method text,
  fixed_fee numeric(12,2) not null default 0,     -- valor fixo (R$)
  markup_pct numeric(8,4) not null default 0,     -- ex: 20.0 = 20%
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Categorias de Produto
create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Modelos de Produto
create table if not exists public.product_models (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.product_categories(id) on delete set null,
  name text not null,
  base_cost numeric(12,2) not null default 0,      -- custo base do modelo
  base_fabric_consumption_m numeric(12,4),         -- consumo de tecido padrão (m) (opcional)
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, name)
);

-- Tecidos (catálogo)
create table if not exists public.fabrics (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  cost_per_meter numeric(12,4) not null default 0,
  image_url text,                                 -- link (drive etc.)
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tecidos disponíveis por Modelo (N:N)
-- Aqui você define se o modelo pode usar aquele tecido e qual consumo (se variar por modelo)
create table if not exists public.model_fabrics (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.product_models(id) on delete cascade,
  fabric_id uuid not null references public.fabrics(id) on delete restrict,
  consumption_m numeric(12,4),                     -- se quiser sobrescrever o consumo do modelo para esse tecido
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (model_id, fabric_id)
);

-- Opções (variantes e atributos em um só lugar)
-- variant: adiciona custo (ex bolso, cós elástico)
-- attribute: pode adicionar consumo (ex manga longa +0.5m) e/ou custo
create type public.option_type as enum ('variant', 'attribute');

create table if not exists public.options (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.option_type not null,               -- variant | attribute
  default_unit_cost numeric(12,4) not null default 0,
  default_consumption_m numeric(12,4),            -- usado p/ atributos (ex +0.5m)
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (type, name)
);

-- Opções disponíveis por Modelo (N:N)
-- Permite sobrescrever custo/consumo por modelo, se necessário
create table if not exists public.model_options (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.product_models(id) on delete cascade,
  option_id uuid not null references public.options(id) on delete restrict,
  unit_cost_override numeric(12,4),
  consumption_m_override numeric(12,4),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (model_id, option_id)
);

-- =========================================
-- 2) SALES FLOW (REPRESENTANTE / PCP)
-- =========================================

-- Orçamento / Carrinho
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,                    -- "Nome do cliente" digitado
  customer_type_id uuid references public.customer_types(id) on delete set null,
  status text not null default 'open',            -- open | sent | approved | cancelled (simples)
  created_by uuid references auth.users(id) on delete set null,  -- opcional (se tiver login)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Itens do orçamento (cada modelo montado)
create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,

  model_id uuid references public.product_models(id) on delete set null,
  fabric_id uuid references public.fabrics(id) on delete set null,

  quantity integer not null default 1,

  -- SNAPSHOT dos valores no momento (evita mudar o orçamento se o admin alterar custos depois)
  model_name_snapshot text,
  fabric_name_snapshot text,
  base_cost_snapshot numeric(12,2) not null default 0,
  fabric_cost_snapshot numeric(12,4) not null default 0,
  fabric_consumption_m_snapshot numeric(12,4) not null default 0,

  options_cost_snapshot numeric(12,2) not null default 0,
  subtotal_snapshot numeric(12,2) not null default 0,

  fixed_fee_snapshot numeric(12,2) not null default 0,
  markup_pct_snapshot numeric(8,4) not null default 0,

  final_price_snapshot numeric(12,2) not null default 0,     -- preço final do item (unitário)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Opções escolhidas em cada item (variantes/atributos selecionados)
create table if not exists public.quote_item_options (
  id uuid primary key default gen_random_uuid(),
  quote_item_id uuid not null references public.quote_items(id) on delete cascade,

  option_id uuid references public.options(id) on delete set null,
  option_type public.option_type,
  option_name_snapshot text,

  unit_cost_snapshot numeric(12,4) not null default 0,
  consumption_m_snapshot numeric(12,4) not null default 0,

  total_cost_snapshot numeric(12,4) not null default 0,
  created_at timestamptz not null default now()
);

-- =========================================
-- 3) INDEXES (performance)
-- =========================================
create index if not exists idx_product_models_category on public.product_models(category_id);
create index if not exists idx_model_fabrics_model on public.model_fabrics(model_id);
create index if not exists idx_model_options_model on public.model_options(model_id);
create index if not exists idx_quotes_customer_type on public.quotes(customer_type_id);
create index if not exists idx_quote_items_quote on public.quote_items(quote_id);
create index if not exists idx_quote_item_options_item on public.quote_item_options(quote_item_id);

-- =========================================
-- 4) UPDATED_AT trigger helper
-- =========================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'trg_customer_types_updated_at') then
    create trigger trg_customer_types_updated_at before update on public.customer_types
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_product_categories_updated_at') then
    create trigger trg_product_categories_updated_at before update on public.product_categories
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_product_models_updated_at') then
    create trigger trg_product_models_updated_at before update on public.product_models
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_fabrics_updated_at') then
    create trigger trg_fabrics_updated_at before update on public.fabrics
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_model_fabrics_updated_at') then
    create trigger trg_model_fabrics_updated_at before update on public.model_fabrics
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_options_updated_at') then
    create trigger trg_options_updated_at before update on public.options
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_model_options_updated_at') then
    create trigger trg_model_options_updated_at before update on public.model_options
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_quotes_updated_at') then
    create trigger trg_quotes_updated_at before update on public.quotes
    for each row execute function public.set_updated_at();
  end if;

  if not exists (select 1 from pg_trigger where tgname = 'trg_quote_items_updated_at') then
    create trigger trg_quote_items_updated_at before update on public.quote_items
    for each row execute function public.set_updated_at();
  end if;
end $$;

