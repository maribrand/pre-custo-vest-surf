# Guia de Configuração - Integração Supabase

## Passo 1: Instalar Dependências

Execute no terminal (dentro da pasta `frontend`):

```bash
cd frontend
npm install
```

Isso instalará o pacote `@supabase/supabase-js` que está faltando.

## Passo 2: Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Name**: Nome do seu projeto (ex: "pre-custo-vest")
   - **Database Password**: Escolha uma senha forte (anote ela!)
   - **Region**: Escolha a região mais próxima (ex: South America - São Paulo)
5. Clique em "Create new project"
6. Aguarde alguns minutos enquanto o projeto é criado

## Passo 3: Aplicar Migração do Banco de Dados

1. No dashboard do Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em **New Query**
3. Abra o arquivo `supabase/migrations/20260101181253_initial_schema.sql` do projeto
4. Copie TODO o conteúdo do arquivo
5. Cole no editor SQL do Supabase
6. Clique em **Run** (ou pressione Ctrl+Enter / Cmd+Enter)
7. Aguarde a execução e verifique se apareceu "Success"

## Passo 4: Obter Credenciais do Supabase

1. No dashboard do Supabase, vá em **Settings** (ícone de engrenagem no menu lateral)
2. Clique em **API**
3. Você verá duas informações importantes:
   - **Project URL**: Algo como `https://xxxxx.supabase.co`
   - **anon public key**: Uma chave longa começando com `eyJ...`

## Passo 5: Configurar Variáveis de Ambiente

1. No diretório `frontend/`, crie um arquivo chamado `.env.local`:

```bash
cd frontend
touch .env.local
```

2. Abra o arquivo `.env.local` e adicione:

```
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

**Substitua:**
- `sua_url_aqui` pela **Project URL** do Passo 4
- `sua_chave_anon_aqui` pela **anon public key** do Passo 4

**Exemplo:**
```
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Passo 6: Reiniciar o Servidor de Desenvolvimento

1. Pare o servidor Vite (se estiver rodando) pressionando `Ctrl+C` no terminal
2. Inicie novamente:

```bash
npm run dev
```

## Passo 7: Testar a Aplicação

1. Abra o navegador em `http://localhost:5173`
2. Escolha o perfil **Admin / Precificação**
3. Tente cadastrar um tipo de cliente:
   - Preencha os campos
   - Clique em "Cadastrar"
   - Verifique se aparece mensagem de sucesso
4. Verifique no Supabase se os dados foram salvos:
   - No dashboard do Supabase, vá em **Table Editor**
   - Selecione a tabela `customer_types`
   - Você deve ver o registro que acabou de criar!

## Passo 8: Desabilitar RLS (Row Level Security) - Opcional

Por padrão, o Supabase tem RLS habilitado. Para permitir que todos possam ler/escrever (apenas para desenvolvimento):

1. No dashboard do Supabase, vá em **Authentication** > **Policies**
2. Para cada tabela (`customer_types`, `product_models`, `fabrics`, etc.):
   - Clique na tabela
   - Se não houver políticas, crie uma política permissiva:
     - **Policy name**: "Allow all operations"
     - **Allowed operation**: SELECT, INSERT, UPDATE, DELETE
     - **Target roles**: anon, authenticated
     - **USING expression**: `true`
     - **WITH CHECK expression**: `true`

**OU** execute este SQL no SQL Editor para desabilitar RLS temporariamente (apenas para desenvolvimento):

```sql
-- Desabilitar RLS em todas as tabelas (APENAS PARA DESENVOLVIMENTO!)
ALTER TABLE public.customer_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_models DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.fabrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_fabrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.options DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_options DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_item_options DISABLE ROW LEVEL SECURITY;
```

## Verificação Final

Após seguir todos os passos:

✅ O servidor Vite deve iniciar sem erros  
✅ A aplicação deve carregar sem erros de módulo  
✅ Na primeira execução, os dados do `seed.ts` serão migrados automaticamente  
✅ Todos os cadastros feitos no frontend serão salvos no Supabase  
✅ Você pode verificar os dados no **Table Editor** do Supabase

## Troubleshooting

### Erro: "Failed to resolve import @supabase/supabase-js"
**Solução**: Execute `npm install` na pasta `frontend`

### Erro: "Missing Supabase environment variables"
**Solução**: Verifique se o arquivo `.env.local` existe e tem as variáveis corretas

### Erro: "permission denied" ao salvar dados
**Solução**: Desabilite RLS ou crie políticas permissivas (Passo 8)

### Dados não aparecem no Table Editor
**Solução**: 
- Verifique se a migração foi aplicada corretamente (Passo 3)
- Verifique se há erros no console do navegador
- Verifique se o RLS está desabilitado ou há políticas permissivas

