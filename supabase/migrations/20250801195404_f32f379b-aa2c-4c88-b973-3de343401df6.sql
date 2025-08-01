-- Add deleted_at column for soft delete functionality
ALTER TABLE public.items ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;