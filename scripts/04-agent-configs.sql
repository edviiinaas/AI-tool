-- Create agent_configs table
CREATE TABLE IF NOT EXISTS agent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  agent_id TEXT NOT NULL, -- e.g., 'magnus', 'pricing-ai' (AgentSlug from constants)
  master_prompt TEXT,
  temperature NUMERIC(2,1) DEFAULT 0.7, -- e.g., 0.0 to 1.0 or 2.0 depending on model
  response_style TEXT DEFAULT 'balanced', -- 'concise', 'detailed', 'balanced'
  token_limit INTEGER DEFAULT 2048,
  is_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
  UNIQUE(user_id, agent_id) -- Ensure one config per agent per user
);

ALTER TABLE agent_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own agent configurations."
  ON agent_configs FOR ALL
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_agent_configs_updated_at ON agent_configs;
CREATE TRIGGER update_agent_configs_updated_at
  BEFORE UPDATE ON agent_configs
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();
