-- Create hotels table
CREATE TABLE public.hotels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT DEFAULT 'Saudi Arabia',
  star_rating INTEGER DEFAULT 3 CHECK (star_rating >= 1 AND star_rating <= 5),
  distance_from_haram NUMERIC DEFAULT 0,
  description TEXT,
  facilities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  google_map_link TEXT,
  google_map_embed_url TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create hotel section settings table
CREATE TABLE public.hotel_section_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE DEFAULT 'general',
  title TEXT DEFAULT 'Hotel Bookings',
  subtitle TEXT DEFAULT 'Find your perfect stay',
  is_enabled BOOLEAN DEFAULT true,
  booking_enabled BOOLEAN DEFAULT true,
  star_label TEXT DEFAULT 'Star',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create hotel booking requests table
CREATE TABLE public.hotel_booking_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id TEXT NOT NULL UNIQUE,
  hotel_id UUID REFERENCES public.hotels(id),
  user_id UUID,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  guest_phone TEXT NOT NULL,
  country_code TEXT DEFAULT '+880',
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  room_count INTEGER DEFAULT 1,
  adult_count INTEGER DEFAULT 2,
  child_count INTEGER DEFAULT 0,
  special_requests TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_section_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotel_booking_requests ENABLE ROW LEVEL SECURITY;

-- Hotels: Public read access
CREATE POLICY "Anyone can view active hotels" ON public.hotels FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage hotels" ON public.hotels FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Settings: Public read, admin write
CREATE POLICY "Anyone can view hotel settings" ON public.hotel_section_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage hotel settings" ON public.hotel_section_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Booking requests: Anyone can create, users see their own, admins see all
CREATE POLICY "Anyone can create hotel booking requests" ON public.hotel_booking_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own requests" ON public.hotel_booking_requests FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
CREATE POLICY "Admins can manage all booking requests" ON public.hotel_booking_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Insert default settings
INSERT INTO public.hotel_section_settings (section_key, title, subtitle) VALUES ('general', 'Hotel Bookings', 'Find your perfect stay');

-- Update trigger
CREATE TRIGGER update_hotels_updated_at BEFORE UPDATE ON public.hotels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hotel_settings_updated_at BEFORE UPDATE ON public.hotel_section_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hotel_booking_requests_updated_at BEFORE UPDATE ON public.hotel_booking_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();