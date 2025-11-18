# QR Code de Uso Único

## O que mudou?

Agora cada QR code só pode ser escaneado e reivindicado por **uma única pessoa**. Quando alguém escaneia um QR code pela primeira vez e confirma, esse QR code fica bloqueado para todos os outros jogadores.

## Como funciona?

### 1. Primeira pessoa a escanear
- Escaneia o QR code
- Vê a tela com informações da palavra
- Clica em "Confirmar Descoberta"
- **Reivindica** o QR code permanentemente
- Ganha os pontos

### 2. Outras pessoas que tentarem escanear depois
- Escaneiam o mesmo QR code
- Veem uma tela informando que o QR já foi usado
- Mostra o nome da pessoa que reivindicou
- Não ganham pontos
- São direcionadas para continuar procurando outros QR codes

## Mudanças no banco de dados

Execute a migration para adicionar as colunas necessárias:

```sql
-- Arquivo: supabase/migration-single-use-qr.sql
ALTER TABLE keywords ADD COLUMN claimed_by_player_id UUID REFERENCES players(id);
ALTER TABLE keywords ADD COLUMN claimed_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX idx_keywords_claimed ON keywords(claimed_by_player_id);
```

## Como aplicar no Supabase

1. Acesse seu projeto no Supabase
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo `supabase/migration-single-use-qr.sql`
4. Execute a query
5. Pronto! O sistema está atualizado

## Telas atualizadas

### FoundKeyword.jsx
- ✅ Verifica se o QR já foi reivindicado
- ✅ Mostra tela de "QR code já utilizado" com nome do jogador
- ✅ Protege contra race conditions (duas pessoas escaneando ao mesmo tempo)
- ✅ Atualiza automaticamente quem reivindicou

### Dashboard.jsx
- ✅ Mostra quem reivindicou cada QR code
- ✅ Diferencia visualmente QR codes disponíveis vs reivindicados
- ✅ Destaca quando você foi quem reivindicou

## Vantagens

✅ Estimula a corrida para achar os QR codes primeiro  
✅ Torna o jogo mais competitivo e justo  
✅ Evita que uma pessoa use o mesmo QR code várias vezes  
✅ Cada QR code tem valor único e real no evento  
✅ Dashboard mostra claramente a situação de cada palavra  

## Observações

- O sistema protege contra race conditions (duas pessoas clicando ao mesmo tempo)
- Uma vez reivindicado, o QR code fica permanentemente bloqueado
- Não há como "desreivindicar" um QR code
- O primeiro a confirmar leva os pontos
