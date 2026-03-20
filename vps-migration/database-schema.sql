-- ================================================
-- Darul Furkan Tours & Travels - Complete Database Schema
-- Self-Hosted Migration - Generated 2026-03-20
-- ================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================
-- CUSTOM ENUMS
-- ================================================

DO $$ BEGIN
  CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.package_type AS ENUM ('hajj', 'umrah');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.tracking_status AS ENUM ('order_submitted', 'documents_received', 'under_review', 'approved', 'processing', 'completed');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('customer', 'admin', 'demo_admin');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.staff_role AS ENUM ('admin', 'manager', 'agent', 'support');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ================================================
-- TABLES
-- ================================================

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  role user_role NOT NULL DEFAULT 'customer',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Packages
CREATE TABLE IF NOT EXISTS public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  full_description text,
  price numeric NOT NULL,
  duration_days integer NOT NULL DEFAULT 7,
  type package_type NOT NULL,
  category text,
  includes text[],
  exclusions text[],
  image_url text,
  hotel_image_url text,
  hotel_images text[],
  hotel_map_link text,
  hotel_rating integer,
  hotel_type text,
  flight_type text,
  transport_type text,
  stock integer NOT NULL DEFAULT 10,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean DEFAULT false,
  show_book_now boolean DEFAULT true,
  show_view_details boolean DEFAULT true,
  special_notes text,
  installment_enabled boolean DEFAULT false,
  min_down_payment_percent integer DEFAULT 30,
  max_installment_months integer DEFAULT 6,
  countdown_end_date timestamptz,
  weekly_bookings integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  package_id uuid NOT NULL REFERENCES public.packages(id),
  guest_name text,
  guest_email text,
  guest_phone text,
  passenger_count integer NOT NULL DEFAULT 1,
  passenger_details jsonb,
  travel_date date,
  total_price numeric NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  payment_status text NOT NULL DEFAULT 'pending',
  payment_method text,
  transaction_id text,
  bank_transaction_number text,
  bank_transfer_screenshot_url text,
  tracking_status tracking_status NOT NULL DEFAULT 'order_submitted',
  notes text,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Booking Status History
CREATE TABLE IF NOT EXISTS public.booking_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id),
  previous_status tracking_status,
  new_status tracking_status NOT NULL,
  changed_by uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;

-- Booking Documents
CREATE TABLE IF NOT EXISTS public.booking_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id),
  user_id uuid NOT NULL,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.booking_documents ENABLE ROW LEVEL SECURITY;

-- Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id),
  emi_installment_id uuid,
  payment_method text NOT NULL,
  gateway_name text NOT NULL,
  transaction_id text,
  gateway_transaction_id text,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'BDT',
  status text NOT NULL DEFAULT 'initiated',
  is_live_mode boolean NOT NULL DEFAULT false,
  request_payload jsonb,
  response_payload jsonb,
  error_message text,
  ip_address text,
  user_agent text,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- EMI Payments
CREATE TABLE IF NOT EXISTS public.emi_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES public.bookings(id),
  total_amount numeric NOT NULL,
  advance_amount numeric NOT NULL DEFAULT 0,
  emi_amount numeric NOT NULL,
  number_of_emis integer NOT NULL,
  paid_emis integer NOT NULL DEFAULT 0,
  remaining_amount numeric NOT NULL,
  is_emi_plan boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.emi_payments ENABLE ROW LEVEL SECURITY;

-- EMI Installments
CREATE TABLE IF NOT EXISTS public.emi_installments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emi_payment_id uuid NOT NULL REFERENCES public.emi_payments(id),
  installment_number integer NOT NULL,
  amount numeric NOT NULL,
  due_date date,
  paid_date date,
  status text NOT NULL DEFAULT 'pending',
  payment_method text,
  transaction_id text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.emi_installments ENABLE ROW LEVEL SECURITY;

-- Hero Content
CREATE TABLE IF NOT EXISTS public.hero_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  description text,
  badge_text text,
  background_image_url text,
  video_url text,
  primary_button_text text,
  primary_button_link text,
  secondary_button_text text,
  secondary_button_link text,
  slide_type text NOT NULL DEFAULT 'image',
  stats jsonb,
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;

-- CTA Content
CREATE TABLE IF NOT EXISTS public.cta_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  subtitle text NOT NULL DEFAULT '',
  primary_button_text text NOT NULL DEFAULT 'Book Now',
  primary_button_link text NOT NULL DEFAULT '#packages',
  secondary_button_text text NOT NULL DEFAULT 'Contact Us',
  secondary_button_link text NOT NULL DEFAULT '#contact',
  show_primary_button boolean NOT NULL DEFAULT true,
  show_secondary_button boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cta_content ENABLE ROW LEVEL SECURITY;

