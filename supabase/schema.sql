-- Tabela de palavras-chave
CREATE TABLE keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  word TEXT NOT NULL UNIQUE,
  points INTEGER NOT NULL,
  size TEXT NOT NULL CHECK (size IN ('small', 'medium', 'large')),
  is_found BOOLEAN DEFAULT FALSE,
  found_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de jogadores (opcional, caso queira rastrear múltiplos jogadores)
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de descobertas (relaciona jogadores com palavras encontradas)
CREATE TABLE discoveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  keyword_id UUID REFERENCES keywords(id),
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, keyword_id)
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE discoveries ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (para o jogo funcionar sem autenticação)
CREATE POLICY "Enable read access for all users" ON keywords
  FOR SELECT USING (true);

CREATE POLICY "Enable update for all users" ON keywords
  FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON players
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON players
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for all users" ON players
  FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON discoveries
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON discoveries
  FOR INSERT WITH CHECK (true);

-- Função para atualizar pontuação do jogador
CREATE OR REPLACE FUNCTION update_player_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE players
  SET total_points = (
    SELECT COALESCE(SUM(k.points), 0)
    FROM discoveries d
    JOIN keywords k ON d.keyword_id = k.id
    WHERE d.player_id = NEW.player_id
  )
  WHERE id = NEW.player_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar pontos automaticamente
CREATE TRIGGER trigger_update_player_points
AFTER INSERT ON discoveries
FOR EACH ROW
EXECUTE FUNCTION update_player_points();

-- Dados de exemplo (ajuste conforme necessário)
INSERT INTO keywords (word, points, size) VALUES
  ('INOVAÇÃO', 50, 'small'),
  ('TECNOLOGIA', 30, 'medium'),
  ('FUTURO', 20, 'large'),
  ('SUSTENTABILIDADE', 50, 'small'),
  ('CRIATIVIDADE', 30, 'medium'),
  ('COLABORAÇÃO', 20, 'large'),
  ('TRANSFORMAÇÃO', 50, 'small'),
  ('DESIGN', 30, 'medium'),
  ('IMPACTO', 20, 'large'),
  ('COMUNIDADE', 40, 'small');
