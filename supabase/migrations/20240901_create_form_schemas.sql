-- Create table for storing dynamic form schemas
CREATE TABLE IF NOT EXISTS form_schemas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_key TEXT NOT NULL, -- e.g., 'PROPERTY', 'USER_PROFILE'
    version TEXT NOT NULL, -- e.g., 'v1', 'v2'
    steps JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of steps with fields
    status TEXT NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'ACTIVE', 'DEPRECATED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure unique combination of form_key and version
    UNIQUE(form_key, version)
);

-- Add RLS policies
ALTER TABLE form_schemas ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read access to authenticated users" ON form_schemas
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow write access only to admins (we can refine this later, but for now only admins manage schemas)
-- Note: The seeding happens via server action with service role or admin check, 
-- but it's good to have RLS as backup.
CREATE POLICY "Allow insert/update access to admins" ON form_schemas
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );
