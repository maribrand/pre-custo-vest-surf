# App de Pré-Custo Vest Surf

Projeto front-end em React + TypeScript (Vite) para um simulador de pré-custo.

## Estrutura atual

- `frontend/` – código do aplicativo React
  - `src/components/` – componentes UI organizados por contexto
  - `src/data/` – mocks/dados em memória durante o MVP
  - `src/types/` – tipos e interfaces compartilhadas (a ser preenchido)
- `supabase/migrations/` – migrações do banco de dados PostgreSQL (Supabase)

## Configuração Inicial

### 1. Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Aplique a migração do banco de dados:
   - Acesse o SQL Editor no dashboard do Supabase
   - Execute o conteúdo do arquivo `supabase/migrations/20260101181253_initial_schema.sql`
3. Obtenha as credenciais do projeto:
   - Vá em Settings > API
   - Copie a URL do projeto e a chave `anon` (public)

### 2. Aplicar Migrações do Banco de Dados

1. Aplique todas as migrações do banco de dados:
   - Acesse o SQL Editor no dashboard do Supabase
   - Execute o conteúdo dos arquivos em `supabase/migrations/` **na ordem**:
     - `20260101181253_initial_schema.sql` (schema inicial)
     - `20260102173053_user_profiles.sql` (tabela de perfis de usuário)
     - `20260108000000_fix_rls_recursion.sql` (correção de recursão infinita nas RLS policies)

### 3. Configurar Variáveis de Ambiente

1. No diretório `frontend/`, crie um arquivo `.env.local`:
   ```bash
   cd frontend
   cp env.local.example .env.local
   ```

2. Edite `.env.local` e preencha com suas credenciais do Supabase:
   ```
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anon
   ```

## Rodando localmente

1. Instale as dependências:

   ```bash
   cd frontend
   npm install
   ```

2. Suba o ambiente de desenvolvimento:

   ```bash
   npm run dev
   ```

3. Abra o navegador em `http://localhost:5173`.

> Caso prefira `yarn` ou `pnpm`, basta gerar o lockfile correspondente após instalar.

> **Nota**: Na primeira execução, os dados iniciais do `seed.ts` serão automaticamente migrados para o banco de dados se ele estiver vazio.

## Banco de Dados

O projeto utiliza PostgreSQL via Supabase. O schema do banco de dados está definido em `supabase/migrations/`.

### Estrutura do Schema

O banco de dados é organizado em três áreas principais:

1. **Autenticação e Usuários**: Sistema de perfis e controle de acesso
   - `user_profiles`: Perfis de usuário vinculados ao `auth.users` do Supabase
     - Campos: `user_id`, `role` (admin/pcp/rep), `is_approved`
     - RLS (Row Level Security) policies para proteger dados
     - Usuários podem ver seu próprio perfil
     - Admins podem ver e atualizar todos os perfis

2. **Master Data (Admin)**: Dados de configuração e catálogo
   - `customer_types`: Tipos de cliente com regras de precificação
   - `product_categories`: Categorias de produtos
   - `product_models`: Modelos de produtos com custo base
   - `fabrics`: Catálogo de tecidos
   - `model_fabrics`: Relação N:N entre modelos e tecidos
   - `options`: Variantes e atributos (unificados)
   - `model_options`: Relação N:N entre modelos e opções

3. **Sales Flow (Representante/PCP)**: Fluxo de orçamentos
   - `quotes`: Orçamentos/carrinhos
   - `quote_items`: Itens de cada orçamento (com snapshots de valores)
   - `quote_item_options`: Opções selecionadas em cada item

### Aplicando Migrações

Para aplicar as migrações no Supabase:

```bash
# Usando Supabase CLI
supabase db push

# Ou via Dashboard do Supabase
# Acesse: SQL Editor > New Query > Cole o conteúdo do arquivo de migração
```

### Características Importantes

- **Snapshots**: Os valores de custo e preço são salvos como snapshots nos itens de orçamento, garantindo que mudanças futuras nos custos não afetem orçamentos já criados
- **Triggers**: Triggers automáticos atualizam o campo `updated_at` em todas as tabelas
- **UUIDs**: Todas as chaves primárias utilizam UUIDs gerados automaticamente
- **Persistência**: Todos os dados cadastrados no frontend são automaticamente salvos no Supabase
- **Migração Automática**: Dados iniciais são migrados automaticamente na primeira execução

## Deploy em Produção

Para colocar o sistema no ar usando Vercel + GitHub, consulte o guia completo:

📖 **[DEPLOY.md](./DEPLOY.md)** - Guia passo a passo de deploy

### Resumo rápido:
1. Crie repositório no GitHub
2. Faça push do código
3. Conecte no Vercel
4. Configure variáveis de ambiente
5. Deploy automático! 🚀

---

## Funcionalidades

### Autenticação e Controle de Acesso
- Sistema de autenticação com email e senha via Supabase Auth
- Cadastro de novos usuários com seleção de perfil durante o registro:
  - Usuário escolhe o perfil desejado (Admin, PCP ou Representante) no momento do cadastro
  - Perfil é criado automaticamente com a escolha do usuário
- Aprovação de usuários:
  - Aprovação é feita manualmente no painel do Supabase
  - Administrador aprova o email do usuário diretamente no Supabase
  - Após aprovação, usuário tem acesso imediato à sua página
- Três perfis de acesso:
  - **Admin**: Acesso completo a todas as páginas (admin, PCP e representante)
  - **PCP**: Acesso apenas à página PCP (simulador completo)
  - **Representante**: Acesso apenas à página Representante (simulador simplificado)
- Controle de acesso baseado em perfis com proteção de rotas
- Verificação automática de aprovação a cada 10 segundos para usuários aguardando aprovação
- Rotas protegidas e redirecionamento automático:
  - `/login`: página única para login ou registro
  - `/admin`: acessível apenas para Admin; redireciona para login se não autenticado
  - `/pcp`: acessível para Admin e PCP
  - `/rep`: acessível para Admin e Representante
  - `/`: redireciona automaticamente para a rota do papel do usuário autenticado

### Área Admin
- Gerenciamento de usuários (aprovar, atribuir perfis)
- Cadastro de tipos de cliente com regras de precificação
- Cadastro de categorias e modelos de produtos
- Cadastro de tecidos (globais, associados a modelos)
- Cadastro de variantes e atributos por modelo
- Todos os dados são persistidos no Supabase

### Área Representante/PCP
- Simulador de pré-custo com cálculo automático
- Seleção de modelos, tecidos, variantes e atributos
- Carrinho de itens
- Geração de PDF do orçamento
- Salvamento de orçamentos no banco de dados
