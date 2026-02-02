-- Create offer popup settings table
CREATE TABLE public.offer_popup_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Exclusive Hajj & Umrah Offer!',
  subtitle TEXT DEFAULT 'Limited Time Only',
  description TEXT DEFAULT 'Book now and get special discounts on our premium packages.',
  button_text TEXT DEFAULT 'View Packages',
  button_link TEXT DEFAULT '#hajj-packages',
  image_url TEXT,
  background_color TEXT DEFAULT '#10b981',
  text_color TEXT DEFAULT '#ffffff',
  is_enabled BOOLEAN DEFAULT true,
  show_on_every_visit BOOLEAN DEFAULT false,
  delay_seconds INTEGER DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.offer_popup_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for active popup
CREATE POLICY "Anyone can view enabled popup" 
ON public.offer_popup_settings 
FOR SELECT 
USING (true);

-- Admin can manage popup settings
CREATE POLICY "Authenticated users can manage popup settings" 
ON public.offer_popup_settings 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Insert default popup settings
INSERT INTO public.offer_popup_settings (
  title,
  subtitle,
  description,
  button_text,
  button_link,
  is_enabled
) VALUES (
  '🕋 Exclusive Hajj & Umrah Offer!',
  '✨ Limited Time Only ✨',
  'Book your sacred journey now and enjoy special discounts on our premium packages. Early bird offer ends soon!',
  'View Packages',
  '#hajj-packages',
  true
);

-- Add trigger for updated_at
CREATE TRIGGER update_offer_popup_settings_updated_at
BEFORE UPDATE ON public.offer_popup_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();