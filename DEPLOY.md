# 🚀 GUIA RÁPIDO DE DEPLOY

## Deploy no Vercel (Recomendado)

### 1. Instale o Vercel CLI

```bash
npm i -g vercel
```

### 2. Faça login

```bash
vercel login
```

### 3. Deploy

```bash
vercel
```

Siga as instruções e configure:
- Project name: `qr-hunt-game` (ou seu nome preferido)
- Directory: `./` (raiz do projeto)
- Build command: `npm run build`
- Output directory: `dist`

### 4. Configure as variáveis de ambiente

No dashboard da Vercel:
1. Acesse seu projeto
2. Settings → Environment Variables
3. Adicione:
   - `VITE_SUPABASE_URL`: sua URL do Supabase
   - `VITE_SUPABASE_ANON_KEY`: sua chave anon do Supabase

### 5. Redeploy

```bash
vercel --prod
```

## Deploy no Netlify

### 1. Instale o Netlify CLI

```bash
npm i -g netlify-cli
```

### 2. Faça login

```bash
netlify login
```

### 3. Deploy

```bash
netlify deploy --prod
```

Configure:
- Build command: `npm run build`
- Publish directory: `dist`

### 4. Configure as variáveis de ambiente

No dashboard do Netlify:
1. Site settings → Environment variables
2. Adicione as mesmas variáveis do Supabase

## Após o Deploy

### ⚠️ IMPORTANTE: Atualize os QR Codes

Depois do deploy, você terá uma URL de produção (ex: `https://seu-app.vercel.app`).

1. Acesse `/generate-qr` na URL de produção
2. Baixe NOVOS QR codes (eles usarão a URL correta)
3. Imprima e espalhe pelo evento

## Checklist Final

- [ ] Deploy realizado com sucesso
- [ ] Variáveis de ambiente configuradas
- [ ] Schema SQL executado no Supabase
- [ ] Palavras cadastradas no banco
- [ ] QR codes gerados com URL de produção
- [ ] QR codes testados e funcionando
- [ ] QR codes impressos e plastificados
- [ ] Locais de esconderijo planejados

## Testes Antes do Evento

1. Acesse a URL de produção no celular
2. Teste escanear um QR code
3. Confirme que a palavra aparece
4. Verifique o dashboard
5. Teste todos os QR codes

---

Qualquer dúvida, consulte o README.md principal!