-- Contact Info
CREATE TABLE IF NOT EXISTS public.contact_info (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL,
  icon_name text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}',
  map_link text,
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;

-- FAQ Items
CREATE TABLE IF NOT EXISTS public.faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;

-- Footer Content
CREATE TABLE IF NOT EXISTS public.footer_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_description text,
  contact_address text,
  contact_address_2 text,
  address_label_1 text,
  address_label_2 text,
  contact_email text,
  contact_phones text[],
  copyright_text text,
  quick_links jsonb,
  services_links jsonb,
  social_links jsonb,
  video_url text,
  video_enabled boolean DEFAULT false,
  video_opacity numeric DEFAULT 0.3,
  video_blur numeric DEFAULT 0,
  video_speed numeric DEFAULT 1,
  video_scale numeric DEFAULT 1,
  video_position text DEFAULT 'center',
  video_overlay_color text DEFAULT 'rgba(0,0,0,0.7)',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.footer_content ENABLE ROW LEVEL SECURITY;

-- Gallery Images
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  alt_text text NOT NULL DEFAULT '',
  caption text,
  category text,
  tags text[],
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Gallery Settings
CREATE TABLE IF NOT EXISTS public.gallery_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Gallery',
  subtitle text,
  title_color text,
  subtitle_color text,
  is_enabled boolean NOT NULL DEFAULT true,
  default_view text DEFAULT 'grid',
  columns_desktop integer DEFAULT 3,
  columns_tablet integer DEFAULT 2,
  columns_mobile integer DEFAULT 1,
  image_aspect_ratio text DEFAULT '4:3',
  image_border_radius text DEFAULT '8px',
  hover_effect text DEFAULT 'zoom',
  show_captions boolean DEFAULT true,
  lightbox_enabled boolean DEFAULT true,
  overlay_color text,
  background_color text,
  autoplay_carousel boolean DEFAULT true,
  autoplay_speed integer DEFAULT 5000,
  show_thumbnails boolean DEFAULT true,
  video_url text,
  video_enabled boolean DEFAULT false,
  video_opacity numeric DEFAULT 0.3,
  video_blur numeric DEFAULT 0,
  video_speed numeric DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_settings ENABLE ROW LEVEL SECURITY;

-- Gallery Videos
CREATE TABLE IF NOT EXISTS public.gallery_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  video_url text NOT NULL,
  description text,
  thumbnail_url text,
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.gallery_videos ENABLE ROW LEVEL SECURITY;

-- Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  content text NOT NULL,
  rating integer DEFAULT 5,
  image_url text,
  video_url text,
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Team Members
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  image_url text,
  phone text,
  email text,
  bio text,
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Services
CREATE TABLE IF NOT EXISTS public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  icon_name text NOT NULL DEFAULT 'Star',
  link text,
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Why Choose Us
CREATE TABLE IF NOT EXISTS public.why_choose_us (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  icon_name text NOT NULL DEFAULT 'Star',
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.why_choose_us ENABLE ROW LEVEL SECURITY;

-- Why Choose Settings
CREATE TABLE IF NOT EXISTS public.why_choose_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_title text DEFAULT 'Why Choose Us',
  section_subtitle text,
  video_url text,
  video_enabled boolean DEFAULT false,
  video_opacity numeric DEFAULT 0.3,
  video_blur numeric DEFAULT 0,
  video_speed numeric DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.why_choose_settings ENABLE ROW LEVEL SECURITY;

-- Menu Items
CREATE TABLE IF NOT EXISTS public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  href text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- Notices
CREATE TABLE IF NOT EXISTS public.notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  notice_type text NOT NULL DEFAULT 'general',
  priority text NOT NULL DEFAULT 'normal',
  is_active boolean NOT NULL DEFAULT true,
  is_pinned boolean NOT NULL DEFAULT false,
  start_date date,
  end_date date,
  external_link text,
  external_link_text text,
  attachment_url text,
  attachment_name text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

-- Leads
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  message text,
  package_id uuid REFERENCES public.packages(id),
  lead_status text DEFAULT 'new',
  lead_score integer DEFAULT 0,
  travel_month text,
  budget_range text,
  group_size integer,
  passport_ready boolean,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  fbclid text,
  original_event_id text,
  payment_value numeric,
  device_type text,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Agents
CREATE TABLE IF NOT EXISTS public.agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  referral_link_code text NOT NULL,
  commission_rate numeric NOT NULL DEFAULT 5,
  total_leads integer NOT NULL DEFAULT 0,
  total_conversions integer NOT NULL DEFAULT 0,
  total_commission numeric NOT NULL DEFAULT 0,
  pending_commission numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

-- Agent Leads
CREATE TABLE IF NOT EXISTS public.agent_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid NOT NULL REFERENCES public.agents(id),
  lead_id uuid NOT NULL REFERENCES public.leads(id),
  converted boolean NOT NULL DEFAULT false,
  commission_amount numeric NOT NULL DEFAULT 0,
  is_paid boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.agent_leads ENABLE ROW LEVEL SECURITY;

-- Payment Methods
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  icon_name text NOT NULL DEFAULT 'CreditCard',
  is_enabled boolean NOT NULL DEFAULT false,
  is_live_mode boolean NOT NULL DEFAULT false,
  credentials jsonb NOT NULL DEFAULT '{}',
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Payment Logs
CREATE TABLE IF NOT EXISTS public.payment_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id),
  transaction_id uuid REFERENCES public.transactions(id),
  gateway text NOT NULL,
  action text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  request_data jsonb,
  response_data jsonb,
  error_message text,
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payment_logs ENABLE ROW LEVEL SECURITY;

