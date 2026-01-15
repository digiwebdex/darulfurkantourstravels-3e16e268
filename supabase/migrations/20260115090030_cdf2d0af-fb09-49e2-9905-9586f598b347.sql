-- CMS Content Tables

-- Navigation Menu Items
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Hero Section Content
CREATE TABLE public.hero_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  badge_text TEXT,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  primary_button_text TEXT,
  primary_button_link TEXT,
  secondary_button_text TEXT,
  secondary_button_link TEXT,
  background_image_url TEXT,
  stats JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Services Section
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  icon_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Testimonials
CREATE TABLE public.testimonials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  package_name TEXT,
  rating INTEGER NOT NULL DEFAULT 5,
  quote TEXT NOT NULL,
  avatar_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Team Members
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  qualifications TEXT,
  avatar_url TEXT,
  board_type TEXT NOT NULL DEFAULT 'management',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FAQ Items
CREATE TABLE public.faq_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Contact Info
CREATE TABLE public.contact_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  title TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '[]'::jsonb,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Footer Content
CREATE TABLE public.footer_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_description TEXT,
  quick_links JSONB DEFAULT '[]'::jsonb,
  services_links JSONB DEFAULT '[]'::jsonb,
  social_links JSONB DEFAULT '[]'::jsonb,
  copyright_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Visa Countries
CREATE TABLE public.visa_countries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_name TEXT NOT NULL,
  flag_emoji TEXT NOT NULL,
  processing_time TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Section Settings (for section titles and descriptions)
CREATE TABLE public.section_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visa_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_settings ENABLE ROW LEVEL SECURITY;

-- Public read policies for all CMS tables
CREATE POLICY "Anyone can view active menu items" ON public.menu_items FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Anyone can view active hero content" ON public.hero_content FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Anyone can view active services" ON public.services FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Anyone can view active testimonials" ON public.testimonials FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Anyone can view active team members" ON public.team_members FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Anyone can view active faq items" ON public.faq_items FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Anyone can view active contact info" ON public.contact_info FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Anyone can view footer content" ON public.footer_content FOR SELECT USING (true);
CREATE POLICY "Anyone can view active visa countries" ON public.visa_countries FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "Anyone can view active section settings" ON public.section_settings FOR SELECT USING (is_active = true OR is_admin());

-- Admin write policies for all CMS tables
CREATE POLICY "Admins can insert menu items" ON public.menu_items FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update menu items" ON public.menu_items FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete menu items" ON public.menu_items FOR DELETE USING (is_admin());

CREATE POLICY "Admins can insert hero content" ON public.hero_content FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update hero content" ON public.hero_content FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete hero content" ON public.hero_content FOR DELETE USING (is_admin());

CREATE POLICY "Admins can insert services" ON public.services FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update services" ON public.services FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete services" ON public.services FOR DELETE USING (is_admin());

CREATE POLICY "Admins can insert testimonials" ON public.testimonials FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update testimonials" ON public.testimonials FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete testimonials" ON public.testimonials FOR DELETE USING (is_admin());

CREATE POLICY "Admins can insert team members" ON public.team_members FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update team members" ON public.team_members FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete team members" ON public.team_members FOR DELETE USING (is_admin());

CREATE POLICY "Admins can insert faq items" ON public.faq_items FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update faq items" ON public.faq_items FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete faq items" ON public.faq_items FOR DELETE USING (is_admin());

CREATE POLICY "Admins can insert contact info" ON public.contact_info FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update contact info" ON public.contact_info FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete contact info" ON public.contact_info FOR DELETE USING (is_admin());

CREATE POLICY "Admins can insert footer content" ON public.footer_content FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update footer content" ON public.footer_content FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete footer content" ON public.footer_content FOR DELETE USING (is_admin());

CREATE POLICY "Admins can insert visa countries" ON public.visa_countries FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update visa countries" ON public.visa_countries FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete visa countries" ON public.visa_countries FOR DELETE USING (is_admin());

CREATE POLICY "Admins can insert section settings" ON public.section_settings FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "Admins can update section settings" ON public.section_settings FOR UPDATE USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can delete section settings" ON public.section_settings FOR DELETE USING (is_admin());

-- Add triggers for updated_at
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hero_content_updated_at BEFORE UPDATE ON public.hero_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_faq_items_updated_at BEFORE UPDATE ON public.faq_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contact_info_updated_at BEFORE UPDATE ON public.contact_info FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_footer_content_updated_at BEFORE UPDATE ON public.footer_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_visa_countries_updated_at BEFORE UPDATE ON public.visa_countries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_section_settings_updated_at BEFORE UPDATE ON public.section_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();