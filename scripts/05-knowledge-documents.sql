-- Create knowledge_documents table
CREATE TABLE IF NOT EXISTS knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT, -- 'pdf', 'csv', 'txt', 'docx'
  file_size_kb NUMERIC, -- Store size in KB for easier calculations
  storage_path TEXT, -- Path in Supabase Storage, e.g., 'user_id/document_id/file_name.pdf'
  uploaded_at TIMESTAMPTZ DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
  status TEXT DEFAULT 'processing', -- 'processing', 'ready', 'error'
  summary TEXT,
  associated_agent_ids TEXT[] -- Agent IDs this doc is linked to
);

ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own knowledge documents."
  ON knowledge_documents FOR ALL
  USING (auth.uid() = user_id);

-- Setup Supabase Storage Bucket (run this once, or ensure it exists)
-- You might need to do this via the Supabase Dashboard if you prefer UI for bucket creation.
-- The policy below assumes a bucket named 'knowledge_files'.

-- Example Storage RLS policies (adjust bucket name and paths as needed):
-- Assumes files are stored under user_id/
-- Replace 'knowledge_files' with your actual bucket name.

-- CREATE POLICY "Users can view their own files."
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'knowledge_files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can upload to their own folder."
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'knowledge_files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can update their own files."
--   ON storage.objects FOR UPDATE
--   USING (bucket_id = 'knowledge_files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete their own files."
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'knowledge_files' AND auth.uid()::text = (storage.foldername(name))[1]);