-- Notification Settings
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_type text NOT NULL,
  is_enabled boolean NOT NULL DEFAULT false,
  config jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Notification Logs
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id),
  booking_type text,
  notification_type text NOT NULL,
  recipient text NOT NULL,
  status text NOT NULL,
  message_content text,
  error_message text,
  retry_count integer DEFAULT 0,
  last_retry_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Legal Pages
CREATE TABLE IF NOT EXISTS public.legal_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;

-- Site Settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Section Settings
CREATE TABLE IF NOT EXISTS public.section_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL UNIQUE,
  title text,
  subtitle text,
  is_visible boolean NOT NULL DEFAULT true,
  config jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.section_settings ENABLE ROW LEVEL SECURITY;

-- Social Networks
CREATE TABLE IF NOT EXISTS public.social_networks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  icon_name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.social_networks ENABLE ROW LEVEL SECURITY;

-- Translations
CREATE TABLE IF NOT EXISTS public.translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  language text NOT NULL DEFAULT 'bn',
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(key, language)
);
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

-- Quick Packages
CREATE TABLE IF NOT EXISTS public.quick_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  price_label text,
  icon_name text NOT NULL DEFAULT 'Star',
  icon_bg text NOT NULL DEFAULT 'bg-primary/10',
  gradient_from text NOT NULL DEFAULT '#d4a853',
  gradient_to text NOT NULL DEFAULT '#c4963e',
  link text NOT NULL DEFAULT '#packages',
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quick_packages ENABLE ROW LEVEL SECURITY;

-- Quick Packages Settings
CREATE TABLE IF NOT EXISTS public.quick_packages_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_title text DEFAULT 'Quick Packages',
  section_subtitle text,
  video_url text,
  video_enabled boolean DEFAULT false,
  video_opacity numeric DEFAULT 0.3,
  video_blur numeric DEFAULT 0,
  video_speed numeric DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quick_packages_settings ENABLE ROW LEVEL SECURITY;

-- Offer Popup Settings
CREATE TABLE IF NOT EXISTS public.offer_popup_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Special Offer',
  subtitle text,
  description text,
  image_url text,
  full_view_image_url text,
  image_fit text DEFAULT 'cover',
  image_position text DEFAULT 'center',
  image_scale numeric DEFAULT 1,
  image_height integer DEFAULT 300,
  button_text text,
  button_link text,
  background_color text,
  text_color text,
  is_enabled boolean DEFAULT false,
  delay_seconds integer DEFAULT 3,
  show_on_every_visit boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.offer_popup_settings ENABLE ROW LEVEL SECURITY;

-- Hotels
CREATE TABLE IF NOT EXISTS public.hotels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL,
  country text DEFAULT 'Saudi Arabia',
  description text,
  star_rating integer,
  distance_from_haram numeric,
  facilities text[],
  images text[],
  google_map_link text,
  google_map_embed_url text,
  contact_phone text,
  contact_email text,
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;

-- Hotel Destinations
CREATE TABLE IF NOT EXISTS public.hotel_destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_name text NOT NULL,
  country_code text NOT NULL,
  flag_url text,
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.hotel_destinations ENABLE ROW LEVEL SECURITY;

-- Hotel Section Settings
CREATE TABLE IF NOT EXISTS public.hotel_section_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key text NOT NULL DEFAULT 'hotel_section',
  title text,
  subtitle text,
  star_label text,
  is_enabled boolean DEFAULT true,
  booking_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.hotel_section_settings ENABLE ROW LEVEL SECURITY;

