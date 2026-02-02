-- Create hotel_destinations table for admin-managed countries
CREATE TABLE public.hotel_destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  flag_url TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hotel_destinations ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view active destinations"
  ON public.hotel_destinations
  FOR SELECT
  USING (is_active = true);

-- Authenticated users can manage
CREATE POLICY "Authenticated users can manage destinations"
  ON public.hotel_destinations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default destinations
INSERT INTO public.hotel_destinations (country_name, country_code, flag_url, order_index) VALUES
  ('Saudi Arabia', 'sa', 'https://flagcdn.com/w80/sa.png', 1),
  ('Dubai', 'ae', 'https://flagcdn.com/w80/ae.png', 2),
  ('Turkey', 'tr', 'https://flagcdn.com/w80/tr.png', 3),
  ('Malaysia', 'my', 'https://flagcdn.com/w80/my.png', 4),
  ('Thailand', 'th', 'https://flagcdn.com/w80/th.png', 5),
  ('Singapore', 'sg', 'https://flagcdn.com/w80/sg.png', 6),
  ('Indonesia', 'id', 'https://flagcdn.com/w80/id.png', 7),
  ('Egypt', 'eg', 'https://flagcdn.com/w80/eg.png', 8);