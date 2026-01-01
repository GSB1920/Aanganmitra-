-- Create form_schemas table
CREATE TABLE IF NOT EXISTS form_schemas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_key TEXT NOT NULL,
  version TEXT NOT NULL,
  steps JSONB NOT NULL,
  status TEXT DEFAULT 'DRAFT', -- DRAFT, ACTIVE, DEPRECATED
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(form_key, version)
);

-- Update properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS form_version TEXT,
ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}';

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_properties_data ON properties USING GIN (data);