-- Hotel Booking Requests
CREATE TABLE IF NOT EXISTS public.hotel_booking_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id text NOT NULL,
  hotel_id uuid REFERENCES public.hotels(id),
  guest_name text NOT NULL,
  guest_phone text NOT NULL,
  guest_email text,
  country_code text,
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  room_count integer DEFAULT 1,
  adult_count integer DEFAULT 1,
  child_count integer DEFAULT 0,
  special_requests text,
  status text DEFAULT 'pending',
  admin_notes text,
  user_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.hotel_booking_requests ENABLE ROW LEVEL SECURITY;

-- Visa Countries
CREATE TABLE IF NOT EXISTS public.visa_countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_name text NOT NULL,
  flag_url text,
  visa_types jsonb DEFAULT '[]',
  processing_time text,
  is_active boolean DEFAULT true,
  order_index integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.visa_countries ENABLE ROW LEVEL SECURITY;

-- Visa Applications
CREATE TABLE IF NOT EXISTS public.visa_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id text NOT NULL,
  user_id uuid,
  applicant_name text NOT NULL,
  applicant_phone text NOT NULL,
  applicant_email text,
  country_id uuid REFERENCES public.visa_countries(id),
  visa_type text NOT NULL,
  travel_date date,
  status text NOT NULL DEFAULT 'submitted',
  notes text,
  admin_notes text,
  documents jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.visa_applications ENABLE ROW LEVEL SECURITY;

-- About Content
CREATE TABLE IF NOT EXISTS public.about_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'About Us',
  subtitle text,
  mission_title text DEFAULT 'Our Mission',
  mission_text text,
  history_title text DEFAULT 'Our History',
  history_text text,
  vision_title text DEFAULT 'Our Vision',
  vision_text text,
  values_title text DEFAULT 'Our Values',
  values_items jsonb DEFAULT '[]',
  image_url text,
  stats jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

-- Darul Furkan Content
CREATE TABLE IF NOT EXISTS public.darul_furkan_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_badge text,
  section_title text,
  section_title_highlight text,
  section_subtitle text,
  flight_packages jsonb,
  itikaf_badge text,
  itikaf_title text,
  itikaf_packages jsonb,
  includes_title text,
  includes_subtitle text,
  package_inclusions jsonb,
  lottery_title text,
  lottery_subtitle text,
  special_offer_label text,
  discount_text text,
  offer_dates text,
  book_now_text text,
  select_package_text text,
  contact_title text,
  contact_subtitle text,
  contact_address text,
  contact_phones jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.darul_furkan_content ENABLE ROW LEVEL SECURITY;

-- Blog Categories
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- Blog Posts
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL,
  content text NOT NULL,
  excerpt text,
  featured_image_url text,
  category_id uuid REFERENCES public.blog_categories(id),
  author_id uuid,
  seo_title text,
  meta_description text,
  is_published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Accounting Entries
CREATE TABLE IF NOT EXISTS public.accounting_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  entry_type text NOT NULL,
  description text NOT NULL,
  debit_account text NOT NULL,
  credit_account text NOT NULL,
  amount numeric NOT NULL,
  booking_id uuid REFERENCES public.bookings(id),
  reference_number text,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.accounting_entries ENABLE ROW LEVEL SECURITY;

-- Supplier Costs
CREATE TABLE IF NOT EXISTS public.supplier_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid REFERENCES public.packages(id),
  supplier_name text NOT NULL,
  cost_type text NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'BDT',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.supplier_costs ENABLE ROW LEVEL SECURITY;

-- Staff Members
CREATE TABLE IF NOT EXISTS public.staff_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  role staff_role NOT NULL DEFAULT 'support',
  department text,
  is_active boolean NOT NULL DEFAULT true,
  permissions jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

-- Staff Activity Log
CREATE TABLE IF NOT EXISTS public.staff_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid REFERENCES public.staff_members(id),
  action text NOT NULL,
  entity_type text,
  entity_id text,
  details jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.staff_activity_log ENABLE ROW LEVEL SECURITY;

-- Group Inquiries
CREATE TABLE IF NOT EXISTS public.group_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name text NOT NULL,
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  contact_email text,
  traveler_count integer NOT NULL DEFAULT 1,
  travel_date date,
  preferred_package_id uuid REFERENCES public.packages(id),
  budget text,
  special_requirements text,
  lead_status text NOT NULL DEFAULT 'new',
  assigned_to uuid,
  notes text,
  group_discount numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.group_inquiries ENABLE ROW LEVEL SECURITY;

