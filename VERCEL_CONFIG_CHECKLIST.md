# ✅ Checklist de Configuração - Deploy Vercel

## 🎯 Configurações no Painel da Vercel

Siga **EXATAMENTE** estas configurações:

### 1️⃣ Framework Preset
```
Vite
```

### 2️⃣ Root Directory
```
frontend
```

### 3️⃣ Build Command
```
npm run build
```

### 4️⃣ Output Directory
```
dist
```

### 5️⃣ Install Command
```
npm install
```

---

## 🔑 Variáveis de Ambiente (Environment Variables)

Configure as seguintes variáveis na aba **"Environment Variables"**:

### VITE_SUPABASE_URL
- **Value:** Cole o valor direto do Supabase (ex: `https://seuprojeto.supabase.co`)
- **Environments:** ✅ Production ✅ Preview ✅ Development

### VITE_SUPABASE_ANON_KEY
- **Value:** Cole a chave `anon public` do Supabase (ex: `eyJhbGc...`)
- **Environments:** ✅ Production ✅ Preview ✅ Development

**Onde encontrar:**
1. Acesse [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá em **Settings → API**
4. **Project URL** = `VITE_SUPABASE_URL`
5. **Project API keys → anon public** = `VITE_SUPABASE_ANON_KEY`

---

## ⚠️ ERROS COMUNS E COMO EVITAR

### ❌ ERRO: "cd: frontend: No such file or directory"
**Causa:** Duplicação do caminho (usando `cd frontend` quando Root Directory já está definido)

**Solução:** 
- Se Root Directory = `frontend`, NÃO use `cd frontend` nos comandos
- Build Command deve ser apenas: `npm run build`
- Install Command deve ser apenas: `npm install`

### ❌ ERRO: "Referências da Variável de Ambiente ... que não existe"
**Causa:** Usar referências a secrets (como `@vite_supabase_url`) em vez de valores diretos

**Solução:**
- Cole os valores **diretos** das variáveis
- Não use `@` ou `$` para referenciar variáveis

### ❌ ERRO: Output Directory incorreto
**Causa:** Usar `frontend/dist` quando Root Directory já é `frontend`

**Solução:**
- Se Root Directory = `frontend`, Output Directory deve ser apenas: `dist`

---

## 📦 Estrutura do Projeto

```
PROJETO PRÉ CUSTO VEST - Antigravity - backup/
├── frontend/              ← Root Directory
│   ├── src/
│   ├── dist/             ← Output Directory (gerado no build)
│   ├── package.json
│   └── vite.config.ts
├── vercel.json           ← Apenas rewrites e headers
└── README.md
```

---

## 🚀 Passo a Passo para Deploy

### 1. Verificar Configurações da Vercel
- [ ] Root Directory = `frontend`
- [ ] Build Command = `npm run build`
- [ ] Output Directory = `dist`
- [ ] Install Command = `npm install`
- [ ] Framework Preset = `Vite`

### 2. Configurar Variáveis de Ambiente
- [ ] `VITE_SUPABASE_URL` configurada
- [ ] `VITE_SUPABASE_ANON_KEY` configurada
- [ ] Ambas marcadas para Production, Preview e Development

### 3. Fazer Deploy
- [ ] Fazer commit das alterações
- [ ] Fazer push para o GitHub
- [ ] Clicar em "Redeploy" na Vercel
- [ ] Aguardar build completar (1-2 minutos)

### 4. Verificar Deploy
- [ ] Build concluído sem erros
- [ ] Site acessível via URL da Vercel
- [ ] Login funcionando
- [ ] Dados carregando do Supabase

---

## 🆘 Se o Deploy Falhar

1. **Veja os logs completos** clicando em "View Build Logs"
2. **Verifique se o Root Directory está correto**
3. **Confirme que as variáveis de ambiente estão configuradas**
4. **Teste o build localmente:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```
5. **Se funcionar localmente mas falhar na Vercel**, compare as configurações com este checklist

---

## 📝 Comandos Úteis

### Testar Build Local
```bash
cd "/Users/marianagregorio/Desktop/PROJETO PRÉ CUSTO VEST - Antigravity - backup/frontend"
npm install
npm run build
npm run preview
```

### Ver Status do Git
```bash
cd "/Users/marianagregorio/Desktop/PROJETO PRÉ CUSTO VEST - Antigravity - backup"
git status
```

### Fazer Commit e Push
```bash
git add .
git commit -m "sua mensagem"
git push
```

---

## ✅ Checklist Final

Antes de fazer deploy, confirme:

- [ ] Todas as correções de TypeScript foram aplicadas
- [ ] Build local funciona (`npm run build` sem erros)
- [ ] Variáveis de ambiente copiadas do `.env.local.example`
- [ ] `vercel.json` atualizado (sem buildCommand, outputDirectory, installCommand)
- [ ] Configurações no painel da Vercel corretas
- [ ] Commit e push realizados
- [ ] Migrações do Supabase aplicadas

---

**Última atualização:** Deploy corrigido com sucesso!
**Commit:** `e6ff698` - fix: corrigir vercel.json para deploy
