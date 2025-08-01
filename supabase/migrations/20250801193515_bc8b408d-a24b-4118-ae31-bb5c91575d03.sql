-- Re-enable RLS
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

-- Create a bypass function for testing that allows access to our test user
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
BEGIN
  -- For testing purposes, always return our mock user ID
  RETURN '12345678-1234-1234-1234-123456789012'::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;