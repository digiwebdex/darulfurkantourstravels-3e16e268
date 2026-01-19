-- Add hero slider settings to site_settings table
INSERT INTO public.site_settings (setting_key, setting_value, category)
VALUES 
  ('hero_autoplay_interval', '"6"'::jsonb, 'hero'),
  ('hero_transition_speed', '"normal"'::jsonb, 'hero')
ON CONFLICT (setting_key) DO NOTHING;