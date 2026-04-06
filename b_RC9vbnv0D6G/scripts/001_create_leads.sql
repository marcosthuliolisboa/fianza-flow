-- Tabela para armazenar leads/simulações de antecipação de aluguel
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  valor_aluguel DECIMAL(10, 2) NOT NULL,
  percentual INTEGER NOT NULL,
  meses INTEGER NOT NULL,
  valor_antecipado DECIMAL(10, 2) NOT NULL,
  telefone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção pública (sem autenticação necessária)
CREATE POLICY "allow_public_insert" ON public.leads
  FOR INSERT
  WITH CHECK (true);

-- Política para permitir leitura apenas por usuários autenticados (admin)
CREATE POLICY "allow_authenticated_select" ON public.leads
  FOR SELECT
  USING (auth.role() = 'authenticated');
