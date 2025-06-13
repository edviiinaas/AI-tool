CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  timestamp TIMESTAMPTZ DEFAULT timezone('utc'::TEXT, now()) NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  event_type TEXT, -- e.g., 'agentResponse', 'docAnalysisComplete'
  href TEXT, -- Link to navigate to on click
  icon_name TEXT -- Store name of Lucide icon, e.g., 'MessageCircle'
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD their own notifications."
  ON notifications FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_timestamp ON notifications(user_id, timestamp DESC);
