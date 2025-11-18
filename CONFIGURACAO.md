# ⚡ CONFIGURAÇÃO RÁPIDA - PASSO A PASSO

## 🔴 PROBLEMA: Telas em Branco

As telas estão em branco porque o Supabase ainda não foi configurado!

## ✅ SOLUÇÃO RÁPIDA (5 minutos)

### 1️⃣ Criar Conta no Supabase

1. Acesse: https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub ou email

### 2️⃣ Criar Novo Projeto

1. Clique em "New Project"
2. Preencha:
   - **Name**: `qr-hunt-game` (ou qualquer nome)
   - **Database Password**: Crie uma senha forte (anote!)
   - **Region**: Escolha o mais próximo (ex: São Paulo)
3. Clique em "Create new project"
4. ⏳ Aguarde 2-3 minutos enquanto cria

### 3️⃣ Copiar Credenciais

1. No painel do Supabase, clique em **"Settings"** (⚙️) no menu lateral
2. Clique em **"API"**
3. Você verá:
   - **Project URL** → Copie
   - **anon public** → Copie (clique em "Reveal" se necessário)

### 4️⃣ Configurar o Projeto

1. Abra o arquivo `.env` na raiz do projeto
2. Substitua:

```env
VITE_SUPABASE_URL=cole-aqui-a-project-url
VITE_SUPABASE_ANON_KEY=cole-aqui-a-anon-key
```

**Exemplo real:**
```env
VITE_SUPABASE_URL=https://abcdefghijk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE2...
```

### 5️⃣ Criar Tabelas no Banco

1. No Supabase, clique em **"SQL Editor"** no menu lateral
2. Clique em **"New query"**
3. Abra o arquivo `supabase/schema.sql` deste projeto
4. **Copie TODO o conteúdo**
5. **Cole** no SQL Editor do Supabase
6. Clique em **"Run"** (ou Ctrl+Enter)
7. ✅ Deve aparecer "Success. No rows returned"

### 6️⃣ Reiniciar o Servidor

No terminal, pare o servidor (Ctrl+C) e inicie novamente:

```bash
npm run dev
```

### 7️⃣ Testar

Acesse: http://localhost:5173

Agora as telas devem funcionar! 🎉

---

## 🎯 Testar as Telas

1. **Página Inicial**: http://localhost:5173/
2. **Dashboard**: http://localhost:5173/dashboard
3. **Gerador QR**: http://localhost:5173/generate-qr

---

## ❌ Ainda com Problemas?

### Tela ainda em branco?
- Abra o Console do navegador (F12)
- Veja se há erros em vermelho
- Verifique se copiou as credenciais corretamente (sem espaços extras)

### Erro de conexão?
- Confirme que o SQL foi executado com sucesso
- Verifique se o projeto Supabase está "Active" (verde)
- Tente fazer logout/login no Supabase

### Palavras não aparecem?
- Certifique-se que executou o arquivo `schema.sql` completamente
- Acesse "Table Editor" no Supabase e veja se a tabela `keywords` existe
- Verifique se há dados na tabela

---

## 📞 Dúvidas?

Depois de configurar, você pode:
- Adicionar mais palavras editando o `schema.sql`
- Gerar os QR codes em `/generate-qr`
- Testar o fluxo completo

**Importante:** Após configurar, reinicie o navegador para garantir que as variáveis de ambiente sejam carregadas!
