
-- Create darul_furkan_content settings table (single-row)
CREATE TABLE public.darul_furkan_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_badge text DEFAULT 'হজ্জ পরবর্তী উমরাহ প্যাকেজ',
  section_title text DEFAULT 'উমরাহ প্যাকেজ',
  section_title_highlight text DEFAULT '২০২৬',
  section_subtitle text DEFAULT 'হজ্জ পরবর্তী উমরাহ প্যাকেজ - সম্পূর্ণ সেবা সহ পবিত্র ভূমিতে আপনার যাত্রা',
  lottery_title text DEFAULT 'লটারির মাধ্যমে ফ্রি উমরাহ!',
  lottery_subtitle text DEFAULT 'প্রতি ৫০ জনে একজন সুযোগ পাবেন',
  special_offer_label text DEFAULT 'বিশেষ অফারের সময়সীমা',
  offer_dates text DEFAULT '২৪ জানুয়ারি - ১০ ফেব্রুয়ারি',
  includes_title text DEFAULT 'প্যাকেজের অন্তর্ভুক্ত',
  includes_subtitle text DEFAULT 'যা যা অন্তর্ভুক্ত',
  package_inclusions jsonb DEFAULT '[
    "ভিসা (Visa)",
    "এয়ার টিকেট (Air Ticket)",
    "রিয়াজুল জান্নাহ (Riyazul Jannah)",
    "হোটেল (Hotel)",
    "ট্রান্সপোর্ট (Transport)",
    "জিয়ারাহ (Ziyarah)",
    "৩ বেলা খাবার (3 Meals/Day)"
  ]'::jsonb,
  flight_packages jsonb DEFAULT '[
    {"type":"Transit Flight","typeBn":"ট্রানজিট ফ্লাইট","typeAr":"رحلة ترانزيت","price":135000,"flightDate":"10 June 2026","flightDateBn":"১০ জুন ২০২৬","flightDateAr":"١٠ يونيو ٢٠٢٦","highlight":false},
    {"type":"Direct Flight","typeBn":"ডিরেক্ট ফ্লাইট","typeAr":"رحلة مباشرة","price":145000,"flightDate":"15 June 2026","flightDateBn":"১৫ জুন ২০২৬","flightDateAr":"١٥ يونيو ٢٠٢٦","highlight":true}
  ]'::jsonb,
  itikaf_badge text DEFAULT 'পবিত্র রমজানে ইতেকাফ',
  itikaf_title text DEFAULT 'ইতেকাফ প্যাকেজ',
  itikaf_packages jsonb DEFAULT '[
    {"days":15,"daysBn":"১৫ দিন","daysAr":"١٥ يوم","daysEn":"15 Days","price":165000,"label":"15 Days Itikaf","labelBn":"১৫ দিনের ইতেকাফ","labelAr":"اعتكاف ١٥ يوم"},
    {"days":20,"daysBn":"২০ দিন","daysAr":"٢٠ يوم","daysEn":"20 Days","price":170000,"label":"20 Days Itikaf","labelBn":"২০ দিনের ইতেকাফ","labelAr":"اعتكاف ٢٠ يوم"},
    {"days":30,"daysBn":"৩০ দিন","daysAr":"٣٠ يوم","daysEn":"30 Days","price":192000,"label":"30 Days Itikaf","labelBn":"৩০ দিনের ইতেকাফ","labelAr":"اعتكاف ٣٠ يوم"}
  ]'::jsonb,
  contact_title text DEFAULT 'দারুল ফুরকান ট্যুরস এন্ড ট্রাভেলস',
  contact_subtitle text DEFAULT 'যোগাযোগ করুন',
  contact_address text DEFAULT '৩৮২, বাগানবাড়ী, স্বাধীনতা সরণি, উত্তর বাড্ডা, ঢাকা ১২১২',
  contact_phones jsonb DEFAULT '["01741-719932","01339-080532"]'::jsonb,
  discount_text text DEFAULT 'বিশেষ ছাড় চলছে!',
  book_now_text text DEFAULT 'এখনই বুক করুন',
  select_package_text text DEFAULT 'প্যাকেজ নির্বাচন করুন',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.darul_furkan_content ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view darul furkan content"
  ON public.darul_furkan_content FOR SELECT
  USING (true);

-- Admin update (authenticated users only - admin check in app layer)
CREATE POLICY "Authenticated users can update darul furkan content"
  ON public.darul_furkan_content FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert darul furkan content"
  ON public.darul_furkan_content FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Insert default row
INSERT INTO public.darul_furkan_content (id) VALUES (gen_random_uuid());

-- Trigger for updated_at
CREATE TRIGGER update_darul_furkan_content_updated_at
  BEFORE UPDATE ON public.darul_furkan_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