-- Referral Codes
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  user_id uuid,
  discount_percentage numeric DEFAULT 0,
  max_uses integer,
  current_uses integer DEFAULT 0,
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Referral Conversions
CREATE TABLE IF NOT EXISTS public.referral_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code_id uuid REFERENCES public.referral_codes(id),
  booking_id uuid REFERENCES public.bookings(id),
  referrer_reward numeric DEFAULT 0,
  referee_discount numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.referral_conversions ENABLE ROW LEVEL SECURITY;

-- CRM Sequences
CREATE TABLE IF NOT EXISTS public.crm_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  channel text NOT NULL DEFAULT 'whatsapp',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_sequences ENABLE ROW LEVEL SECURITY;

-- CRM Sequence Steps
CREATE TABLE IF NOT EXISTS public.crm_sequence_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id uuid NOT NULL REFERENCES public.crm_sequences(id),
  step_number integer NOT NULL,
  day_offset integer NOT NULL DEFAULT 0,
  message_template text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_sequence_steps ENABLE ROW LEVEL SECURITY;

-- CRM Lead Sequences
CREATE TABLE IF NOT EXISTS public.crm_lead_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id),
  sequence_id uuid NOT NULL REFERENCES public.crm_sequences(id),
  current_step integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  last_triggered_at timestamptz,
  next_trigger_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_lead_sequences ENABLE ROW LEVEL SECURITY;

-- Audience Segments
CREATE TABLE IF NOT EXISTS public.audience_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_name text NOT NULL,
  segment_type text NOT NULL,
  criteria jsonb NOT NULL DEFAULT '{}',
  lead_ids text[] NOT NULL DEFAULT '{}',
  lead_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audience_segments ENABLE ROW LEVEL SECURITY;

-- Marketing Settings
CREATE TABLE IF NOT EXISTS public.marketing_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text NOT NULL,
  setting_value jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.marketing_settings ENABLE ROW LEVEL SECURITY;

-- Marketing Event Logs
CREATE TABLE IF NOT EXISTS public.marketing_event_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_id text NOT NULL,
  lead_id uuid REFERENCES public.leads(id),
  booking_id uuid REFERENCES public.bookings(id),
  status text DEFAULT 'pending',
  request_payload jsonb,
  response_payload jsonb,
  error_message text,
  retry_count integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.marketing_event_logs ENABLE ROW LEVEL SECURITY;

-- Downloadable Resources
CREATE TABLE IF NOT EXISTS public.downloadable_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  resource_type text NOT NULL,
  file_url text NOT NULL,
  download_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.downloadable_resources ENABLE ROW LEVEL SECURITY;

-- Resource Downloads
CREATE TABLE IF NOT EXISTS public.resource_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid REFERENCES public.downloadable_resources(id),
  user_name text,
  user_email text,
  user_phone text,
  downloaded_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.resource_downloads ENABLE ROW LEVEL SECURITY;

-- Webinars
CREATE TABLE IF NOT EXISTS public.webinars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer DEFAULT 60,
  meeting_link text,
  is_active boolean DEFAULT true,
  max_attendees integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.webinars ENABLE ROW LEVEL SECURITY;

-- Webinar Registrations
CREATE TABLE IF NOT EXISTS public.webinar_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id uuid REFERENCES public.webinars(id),
  name text NOT NULL,
  email text,
  phone text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.webinar_registrations ENABLE ROW LEVEL SECURITY;

-- Office Locations
CREATE TABLE IF NOT EXISTS public.office_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  phones text[] NOT NULL DEFAULT '{}',
  email text,
  map_query text,
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.office_locations ENABLE ROW LEVEL SECURITY;

-- Backup History
CREATE TABLE IF NOT EXISTS public.backup_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_name text NOT NULL,
  backup_type text NOT NULL DEFAULT 'manual',
  file_path text NOT NULL,
  file_size integer DEFAULT 0,
  tables_included text[] NOT NULL DEFAULT '{}',
  record_counts jsonb,
  status text NOT NULL DEFAULT 'completed',
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.backup_history ENABLE ROW LEVEL SECURITY;

-- Restore History
CREATE TABLE IF NOT EXISTS public.restore_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_id uuid REFERENCES public.backup_history(id),
  restored_tables text[],
  status text NOT NULL DEFAULT 'completed',
  notes text,
  restored_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.restore_history ENABLE ROW LEVEL SECURITY;

-- Theme Settings
CREATE TABLE IF NOT EXISTS public.theme_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_key text NOT NULL UNIQUE,
  theme_value jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

