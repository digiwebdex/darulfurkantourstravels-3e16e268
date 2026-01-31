-- Create why_choose_us table for managing "Why Choose Us" section
CREATE TABLE public.why_choose_us (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  icon_name TEXT NOT NULL DEFAULT 'Shield',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.why_choose_us ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view active why_choose_us items"
ON public.why_choose_us
FOR SELECT
USING (is_active = true);

-- Admin can manage
CREATE POLICY "Admin can manage why_choose_us"
ON public.why_choose_us
FOR ALL
USING (public.is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_why_choose_us_updated_at
BEFORE UPDATE ON public.why_choose_us
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data
INSERT INTO public.why_choose_us (icon_name, title, description, order_index) VALUES
('Users', 'অভিজ্ঞ টিম', '১০+ বছরের অভিজ্ঞ দল আপনার সেবায়', 1),
('FileCheck', 'ভিসা প্রসেসিং', 'দ্রুত ও নির্ভরযোগ্য ভিসা প্রসেসিং', 2),
('Building', 'রিয়াদুল জান্নাহ সাপোর্ট', 'মসজিদে নববীতে বিশেষ সহায়তা', 3),
('Clock', '২৪/৭ সাপোর্ট', 'সার্বক্ষণিক কাস্টমার সাপোর্ট', 4),
('Shield', 'নিরাপদ পেমেন্ট', 'SSL সিকিউর পেমেন্ট গেটওয়ে', 5),
('HeartHandshake', 'লিখিত চুক্তি', 'সম্পূর্ণ স্বচ্ছ চুক্তিপত্র', 6);

-- Create quick_packages table for managing Quick Package Highlight section
CREATE TABLE public.quick_packages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  icon_name TEXT NOT NULL DEFAULT 'Building2',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_label TEXT,
  link TEXT NOT NULL DEFAULT '#packages',
  gradient_from TEXT NOT NULL DEFAULT 'primary',
  gradient_to TEXT NOT NULL DEFAULT 'emerald-dark',
  icon_bg TEXT NOT NULL DEFAULT 'bg-primary/10',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quick_packages ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view active quick_packages"
ON public.quick_packages
FOR SELECT
USING (is_active = true);

-- Admin can manage
CREATE POLICY "Admin can manage quick_packages"
ON public.quick_packages
FOR ALL
USING (public.is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_quick_packages_updated_at
BEFORE UPDATE ON public.quick_packages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data
INSERT INTO public.quick_packages (icon_name, title, description, price, link, gradient_from, gradient_to, icon_bg, is_featured, order_index) VALUES
('Building2', 'হজ্জ প্যাকেজ', 'পবিত্র হজ্জ ২০২৬ - প্রিমিয়াম সার্ভিস', 850000, '#hajj', 'primary', 'emerald-dark', 'bg-primary/10', false, 1),
('Moon', 'উমরাহ প্যাকেজ', 'সারা বছর উমরাহ - বিশেষ অফার', 135000, '#umrah', 'accent', 'gold', 'bg-accent/10', false, 2),
('Moon', 'রমজান ইতিকাফ', 'রমজানের শেষ ১০ দিন মক্কায় ইতিকাফ', 250000, '#umrah', 'purple-600', 'purple-800', 'bg-purple-100', false, 3),
('Gift', 'বিশেষ অফার', 'প্রতি ৫০ জনে ১ জন ফ্রি উমরাহ!', 0, '#packages', 'rose-500', 'red-600', 'bg-rose-100', true, 4);

-- Create cta_content table for managing CTA section
CREATE TABLE public.cta_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'আপনার আধ্যাত্মিক যাত্রা শুরু করুন আজই',
  subtitle TEXT NOT NULL DEFAULT 'হজ্জ ও উমরাহর পবিত্র যাত্রায় আমরা আপনার পাশে আছি। এখনই বুকিং করুন এবং বিশেষ ছাড় পান!',
  primary_button_text TEXT NOT NULL DEFAULT 'এখনই বুকিং করুন',
  primary_button_link TEXT NOT NULL DEFAULT '#packages',
  secondary_button_text TEXT NOT NULL DEFAULT 'কল করুন',
  secondary_button_link TEXT NOT NULL DEFAULT 'tel:+8801339080532',
  show_primary_button BOOLEAN NOT NULL DEFAULT true,
  show_secondary_button BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cta_content ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view cta_content"
ON public.cta_content
FOR SELECT
USING (true);

-- Admin can manage
CREATE POLICY "Admin can manage cta_content"
ON public.cta_content
FOR ALL
USING (public.is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_cta_content_updated_at
BEFORE UPDATE ON public.cta_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data
INSERT INTO public.cta_content (title, subtitle, primary_button_text, primary_button_link, secondary_button_text, secondary_button_link) VALUES
('আপনার আধ্যাত্মিক যাত্রা শুরু করুন আজই', 'হজ্জ ও উমরাহর পবিত্র যাত্রায় আমরা আপনার পাশে আছি। এখনই বুকিং করুন এবং বিশেষ ছাড় পান!', 'এখনই বুকিং করুন', '#packages', 'কল করুন', 'tel:+8801339080532');

-- Create why_choose_settings table for section header
CREATE TABLE public.why_choose_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  badge_text TEXT NOT NULL DEFAULT 'আমাদের বিশেষত্ব',
  title TEXT NOT NULL DEFAULT 'কেন আমাদের বেছে নেবেন?',
  subtitle TEXT NOT NULL DEFAULT 'আমরা আপনার পবিত্র যাত্রাকে স্মরণীয় করতে প্রতিশ্রুতিবদ্ধ',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.why_choose_settings ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view why_choose_settings"
ON public.why_choose_settings
FOR SELECT
USING (true);

-- Admin can manage
CREATE POLICY "Admin can manage why_choose_settings"
ON public.why_choose_settings
FOR ALL
USING (public.is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_why_choose_settings_updated_at
BEFORE UPDATE ON public.why_choose_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data
INSERT INTO public.why_choose_settings (badge_text, title, subtitle) VALUES
('আমাদের বিশেষত্ব', 'কেন আমাদের বেছে নেবেন?', 'আমরা আপনার পবিত্র যাত্রাকে স্মরণীয় করতে প্রতিশ্রুতিবদ্ধ');

-- Create quick_packages_settings table for section header
CREATE TABLE public.quick_packages_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'আমাদের প্যাকেজসমূহ',
  subtitle TEXT NOT NULL DEFAULT 'আপনার পবিত্র যাত্রার জন্য সেরা প্যাকেজ নির্বাচন করুন',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quick_packages_settings ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view quick_packages_settings"
ON public.quick_packages_settings
FOR SELECT
USING (true);

-- Admin can manage
CREATE POLICY "Admin can manage quick_packages_settings"
ON public.quick_packages_settings
FOR ALL
USING (public.is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_quick_packages_settings_updated_at
BEFORE UPDATE ON public.quick_packages_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default data
INSERT INTO public.quick_packages_settings (title, subtitle) VALUES
('আমাদের প্যাকেজসমূহ', 'আপনার পবিত্র যাত্রার জন্য সেরা প্যাকেজ নির্বাচন করুন');