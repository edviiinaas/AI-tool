-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL, -- To ensure message belongs to the user of the conversation
  sender TEXT NOT NULL, -- 'user', 'system', or agent_id
  text TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT,
  file_size TEXT,
  file_url TEXT, -- If storing direct URLs to uploaded files in Supabase Storage
  timestamp TIMESTAMPTZ DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
  status TEXT -- 'sending', 'sent', 'delivered', 'failed'
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Users can only interact with messages in conversations they own
CREATE POLICY "Users can CRUD messages in their own conversations."
  ON messages FOR ALL
  USING (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM conversations c WHERE c.id = conversation_id AND c.user_id = auth.uid()
  ));

-- Index for faster querying of messages by conversation_id
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
