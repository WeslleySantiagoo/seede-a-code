-- Adiciona coluna para rastrear quem escaneou primeiro
ALTER TABLE keywords ADD COLUMN claimed_by_player_id UUID REFERENCES players(id);
ALTER TABLE keywords ADD COLUMN claimed_at TIMESTAMP WITH TIME ZONE;

-- Adiciona índice para melhorar performance
CREATE INDEX idx_keywords_claimed ON keywords(claimed_by_player_id);
