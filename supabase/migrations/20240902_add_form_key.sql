-- Add form_key to properties to distinguish between different dynamic forms (e.g. PROPERTY_INTERNAL vs PROPERTY_BROKER)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS form_key TEXT;
