# 🚀 Guia de Deploy - Vercel + GitHub

Este guia mostra como colocar seu projeto **App de Pré-Custo Vest Surf** no ar usando GitHub e Vercel.

---

## 📋 Pré-requisitos

- ✅ Conta no [GitHub](https://github.com) (gratuita)
- ✅ Conta no [Vercel](https://vercel.com) (gratuita)
- ✅ Projeto Supabase configurado e funcionando localmente

---

## 🎯 Passo 1: Preparar o Repositório no GitHub

### 1.1 Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Nomeie o repositório: `pre-custo-vest-surf` (ou outro nome)
3. **NÃO** marque "Add a README file"
4. **NÃO** marque "Add .gitignore"
5. Clique em **"Create repository"**

### 1.2 Inicializar Git e Fazer Primeiro Commit

No terminal, dentro da pasta do projeto:

```bash
# Inicializar repositório Git
git init

# Adicionar todos os arquivos
git add .

# Fazer primeiro commit
git commit -m "Initial commit: App de Pré-Custo Vest Surf"

# Adicionar origem remota (substitua SEU-USUARIO e SEU-REPO)
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git

# Enviar para o GitHub
git branch -M main
git push -u origin main
```

**⚠️ IMPORTANTE:** As variáveis `.env.local` **NÃO** serão enviadas (estão no `.gitignore`). Isso é seguro!

---

## 🚀 Passo 2: Deploy no Vercel

### 2.1 Conectar GitHub ao Vercel

1. Acesse https://vercel.com
2. Clique em **"Add New..." → "Project"**
3. Clique em **"Import Git Repository"**
4. Selecione seu repositório `pre-custo-vest-surf`
5. Clique em **"Import"**

### 2.2 Configurar o Build

O Vercel detecta automaticamente que é um projeto Vite, mas verifique:

- **Framework Preset:** Vite
- **Root Directory:** `frontend` ⚠️ **IMPORTANTE**
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 2.3 Adicionar Variáveis de Ambiente

**CRÍTICO:** Sem isso o site não funciona!

1. Na tela de configuração, vá em **"Environment Variables"**
2. Adicione as seguintes variáveis (pegue do seu `.env.local`):

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://seu-projeto.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sua-chave-anon-aqui` |

3. Selecione **"Production"**, **"Preview"** e **"Development"**

### 2.4 Deploy!

1. Clique em **"Deploy"**
2. Aguarde 1-2 minutos ⏳
3. 🎉 **Site no ar!**

---

## 🔗 Seu Site Estará Disponível

```
https://seu-projeto.vercel.app
```

Você pode configurar um domínio personalizado depois em **"Settings → Domains"**

---

## 🔄 Atualizações Futuras

### Deploy Automático

A partir de agora, **qualquer push** para o GitHub faz deploy automático:

```bash
# Fazer mudanças no código
git add .
git commit -m "Descrição das mudanças"
git push
```

O Vercel detecta o push e faz deploy automático em 1-2 minutos! 🚀

---

## ⚙️ Configurações Avançadas

### Mudar Variáveis de Ambiente

1. Acesse o projeto no Vercel
2. Vá em **"Settings → Environment Variables"**
3. Edite ou adicione variáveis
4. Clique em **"Redeploy"** para aplicar

### Domínio Personalizado

1. Vá em **"Settings → Domains"**
2. Adicione seu domínio
3. Configure DNS conforme instruções

### Ver Logs de Build

1. Acesse seu projeto no Vercel
2. Clique em **"Deployments"**
3. Clique em qualquer deploy
4. Veja logs completos

---

## 🆘 Troubleshooting

### Erro: "Build failed"

**Solução:**
1. Verifique os logs de build no Vercel
2. Certifique-se que `Root Directory` está como `frontend`
3. Verifique se todas as dependências estão no `package.json`

### Erro: "Page not found" ou tela branca

**Solução:**
1. Verifique se as variáveis de ambiente estão configuradas
2. Abra o console do navegador (F12) e veja erros
3. Verifique se o Supabase está acessível

### Erro: "Infinite recursion" ou "500 error"

**Solução:**
1. Certifique-se que aplicou a migração `20260108000000_fix_rls_recursion.sql` no Supabase
2. Verifique as RLS policies no Supabase

---

## 📊 Monitoramento

O Vercel oferece gratuitamente:
- ✅ Analytics de tráfego
- ✅ Logs de erro
- ✅ Performance metrics
- ✅ Preview de cada commit

Acesse em **"Analytics"** e **"Logs"** no painel do Vercel.

---

## 🎉 Pronto!

Seu **App de Pré-Custo Vest Surf** está online e acessível para qualquer pessoa!

Compartilhe o link: `https://seu-projeto.vercel.app` 🚀

---

## 📝 Checklist Final

- [ ] Repositório criado no GitHub
- [ ] Código commitado e enviado
- [ ] Projeto conectado no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy bem-sucedido
- [ ] Site acessível e funcionando
- [ ] Login/logout funcionando
- [ ] Todas as migrações aplicadas no Supabase

---

**Dúvidas?** Consulte a [documentação do Vercel](https://vercel.com/docs) ou [Supabase](https://supabase.com/docs).
