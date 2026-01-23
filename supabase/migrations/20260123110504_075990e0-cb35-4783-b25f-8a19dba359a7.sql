-- Add video position column to footer_content
ALTER TABLE public.footer_content 
ADD COLUMN IF NOT EXISTS video_position text DEFAULT 'center';