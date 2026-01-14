# 🔧 Guia de Correção - Erros de Deploy

## 🔴 Erros Identificados:

1. **Timeouts ao carregar dados** (variantes, atributos, tecidos, modelos)
2. **404 NOT_FOUND** do Supabase
3. **AuthApiError: Invalid Refresh Token**
4. **Erros 400 e 406** nas requisições

---

## ✅ SOLUÇÃO PASSO A PASSO:

### **PASSO 1: Aplicar Nova Migração de RLS Policies**

Esta é a correção mais importante! As policies antigas estavam bloqueando o acesso aos dados.

1. **Acesse o Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Selecione seu projeto

2. **Vá em SQL Editor** (no menu lateral)

3. **Copie e Cole TODO o conteúdo** do arquivo:
   ```
   supabase/migrations/20260109000000_fix_rls_policies.sql
   ```

4. **Clique em "Run"** (ou pressione Ctrl+Enter)

5. **Verifique se apareceu "Success"** ✅

---

### **PASSO 2: Verificar se as Migrações Anteriores Foram Aplicadas**

Execute cada uma dessas queries no SQL Editor do Supabase:

#### **2.1 Verificar se as tabelas existem:**

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Você DEVE ver todas estas tabelas:**
- ✅ customer_types
- ✅ fabrics
- ✅ model_fabrics
- ✅ model_options
- ✅ options
- ✅ product_categories
- ✅ product_models
- ✅ quote_item_options
- ✅ quote_items
- ✅ quotes
- ✅ user_profiles

**Se alguma tabela estiver faltando:**
- Aplique a migração `20260101181253_initial_schema.sql`
- Aplique a migração `20260102173053_user_profiles.sql`
- Aplique a migração `20260108000000_fix_rls_recursion.sql`

---

#### **2.2 Verificar se a função is_admin() existe:**

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'is_admin';
```

**Deve retornar:** `is_admin`

**Se não retornar nada:**
- Aplique a migração `20260108000000_fix_rls_recursion.sql`

---

#### **2.3 Verificar as Policies:**

```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Você deve ver policies como:**
- `Authenticated users can view customer types`
- `Authenticated users can view categories`
- `Authenticated users can view models`
- `Authenticated users can view fabrics`
- Etc.

---

### **PASSO 3: Criar Usuário Admin**

O sistema precisa de pelo menos um usuário admin aprovado.

```sql
-- 1. Primeiro, crie o usuário no Auth (ou faça cadastro pela interface)

-- 2. Depois, execute este script substituindo o EMAIL do usuário:
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Busca o user_id pelo email
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'SEU_EMAIL@AQUI.COM';  -- ⚠️ SUBSTITUA PELO SEU EMAIL

  -- Se o usuário existe, cria/atualiza o perfil
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_profiles (user_id, role, is_approved)
    VALUES (admin_user_id, 'admin', true)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      role = 'admin',
      is_approved = true,
      updated_at = now();
    
    RAISE NOTICE 'Usuário admin criado/atualizado com sucesso!';
  ELSE
    RAISE EXCEPTION 'Usuário não encontrado. Crie a conta primeiro.';
  END IF;
END $$;
```

---

### **PASSO 4: Inserir Dados Iniciais (Opcional)**

Se o banco estiver vazio, você pode inserir alguns dados de teste:

```sql
-- Categoria de teste
INSERT INTO public.product_categories (name) 
VALUES ('Camisetas')
ON CONFLICT (name) DO NOTHING;

-- Tipo de cliente de teste
INSERT INTO public.customer_types (name, payment_terms, shipping_method, fixed_fee, markup_pct)
VALUES ('Atacado', 'À vista', 'FOB', 50.00, 20.00)
ON CONFLICT (name) DO NOTHING;
```

---

### **PASSO 5: Limpar Cache do Navegador e Fazer Logout**

1. **Abra o Console do navegador** (F12)
2. **Execute:**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   ```
3. **Recarregue a página** (Ctrl+R ou Cmd+R)
4. **Faça login novamente**

---

### **PASSO 6: Testar Novamente**

1. Faça login com o usuário admin que você criou
2. Vá para a página **Admin**
3. Tente cadastrar:
   - Um tipo de cliente
   - Uma categoria
   - Um modelo de produto

---

## 🔍 **VERIFICAÇÃO DOS ERROS:**

### **Se ainda aparecer "404 NOT_FOUND":**

1. Verifique se as variáveis de ambiente na Vercel estão corretas:
   - `VITE_SUPABASE_URL` = URL correta do projeto
   - `VITE_SUPABASE_ANON_KEY` = Chave `anon public` correta

2. Verifique se o projeto do Supabase está ativo (não pausado)

### **Se ainda aparecer "Invalid Refresh Token":**

1. Limpe o cache do navegador
2. Faça logout
3. Faça login novamente

### **Se ainda aparecer timeouts:**

1. Abra o Console do navegador (F12)
2. Vá na aba **Network**
3. Veja quais requisições estão falhando
4. Copie a resposta de erro e me envie

---

## 📋 **CHECKLIST FINAL:**

Antes de testar novamente, confirme:

- [ ] Aplicada migração `20260109000000_fix_rls_policies.sql`
- [ ] Todas as tabelas existem no Supabase
- [ ] Função `is_admin()` existe
- [ ] Policies novas criadas
- [ ] Usuário admin criado e aprovado
- [ ] Cache do navegador limpo
- [ ] Logout e login realizados
- [ ] Variáveis de ambiente na Vercel corretas

---

## 🆘 **Se os Erros Persistirem:**

Me envie:

1. **Screenshot da aba Network** (F12 → Network) mostrando as requisições falhando
2. **Console log completo** com os erros
3. **Lista de policies** (resultado da query do Passo 2.3)
4. **Lista de tabelas** (resultado da query do Passo 2.1)

---

**Última atualização:** 2025-01-14
