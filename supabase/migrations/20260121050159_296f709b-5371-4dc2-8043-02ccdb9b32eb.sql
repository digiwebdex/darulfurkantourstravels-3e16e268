-- Create notices table for announcements
CREATE TABLE public.notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  attachment_url TEXT,
  attachment_name TEXT,
  external_link TEXT,
  external_link_text TEXT DEFAULT 'Learn More',
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  notice_type TEXT NOT NULL DEFAULT 'general' CHECK (notice_type IN ('general', 'hajj', 'umrah', 'visa', 'offer', 'important')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active notices" 
ON public.notices 
FOR SELECT 
USING (
  is_active = true 
  AND (start_date IS NULL OR start_date <= now())
  AND (end_date IS NULL OR end_date >= now())
  OR is_admin()
);

CREATE POLICY "Admins can insert notices" 
ON public.notices 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update notices" 
ON public.notices 
FOR UPDATE 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can delete notices" 
ON public.notices 
FOR DELETE 
USING (is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_notices_updated_at
BEFORE UPDATE ON public.notices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add notices to section_settings
INSERT INTO public.section_settings (section_key, title, is_active, order_index)
VALUES ('notices', 'Notice Board', true, 1)
ON CONFLICT (section_key) DO NOTHING;