-- Terminal Content
CREATE TABLE IF NOT EXISTS public.terminal_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_key text NOT NULL UNIQUE,
  content_value jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.terminal_content ENABLE ROW LEVEL SECURITY;

-- ================================================
-- FUNCTIONS
-- ================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff_members
    WHERE user_id = _user_id
      AND is_active = true
  )
$$;

CREATE OR REPLACE FUNCTION public.get_staff_role(_user_id uuid)
RETURNS staff_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role
  FROM public.staff_members
  WHERE user_id = _user_id
    AND is_active = true
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.has_staff_role(_user_id uuid, _role staff_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff_members
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
  )
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    new.raw_user_meta_data ->> 'phone'
  );
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_booking_total_price()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  package_price DECIMAL(10,2);
BEGIN
  SELECT price INTO package_price FROM public.packages WHERE id = NEW.package_id;
  NEW.total_price = package_price * NEW.passenger_count;
  RETURN NEW;
END;
$$;

-- ================================================
-- TRIGGER: Auto-create profile on signup
-- ================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- RLS POLICIES
-- ================================================

-- Profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (public.is_admin());

-- Packages (public read)
CREATE POLICY "Anyone can view active packages" ON public.packages FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage packages" ON public.packages FOR ALL USING (public.is_admin());

-- Bookings
CREATE POLICY "Users can view their own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage all bookings" ON public.bookings FOR ALL USING (public.is_admin());
CREATE POLICY "Guest bookings are viewable by phone" ON public.bookings FOR SELECT USING (user_id IS NULL);

-- Booking Status History
CREATE POLICY "Users can view their own booking history" ON public.booking_status_history FOR SELECT USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = booking_status_history.booking_id AND bookings.user_id = auth.uid()));
CREATE POLICY "Admins can view all booking history" ON public.booking_status_history FOR SELECT USING (public.is_admin());
CREATE POLICY "Admins can insert status history" ON public.booking_status_history FOR INSERT WITH CHECK (public.is_admin());

-- Booking Documents
CREATE POLICY "Users can view their own documents" ON public.booking_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upload their own documents" ON public.booking_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own documents" ON public.booking_documents FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all documents" ON public.booking_documents FOR SELECT USING (public.is_admin());
CREATE POLICY "Anyone can upload documents for their booking" ON public.booking_documents FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM bookings b WHERE b.id = booking_documents.booking_id));
CREATE POLICY "Anyone can delete documents for their booking" ON public.booking_documents FOR DELETE USING (EXISTS (SELECT 1 FROM bookings b WHERE b.id = booking_documents.booking_id));

-- Hero Content (public read)
CREATE POLICY "Anyone can view active hero content" ON public.hero_content FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage hero content" ON public.hero_content FOR ALL USING (public.is_admin());

-- CTA Content (public read)
CREATE POLICY "Anyone can view CTA content" ON public.cta_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage CTA content" ON public.cta_content FOR ALL USING (public.is_admin());

-- Contact Info (public read)
CREATE POLICY "Anyone can view contact info" ON public.contact_info FOR SELECT USING (true);
CREATE POLICY "Admins can manage contact info" ON public.contact_info FOR ALL USING (public.is_admin());

-- FAQ Items (public read)
CREATE POLICY "Anyone can view active FAQs" ON public.faq_items FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage FAQs" ON public.faq_items FOR ALL USING (public.is_admin());

-- Footer Content (public read)
CREATE POLICY "Anyone can view footer" ON public.footer_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage footer" ON public.footer_content FOR ALL USING (public.is_admin());

-- Gallery (public read)
CREATE POLICY "Anyone can view gallery images" ON public.gallery_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage gallery" ON public.gallery_images FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can view gallery settings" ON public.gallery_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage gallery settings" ON public.gallery_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can view gallery videos" ON public.gallery_videos FOR SELECT USING (true);
CREATE POLICY "Admins can manage gallery videos" ON public.gallery_videos FOR ALL USING (public.is_admin());

-- Testimonials (public read)
CREATE POLICY "Anyone can view testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "Admins can manage testimonials" ON public.testimonials FOR ALL USING (public.is_admin());

-- Team Members (public read)
CREATE POLICY "Anyone can view team members" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Admins can manage team members" ON public.team_members FOR ALL USING (public.is_admin());

-- Services (public read)
CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (public.is_admin());

-- Why Choose Us (public read)
CREATE POLICY "Anyone can view why choose us" ON public.why_choose_us FOR SELECT USING (true);
CREATE POLICY "Admins can manage why choose us" ON public.why_choose_us FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can view why choose settings" ON public.why_choose_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage why choose settings" ON public.why_choose_settings FOR ALL USING (public.is_admin());

