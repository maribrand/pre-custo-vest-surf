# ⚠️ CORREÇÃO URGENTE - Recursão Infinita nas RLS Policies

## Problema Identificado

O erro **"infinite recursion detected in policy for relation 'user_profiles'"** está impedindo o sistema de autenticação de funcionar corretamente. Isso acontece porque as policies do Supabase estão criando um loop infinito ao verificar permissões.

## Solução

Execute a migração de correção no Supabase **AGORA** para resolver o problema.

---

## 📋 Passo a Passo

### 1. Acesse o Supabase Dashboard

1. Vá para: https://supabase.com
2. Abra seu projeto
3. Clique em **SQL Editor** no menu lateral

### 2. Execute a Migração de Correção

1. Clique em **New Query**
2. Copie **TODO** o conteúdo do arquivo:
   ```
   supabase/migrations/20260108000000_fix_rls_recursion.sql
   ```
3. Cole no SQL Editor
4. Clique em **Run** (ou pressione Ctrl+Enter)

### 3. Verifique se Funcionou

Você deve ver a mensagem:
```
Success. No rows returned
```

### 4. Teste no Navegador

1. No navegador, faça **logout** (use o novo botão "Sair")
2. Faça **login** novamente
3. Agora o perfil aprovado deve carregar corretamente! ✅

---

## 🔍 O Que a Migração Faz

- Remove as policies antigas que causavam recursão
- Cria uma função auxiliar `is_admin()` com `SECURITY DEFINER`
- Recria as policies usando a função auxiliar (evita recursão)

---

## ❗ Importante

- **NÃO pule esta etapa** - sem ela, o sistema de autenticação não funcionará
- A migração é **segura** e não apaga dados
- Leva apenas **alguns segundos** para executar

---

## 🆘 Se Ainda Não Funcionar

1. Limpe o cache do navegador: `Ctrl+Shift+Del` (Windows) ou `Cmd+Shift+Del` (Mac)
2. Feche todas as abas do `localhost:5173`
3. Abra novamente e faça login

---

## ✅ Após Aplicar a Correção

O sistema deve funcionar normalmente:
- Login com email/senha ✅
- Perfil aprovado carrega automaticamente ✅
- Redirecionamento para `/admin`, `/pcp` ou `/rep` conforme o papel ✅
- Polling automático funciona ✅
