# 🎯 Caça às Palavras - QR Hunt Game

Sistema de gamificação para eventos usando QR codes e palavras-chave. Participantes escaneiam QR codes escondidos pelo evento para coletar palavras e ganhar pontos!

> ⚠️ **TELAS EM BRANCO?** Você precisa configurar o Supabase primeiro! Siga o guia → [CONFIGURACAO.md](./CONFIGURACAO.md)

## 🎨 Cores da Identidade Visual

- **Azul Marinho**: `#063472`
- **Azul**: `#0162b3`
- **Verde Escuro**: `#aebd24`
- **Verde Limão**: `#d8ea32`
- **Branco Gelo**: `#fbfafc`

## 🚀 Tecnologias

- **React** - Interface do usuário
- **Vite** - Build tool e dev server
- **TailwindCSS** - Estilização
- **Supabase** - Backend e banco de dados
- **React Router** - Navegação
- **qrcode.react** - Geração de QR codes

## 📋 Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)

## 🛠️ Instalação

### 1. Clone o repositório e instale as dependências

```bash
npm install
```

### 2. Configure o Supabase

1. Crie um novo projeto no [Supabase](https://supabase.com)
2. Acesse o **SQL Editor** no dashboard do Supabase
3. Execute o script SQL em `supabase/schema.sql` para criar as tabelas e políticas

### 3. Configure as variáveis de ambiente

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Preencha as credenciais do Supabase no arquivo `.env`:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-key
```

Você encontra essas informações em:
- Supabase Dashboard → Settings → API

### 4. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

## 📱 Como Funciona

### Para os Participantes:

1. **Página Inicial** (`/`)
   - Apresentação do jogo e instruções

2. **Escanear QR Code**
   - Cada QR code redireciona para `/found/:keywordId`
   - Mostra a palavra encontrada e os pontos ganhos
   - Botão para confirmar a descoberta

3. **Dashboard** (`/dashboard`)
   - Visualiza todas as palavras (encontradas e não encontradas)
   - Mostra pontuação total
   - Progresso do jogo

### Para Organizadores:

1. **Gerador de QR Codes** (`/generate-qr`)
   - Gera QR codes para todas as palavras cadastradas
   - Permite download individual ou em lote
   - Mostra preview de cada QR code

## 🎮 Sistema de Pontuação

Os QR codes têm diferentes tamanhos e pontuações:

| Tamanho | Pontos | Dimensões | Uso Recomendado |
|---------|--------|-----------|-----------------|
| Small   | 50     | 150x150px | Lugares difíceis/escondidos |
| Medium  | 30     | 200x200px | Lugares intermediários |
| Large   | 20     | 300x300px | Lugares fáceis/visíveis |

## 🗄️ Estrutura do Banco de Dados

### Tabela: `keywords`

```sql
- id (UUID) - Primary Key
- word (TEXT) - Palavra-chave
- points (INTEGER) - Pontuação
- size (TEXT) - Tamanho do QR (small/medium/large)
- is_found (BOOLEAN) - Se já foi encontrada
- found_at (TIMESTAMP) - Data/hora da descoberta
- created_at (TIMESTAMP) - Data de criação
```

## 📦 Estrutura do Projeto

```
src/
├── lib/
│   └── supabase.js          # Configuração do cliente Supabase
├── pages/
│   ├── Home.jsx             # Página inicial
│   ├── FoundKeyword.jsx     # Página de palavra encontrada
│   ├── Dashboard.jsx        # Dashboard de pontuação
│   └── QRGenerator.jsx      # Gerador de QR codes
├── App.jsx                  # Rotas principais
├── main.jsx                 # Entry point
└── index.css                # Estilos globais + TailwindCSS

supabase/
└── schema.sql               # Script de criação do banco de dados
```

## 🎯 Preparação para o Evento

### 1. Cadastrar Palavras

Edite o arquivo `supabase/schema.sql` e adicione suas palavras:

```sql
INSERT INTO keywords (word, points, size) VALUES
  ('SUA_PALAVRA_1', 50, 'small'),
  ('SUA_PALAVRA_2', 30, 'medium'),
  ('SUA_PALAVRA_3', 20, 'large');
```

Execute o script no SQL Editor do Supabase.

### 2. Gerar QR Codes

1. Acesse `/generate-qr` no navegador
2. Clique em "Baixar Todos os QR Codes" ou baixe individualmente
3. Imprima os QR codes

### 3. Preparar os QR Codes

- ✅ Imprima em papel de boa qualidade
- ✅ Plastifique ou use adesivos para proteção
- ✅ Teste todos os QR codes antes do evento
- ✅ Esconda conforme a dificuldade (small = mais difícil)

### 4. Deploy

Para produção, faça deploy em serviços como:
- **Vercel** (recomendado)
- **Netlify**
- **Cloudflare Pages**

```bash
npm run build
```

**Importante:** Após o deploy, atualize a URL base nos QR codes se necessário.

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Lint
npm run lint
```

## 🎨 Personalização

### Adicionar Novas Palavras via SQL

```sql
INSERT INTO keywords (word, points, size) VALUES
  ('INOVAÇÃO', 50, 'small'),
  ('TECNOLOGIA', 30, 'medium');
```

### Resetar Todas as Descobertas

```sql
UPDATE keywords 
SET is_found = FALSE, found_at = NULL;
```

### Ver Estatísticas

```sql
-- Total de pontos possíveis
SELECT SUM(points) FROM keywords;

-- Palavras encontradas
SELECT COUNT(*) FROM keywords WHERE is_found = TRUE;

-- Ranking de palavras por pontos
SELECT word, points, is_found 
FROM keywords 
ORDER BY points DESC;
```

## 📝 Notas Importantes

1. **Segurança**: O projeto usa Row Level Security (RLS) do Supabase com políticas públicas, adequado para eventos com sessão única
2. **Múltiplos Jogadores**: Para rastrear múltiplos jogadores, implemente a lógica usando as tabelas `players` e `discoveries` já criadas no schema
3. **QR Codes**: Os URLs dos QR codes usam o ID único de cada palavra para segurança
4. **Mobile First**: Interface otimizada para dispositivos móveis

## 🐛 Troubleshooting

### QR Code não abre o site
- Verifique se o projeto está rodando
- Confirme a URL no código QR
- Teste em diferentes leitores de QR code

### Palavras não aparecem
- Verifique as credenciais do Supabase no `.env`
- Confirme que o schema SQL foi executado
- Verifique o console do navegador para erros

### Erro ao confirmar descoberta
- Verifique as políticas RLS no Supabase
- Confirme que as tabelas foram criadas corretamente

## 📄 Licença

MIT

---

**Bom evento! 🎉**