-- Menu Items (public read)
CREATE POLICY "Anyone can view menu items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Admins can manage menu items" ON public.menu_items FOR ALL USING (public.is_admin());

-- Notices (public read)
CREATE POLICY "Anyone can view active notices" ON public.notices FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage notices" ON public.notices FOR ALL USING (public.is_admin());

-- Leads
CREATE POLICY "Anyone can create leads" ON public.leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage leads" ON public.leads FOR ALL USING (public.is_admin());

-- Agents
CREATE POLICY "Admins can manage agents" ON public.agents FOR ALL USING (public.is_admin());
CREATE POLICY "Agents can view their own profile" ON public.agents FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Agents can update their own profile" ON public.agents FOR UPDATE USING (user_id = auth.uid());

-- Agent Leads
CREATE POLICY "Admins can manage agent leads" ON public.agent_leads FOR ALL USING (public.is_admin());
CREATE POLICY "Agents can view their own leads" ON public.agent_leads FOR SELECT USING (EXISTS (SELECT 1 FROM agents WHERE agents.id = agent_leads.agent_id AND agents.user_id = auth.uid()));

-- Payment Methods
CREATE POLICY "Anyone can view enabled payment methods" ON public.payment_methods FOR SELECT USING (is_enabled = true);
CREATE POLICY "Admins can manage payment methods" ON public.payment_methods FOR ALL USING (public.is_admin());

-- Transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = transactions.booking_id AND bookings.user_id = auth.uid()));
CREATE POLICY "Admins can manage transactions" ON public.transactions FOR ALL USING (public.is_admin());

-- EMI
CREATE POLICY "Users can view their own EMI" ON public.emi_payments FOR SELECT USING (EXISTS (SELECT 1 FROM bookings WHERE bookings.id = emi_payments.booking_id AND bookings.user_id = auth.uid()));
CREATE POLICY "Admins can manage EMI" ON public.emi_payments FOR ALL USING (public.is_admin());
CREATE POLICY "Users can view their own installments" ON public.emi_installments FOR SELECT USING (EXISTS (SELECT 1 FROM emi_payments ep JOIN bookings b ON b.id = ep.booking_id WHERE ep.id = emi_installments.emi_payment_id AND b.user_id = auth.uid()));
CREATE POLICY "Admins can manage installments" ON public.emi_installments FOR ALL USING (public.is_admin());

-- Notification Settings/Logs (admin only)
CREATE POLICY "Admins can manage notification settings" ON public.notification_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage notification logs" ON public.notification_logs FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can insert notification logs" ON public.notification_logs FOR INSERT WITH CHECK (true);

-- Payment Logs (admin only)
CREATE POLICY "Admins can manage payment logs" ON public.payment_logs FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can insert payment logs" ON public.payment_logs FOR INSERT WITH CHECK (true);

-- Legal Pages (public read)
CREATE POLICY "Anyone can view legal pages" ON public.legal_pages FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage legal pages" ON public.legal_pages FOR ALL USING (public.is_admin());

-- Site/Section Settings (public read)
CREATE POLICY "Anyone can view site settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can view section settings" ON public.section_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage section settings" ON public.section_settings FOR ALL USING (public.is_admin());

-- Social Networks (public read)
CREATE POLICY "Anyone can view social networks" ON public.social_networks FOR SELECT USING (true);
CREATE POLICY "Admins can manage social networks" ON public.social_networks FOR ALL USING (public.is_admin());

-- Translations (public read)
CREATE POLICY "Anyone can view translations" ON public.translations FOR SELECT USING (true);
CREATE POLICY "Admins can manage translations" ON public.translations FOR ALL USING (public.is_admin());

-- Quick Packages (public read)
CREATE POLICY "Anyone can view quick packages" ON public.quick_packages FOR SELECT USING (true);
CREATE POLICY "Admins can manage quick packages" ON public.quick_packages FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can view quick packages settings" ON public.quick_packages_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage quick packages settings" ON public.quick_packages_settings FOR ALL USING (public.is_admin());

-- Offer Popup (public read)
CREATE POLICY "Anyone can view offer popup" ON public.offer_popup_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage offer popup" ON public.offer_popup_settings FOR ALL USING (public.is_admin());

