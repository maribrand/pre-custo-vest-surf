# Changelog

Todas as mudanças relevantes do projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [Não Publicado]

### Corrigido
- **Recursão Infinita nas RLS Policies**:
  - Corrigido erro crítico de "infinite recursion detected" nas policies do Supabase
  - Criada função auxiliar `is_admin()` com `SECURITY DEFINER` para evitar recursão
  - Novas policies de admin usando a função auxiliar em vez de subqueries diretas
  - Nova migração: `20260108000000_fix_rls_recursion.sql`
- **Tela de Aprovação Pendente**:
  - Adicionado botão "Sair" para permitir logout e re-login após aprovação
  - Melhor UX para usuários aguardando aprovação

### Adicionado
- **Header Global com Logout**:
  - Novo componente `Header` no topo de todas as páginas autenticadas
  - Exibe nome do app, badge do perfil (Admin/PCP/Representante) e email do usuário
  - Botão "Sair" sempre visível no canto superior direito
  - Design limpo e responsivo com sombra sutil
- **Configuração de Deploy**:
  - Arquivo `vercel.json` com configurações otimizadas para Vercel
  - `.gitignore` atualizado com padrões de produção
  - Script `deploy:check` para testar build localmente
  - Documentação completa de deploy (`DEPLOY.md`)
  - Guia rápido de início (`INICIO_RAPIDO_DEPLOY.md`)
  - Instruções para deploy automático via GitHub + Vercel

### Modificado
- **Sistema de Autenticação - Nova Regra de Cadastro**:
  - Usuário agora escolhe o perfil (Admin/PCP/Representante) durante o cadastro
  - Removida interface de gerenciamento de usuários do app (UsersManager)
  - Aprovação de usuários agora é feita manualmente no painel do Supabase
  - Mensagens atualizadas para indicar que aprovação é feita no Supabase
  - Após aprovação no Supabase, usuário tem acesso imediato à sua página
  - Mantida regra: Admin tem acesso a todas as páginas (admin, pcp, representante)
- **Fluxo de Navegação**:
  - App passou a usar React Router com rotas protegidas por papel (`/login`, `/admin`, `/pcp`, `/rep`)
  - Redirecionamento automático para a rota do papel após login e aprovação
  - Seletor manual de papéis removido da UI principal; acesso depende do perfil real

### Adicionado
- Sistema completo de autenticação e controle de acesso:
  - Autenticação com email e senha via Supabase Auth
  - Tabela `user_profiles` para gerenciar perfis de usuário (admin, pcp, rep)
  - Sistema de aprovação de usuários (novos usuários aguardam aprovação do admin)
  - RLS (Row Level Security) policies para proteger dados de perfis
  - Componentes de Login e Registro
  - Componente `ProtectedRoute` para proteger rotas baseado em perfil
  - Contexto de autenticação (`AuthContext`) para gerenciar estado global
  - Hook `useAuth` para facilitar acesso ao contexto de autenticação
  - Serviços de autenticação (`authService`) e perfis (`userProfilesService`)
  - Gerenciador de usuários (`UsersManager`) para administradores:
    - Listar usuários pendentes de aprovação
    - Aprovar usuários e atribuir perfis
    - Alterar perfis de usuários aprovados
    - Desaprovar usuários
  - Controle de acesso baseado em perfis:
    - Admin: Acesso completo a todas as páginas (admin, PCP, representante)
    - PCP: Acesso apenas à página PCP
    - Representante: Acesso apenas à página Representante
  - Botão de logout no header quando autenticado
  - Mensagens de feedback para usuários aguardando aprovação
  - Dependência `react-router-dom` para gerenciamento de rotas protegidas

### Adicionado (anterior)
- Schema inicial do banco de dados PostgreSQL com todas as tabelas necessárias para o sistema de pré-custo
- Estrutura de migrações do Supabase em `supabase/migrations/`
- Tabelas de Master Data (Admin):
  - `customer_types`: Tipos de cliente com regras de precificação (taxa fixa e markup percentual)
  - `product_categories`: Categorias de produtos
  - `product_models`: Modelos de produtos com custo base e consumo de tecido
  - `fabrics`: Catálogo de tecidos com custo por metro
  - `model_fabrics`: Relação N:N entre modelos e tecidos disponíveis
  - `options`: Sistema unificado de variantes e atributos
  - `model_options`: Relação N:N entre modelos e opções com possibilidade de sobrescrita de custos
- Tabelas de Sales Flow:
  - `quotes`: Orçamentos/carrinhos com status e cliente
  - `quote_items`: Itens de orçamento com snapshots de valores para preservar histórico
  - `quote_item_options`: Opções selecionadas em cada item com snapshots
- Sistema de triggers automáticos para atualização do campo `updated_at` em todas as tabelas
- Índices para otimização de consultas nas relações mais frequentes
- Extensão `pgcrypto` para geração de UUIDs
- Integração completa do frontend com Supabase:
  - Cliente Supabase configurado (`@supabase/supabase-js`)
  - Serviços de acesso aos dados (services layer):
    - `customerTypesService`: CRUD de tipos de cliente
    - `productCategoriesService`: CRUD de categorias
    - `productModelsService`: CRUD de modelos
    - `fabricsService`: CRUD de tecidos e associações com modelos
    - `optionsService`: CRUD de variantes e atributos unificados
    - `quotesService`: CRUD de orçamentos com cálculo de snapshots
  - Hook customizado `useSupabaseData` para carregar dados do banco
  - Migração automática de dados iniciais (`migrateSeedData`)
- Refatoração de todos os componentes Admin para usar serviços Supabase:
  - `ClientTypesManager`: Persistência de tipos de cliente
  - `ProductModelsManager`: Persistência de modelos e categorias
  - `FabricsManager`: Persistência de tecidos (globais com associação por modelo)
  - `VariationsManager`: Persistência de variantes
  - `AttributesManager`: Persistência de atributos
- Integração do `SellerLayout` com `quotesService`:
  - Botão "Salvar Orçamento" para persistir carrinho no banco
  - Cálculo automático de snapshots ao salvar
- Estados de loading e erro no `App.tsx`
- Variáveis de ambiente para configuração do Supabase (`.env.local`)
- Documentação atualizada com instruções de configuração

### Modificado
- `App.tsx`: Substituído armazenamento em memória por carregamento do Supabase
- Todos os componentes Admin: Operações agora são assíncronas e persistem no banco
- `SellerLayout`: Adicionada funcionalidade de salvar orçamentos no banco

### Removido
- Dependência de dados mockados em memória (mantido `seed.ts` apenas para migração inicial)

