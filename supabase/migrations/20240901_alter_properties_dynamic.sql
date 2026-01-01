-- Add columns for dynamic form support to properties table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS form_version TEXT,
ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;

-- Index on data for better JSON querying performance if needed later
CREATE INDEX IF NOT EXISTS idx_properties_data ON properties USING gin (data);