-- Hotels (public read)
CREATE POLICY "Anyone can view hotels" ON public.hotels FOR SELECT USING (true);
CREATE POLICY "Admins can manage hotels" ON public.hotels FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can view hotel destinations" ON public.hotel_destinations FOR SELECT USING (true);
CREATE POLICY "Admins can manage hotel destinations" ON public.hotel_destinations FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can view hotel settings" ON public.hotel_section_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage hotel settings" ON public.hotel_section_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can create hotel bookings" ON public.hotel_booking_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage hotel bookings" ON public.hotel_booking_requests FOR ALL USING (public.is_admin());

-- Visa
CREATE POLICY "Anyone can view visa countries" ON public.visa_countries FOR SELECT USING (true);
CREATE POLICY "Admins can manage visa countries" ON public.visa_countries FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can create visa applications" ON public.visa_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view their own visa apps" ON public.visa_applications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage visa applications" ON public.visa_applications FOR ALL USING (public.is_admin());

-- About Content (public read)
CREATE POLICY "Anyone can view about content" ON public.about_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage about content" ON public.about_content FOR ALL USING (public.is_admin());

-- Darul Furkan Content (public read)
CREATE POLICY "Anyone can view darul furkan content" ON public.darul_furkan_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage darul furkan content" ON public.darul_furkan_content FOR ALL USING (public.is_admin());

-- Blog (public read for published)
CREATE POLICY "Anyone can view active categories" ON public.blog_categories FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage blog categories" ON public.blog_categories FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can view published posts" ON public.blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can manage blog posts" ON public.blog_posts FOR ALL USING (public.is_admin());

-- Accounting (admin + staff)
CREATE POLICY "Admins can manage accounting entries" ON public.accounting_entries FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Staff can view accounting entries" ON public.accounting_entries FOR SELECT USING (public.is_staff(auth.uid()));

-- Supplier Costs (admin only)
CREATE POLICY "Admins can manage supplier costs" ON public.supplier_costs FOR ALL USING (public.is_admin());

-- Staff
CREATE POLICY "Admins can manage staff" ON public.staff_members FOR ALL USING (public.is_admin());
CREATE POLICY "Staff can view own profile" ON public.staff_members FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage staff activity" ON public.staff_activity_log FOR ALL USING (public.is_admin());

-- Group Inquiries
CREATE POLICY "Anyone can create group inquiries" ON public.group_inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage group inquiries" ON public.group_inquiries FOR ALL USING (public.is_admin());

-- Referrals
CREATE POLICY "Anyone can view active referral codes" ON public.referral_codes FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage referral codes" ON public.referral_codes FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage referral conversions" ON public.referral_conversions FOR ALL USING (public.is_admin());

-- CRM
CREATE POLICY "Admins can manage CRM sequences" ON public.crm_sequences FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage CRM steps" ON public.crm_sequence_steps FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage CRM lead sequences" ON public.crm_lead_sequences FOR ALL USING (public.is_admin());

-- Audience Segments
CREATE POLICY "Admins can manage audience segments" ON public.audience_segments FOR ALL USING (public.is_admin());
CREATE POLICY "Staff can view audience segments" ON public.audience_segments FOR SELECT USING (public.is_staff(auth.uid()));

-- Marketing
CREATE POLICY "Admins can manage marketing settings" ON public.marketing_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage marketing events" ON public.marketing_event_logs FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can insert marketing events" ON public.marketing_event_logs FOR INSERT WITH CHECK (true);

-- Downloads
CREATE POLICY "Anyone can view resources" ON public.downloadable_resources FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage resources" ON public.downloadable_resources FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can log downloads" ON public.resource_downloads FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view downloads" ON public.resource_downloads FOR SELECT USING (public.is_admin());

-- Webinars
CREATE POLICY "Anyone can view webinars" ON public.webinars FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage webinars" ON public.webinars FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can register for webinars" ON public.webinar_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage registrations" ON public.webinar_registrations FOR ALL USING (public.is_admin());

-- Office Locations (public read)
CREATE POLICY "Anyone can view office locations" ON public.office_locations FOR SELECT USING (true);
CREATE POLICY "Admins can manage office locations" ON public.office_locations FOR ALL USING (public.is_admin());

-- Backup/Restore (admin only)
CREATE POLICY "Admins can manage backups" ON public.backup_history FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage restores" ON public.restore_history FOR ALL USING (public.is_admin());

-- Theme/Terminal (public read)
CREATE POLICY "Anyone can view theme settings" ON public.theme_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage theme settings" ON public.theme_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Anyone can view terminal content" ON public.terminal_content FOR SELECT USING (true);
CREATE POLICY "Admins can manage terminal content" ON public.terminal_content FOR ALL USING (public.is_admin());

-- ================================================
-- DONE! Your database is fully set up.
-- ================================================
