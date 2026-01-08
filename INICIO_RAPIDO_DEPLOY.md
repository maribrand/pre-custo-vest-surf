# ⚡ Início Rápido - Deploy em 5 Minutos

Guia ultra-simplificado para colocar o site no ar AGORA.

---

## 🎯 Comandos para Copiar e Colar

### 1️⃣ Inicializar Git (dentro da pasta do projeto)

```bash
git init
git add .
git commit -m "Initial commit: App Pré-Custo Vest Surf"
```

### 2️⃣ Criar Repositório no GitHub

1. Vá em: https://github.com/new
2. Nome: `pre-custo-vest-surf`
3. Clique em **"Create repository"**
4. **Copie a URL** que aparece (ex: `https://github.com/seu-usuario/pre-custo-vest-surf.git`)

### 3️⃣ Enviar para GitHub

```bash
# Substitua a URL pela sua
git remote add origin https://github.com/SEU-USUARIO/pre-custo-vest-surf.git
git branch -M main
git push -u origin main
```

### 4️⃣ Deploy no Vercel

1. Acesse: https://vercel.com
2. Clique: **"Add New..." → "Project"**
3. Selecione seu repositório
4. Configure:
   - **Root Directory:** `frontend` ⚠️
   - **Framework:** Vite
5. Adicione **Environment Variables**:
   - `VITE_SUPABASE_URL` = sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` = sua chave anon
6. Clique em **"Deploy"**

---

## ✅ Pronto!

Em 2 minutos seu site estará online em:
```
https://seu-projeto.vercel.app
```

---

## 🔄 Para Atualizar Depois

```bash
git add .
git commit -m "Descrição das mudanças"
git push
```

Deploy automático! 🚀

---

**Dúvidas?** Veja o guia completo em [DEPLOY.md](./DEPLOY.md)
