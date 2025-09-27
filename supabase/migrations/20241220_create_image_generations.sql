-- Create image_generations table
CREATE TABLE IF NOT EXISTS image_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  api_provider TEXT NOT NULL CHECK (api_provider IN ('gpt5', 'google_imagen', 'qwen')),
  image_url TEXT,
  image_data BYTEA,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_image_generations_user_id ON image_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_image_generations_created_at ON image_generations(created_at DESC);

-- Enable RLS
ALTER TABLE image_generations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own image generations" ON image_generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own image generations" ON image_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own image generations" ON image_generations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own image generations" ON image_generations
  FOR DELETE USING (auth.uid() = user_id);
