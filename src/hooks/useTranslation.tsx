import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type LanguageCode = "bn" | "en" | "ar";

interface TranslationContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (section: string, key: string, fallback?: string) => string;
  isLoading: boolean;
  isRTL: boolean;
  languageName: string;
  availableLanguages: { code: LanguageCode; name: string; nativeName: string }[];
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface Translation {
  section: string;
  key: string;
  value: string;
}

const AVAILABLE_LANGUAGES: { code: LanguageCode; name: string; nativeName: string }[] = [
  { code: "bn", name: "Bangla", nativeName: "বাংলা" },
  { code: "en", name: "English", nativeName: "English" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
];

// Default translations for core UI elements
const DEFAULT_TRANSLATIONS: Record<LanguageCode, Record<string, Record<string, string>>> = {
  bn: {
    nav: {
      home: "হোম",
      hajj: "হজ্জ প্যাকেজ",
      umrah: "উমরাহ প্যাকেজ",
      visa: "ভিসা সেবা",
      about: "আমাদের সম্পর্কে",
      contact: "যোগাযোগ",
      gallery: "গ্যালারি",
      team: "আমাদের টিম",
      faq: "প্রশ্নোত্তর",
      track_order: "অর্ডার ট্র্যাক",
      my_bookings: "আমার বুকিং",
      profile: "প্রোফাইল সেটিংস",
      admin_dashboard: "অ্যাডমিন ড্যাশবোর্ড",
      account: "অ্যাকাউন্ট",
    },
    common: {
      book_now: "এখনই বুক করুন",
      view_details: "বিস্তারিত দেখুন",
      call: "কল করুন",
      chat: "চ্যাট",
      whatsapp: "হোয়াটসঅ্যাপ",
      loading: "লোড হচ্ছে...",
      contact_us: "যোগাযোগ করুন",
      send_message: "মেসেজ পাঠান",
      read_more: "আরও পড়ুন",
      price: "মূল্য",
      duration: "সময়কাল",
      days: "দিন",
      per_person: "প্রতি জন",
      sign_in: "সাইন ইন",
      sign_out: "সাইন আউট",
      submit: "জমা দিন",
      cancel: "বাতিল",
      save: "সেভ করুন",
      search: "খুঁজুন",
      filter: "ফিল্টার",
      clear_all: "সব মুছুন",
      show_filters: "ফিল্টার দেখান",
      hide_filters: "ফিল্টার লুকান",
      active: "সক্রিয়",
      popular: "জনপ্রিয়",
      from: "শুরু",
      apply: "আবেদন",
      details: "বিস্তারিত",
      experience: "বছরের অভিজ্ঞতা",
      pilgrims: "সন্তুষ্ট হাজী",
      satisfaction: "সন্তুষ্টি হার",
      support: "সাপোর্ট",
      success_rate: "সফলতার হার",
      only_left: "মাত্র বাকি",
      view_all: "সব দেখুন",
      sending: "পাঠানো হচ্ছে...",
      no_match: "কোনো মিল পাওয়া যায়নি",
      showing: "দেখাচ্ছে",
      of: "এর মধ্যে",
      countries: "দেশ",
    },
    hero: {
      title: "দারুল ফুরকান ট্যুরস এবং ট্রাভেলস",
      subtitle: "আপনার পবিত্র যাত্রার সঙ্গী",
      description: "হজ্জ ও উমরাহ প্যাকেজের জন্য বাংলাদেশের বিশ্বস্ত প্রতিষ্ঠান।",
      badge: "সরকার অনুমোদিত হজ্জ ও উমরাহ এজেন্সি",
    },
    packages: {
      umrah_title: "উমরাহ প্যাকেজ ২০২৬",
      hajj_title: "হজ্জ প্যাকেজ ২০২৬",
      special_offer: "বিশেষ অফার",
      booking_offer: "বুকিং অফার",
      lottery_text: "প্রতি ৫০ জনে ১ জন বিনামূল্যে উমরাহ সুযোগ",
      transit_flight: "ট্রানজিট ফ্লাইট",
      direct_flight: "ডাইরেক্ট ফ্লাইট",
      itikaf: "ইতিকাফ",
      flight_date: "ফ্লাইটের তারিখ",
      includes: "অন্তর্ভুক্ত",
      visa: "ভিসা",
      air_ticket: "এয়ার টিকেট",
      hotel: "হোটেল",
      transport: "পরিবহন",
      meals: "৩ বেলা খাবার",
      riyazul_jannah: "রিয়াজুল জান্নাহ",
      package_price: "প্যাকেজ মূল্য",
      sort_by: "সাজান",
      price_low_high: "মূল্য: কম থেকে বেশি",
      price_high_low: "মূল্য: বেশি থেকে কম",
      duration_short: "সময়: কম থেকে বেশি",
      duration_long: "সময়: বেশি থেকে কম",
      compare: "তুলনা করুন",
    },
    services: {
      title: "আমাদের সেবাসমূহ",
      subtitle: "আমরা যে সেবা প্রদান করি",
      flight_booking: "ফ্লাইট বুকিং",
      flight_booking_desc: "সাশ্রয়ী মূল্যে দেশে এবং আন্তর্জাতিক ফ্লাইট বুকিং সেবা",
      visa_processing: "ভিসা প্রসেসিং",
      visa_processing_desc: "বিভিন্ন দেশের জন্য দ্রুত ও নির্ভরযোগ্য ভিসা প্রসেসিং",
      hotel_booking: "হোটেল বুকিং",
      hotel_booking_desc: "হারাম শরীফের কাছে সেরা হোটেল বুকিং সেবা",
      transport: "পরিবহন সেবা",
      transport_desc: "এয়ারপোর্ট থেকে হোটেল এবং জিয়ারত পরিবহন",
      guidance: "ট্রেনিং ও গাইডেন্স",
      guidance_desc: "হজ্জ ও উমরাহ পালনের জন্য প্রশিক্ষণ ও গাইডেন্স",
      support: "২৪/৭ সাপোর্ট",
      support_desc: "যাত্রার সময় সম্পূর্ণ সহায়তা ও সাপোর্ট",
    },
    visa: {
      title: "ভিসা প্রসেসিং সেবা",
      subtitle: "বিশ্বব্যাপী সেবা",
      description: "আমরা বিভিন্ন দেশের জন্য ঝামেলামুক্ত ভিসা প্রসেসিং সেবা প্রদান করি।",
      track_application: "আপনার ভিসা আবেদন ট্র্যাক করুন",
      search_countries: "দেশ খুঁজুন...",
      processing_time: "প্রসেসিং সময়",
      price_range: "মূল্য সীমা",
      all_times: "সব প্রসেসিং সময়",
      fast: "দ্রুত (≤ ৭ দিন)",
      medium: "মাঝারি (৮-১৫ দিন)",
      slow: "সাধারণ (১৫+ দিন)",
      all_countries: "সকল ভিসা প্রসেসিং দেশসমূহ",
      inquiry: "ভিসা জিজ্ঞাসা",
      inquiry_desc: "প্রশ্ন আছে? আমরা শীঘ্রই যোগাযোগ করব।",
      inquiry_submitted: "জিজ্ঞাসা জমা হয়েছে!",
      inquiry_success: "আপনার ভিসা জিজ্ঞাসার বিষয়ে আমরা শীঘ্রই যোগাযোগ করব।",
      full_name: "পূর্ণ নাম",
      email: "ইমেইল",
      phone: "ফোন নম্বর",
      country_interest: "আগ্রহের দেশ",
      your_message: "আপনার বার্তা",
      select_country: "একটি দেশ নির্বাচন করুন",
      tell_requirements: "আপনার ভিসা প্রয়োজনীয়তা সম্পর্কে বলুন...",
      have_questions: "প্রশ্ন আছে? আমাদের সাথে যোগাযোগ করুন",
    },
    contact: {
      title: "যোগাযোগ করুন",
      subtitle: "আমাদের সাথে কথা বলুন",
      name: "নাম",
      email: "ইমেইল",
      phone: "ফোন",
      message: "বার্তা",
      send: "পাঠান",
      address: "ঠিকানা",
      office_hours: "অফিসের সময়",
    },
    footer: {
      quick_links: "দ্রুত লিংক",
      services: "আমাদের সেবা",
      contact_info: "যোগাযোগের তথ্য",
      phone_numbers: "ফোন নম্বর",
      copyright: "সর্বস্বত্ব সংরক্ষিত",
      privacy_policy: "গোপনীয়তা নীতি",
      terms: "শর্তাবলী",
      refund: "রিফান্ড নীতি",
    },
    testimonials: {
      title: "গ্রাহকদের মতামত",
      subtitle: "আমাদের সন্তুষ্ট গ্রাহকরা যা বলেন",
    },
    faq: {
      title: "সচরাচর জিজ্ঞাসা",
      subtitle: "আপনার প্রশ্নের উত্তর",
    },
    team: {
      title: "আমাদের টিম",
      subtitle: "অভিজ্ঞ পেশাদারদের সাথে পরিচিত হন",
    },
    forms: {
      your_name: "আপনার নাম",
      your_email: "আপনার ইমেইল",
      your_phone: "আপনার ফোন নম্বর",
      your_message: "আপনার বার্তা",
      required: "আবশ্যক",
      optional: "ঐচ্ছিক",
    },
    errors: {
      something_wrong: "কিছু ভুল হয়েছে",
      try_again: "আবার চেষ্টা করুন",
      not_found: "পাওয়া যায়নি",
    },
    success: {
      message_sent: "বার্তা পাঠানো হয়েছে!",
      booking_confirmed: "বুকিং নিশ্চিত হয়েছে!",
    },
  },
  en: {
    nav: {
      home: "Home",
      hajj: "Hajj Packages",
      umrah: "Umrah Packages",
      visa: "Visa Services",
      about: "About Us",
      contact: "Contact",
      gallery: "Gallery",
      team: "Our Team",
      faq: "FAQ",
      track_order: "Track Order",
      my_bookings: "My Bookings",
      profile: "Profile Settings",
      admin_dashboard: "Admin Dashboard",
      account: "Account",
    },
    common: {
      book_now: "Book Now",
      view_details: "View Details",
      call: "Call",
      chat: "Chat",
      whatsapp: "WhatsApp",
      loading: "Loading...",
      contact_us: "Contact Us",
      send_message: "Send Message",
      read_more: "Read More",
      price: "Price",
      duration: "Duration",
      days: "Days",
      per_person: "Per Person",
      sign_in: "Sign In",
      sign_out: "Sign Out",
      submit: "Submit",
      cancel: "Cancel",
      save: "Save",
      search: "Search",
      filter: "Filter",
      clear_all: "Clear All",
      show_filters: "Show Filters",
      hide_filters: "Hide Filters",
      active: "Active",
      popular: "Popular",
      from: "From",
      apply: "Apply",
      details: "Details",
      experience: "Years Experience",
      pilgrims: "Happy Pilgrims",
      satisfaction: "Satisfaction Rate",
      support: "Support",
      success_rate: "Success Rate",
      only_left: "Only Left",
      view_all: "View All",
      sending: "Sending...",
      no_match: "No match found",
      showing: "Showing",
      of: "of",
      countries: "countries",
    },
    hero: {
      title: "Darul Furkan Tours & Travels",
      subtitle: "Your Sacred Journey Partner",
      description: "Trusted agency for Hajj & Umrah packages in Bangladesh.",
      badge: "Government Approved Hajj & Umrah Agency",
    },
    packages: {
      umrah_title: "Umrah Packages 2026",
      hajj_title: "Hajj Packages 2026",
      special_offer: "Special Offer",
      booking_offer: "Booking Offer",
      lottery_text: "1 in 50 gets free Umrah opportunity",
      transit_flight: "Transit Flight",
      direct_flight: "Direct Flight",
      itikaf: "Itikaf",
      flight_date: "Flight Date",
      includes: "Includes",
      visa: "Visa",
      air_ticket: "Air Ticket",
      hotel: "Hotel",
      transport: "Transport",
      meals: "3 Meals/Day",
      riyazul_jannah: "Riyazul Jannah",
      package_price: "Package Price",
      sort_by: "Sort By",
      price_low_high: "Price: Low to High",
      price_high_low: "Price: High to Low",
      duration_short: "Duration: Short to Long",
      duration_long: "Duration: Long to Short",
      compare: "Compare",
    },
    services: {
      title: "Our Services",
      subtitle: "Services We Provide",
      flight_booking: "Flight Booking",
      flight_booking_desc: "Domestic and international flight booking at affordable prices",
      visa_processing: "Visa Processing",
      visa_processing_desc: "Fast and reliable visa processing for various countries",
      hotel_booking: "Hotel Booking",
      hotel_booking_desc: "Best hotel booking near Haram Sharif",
      transport: "Transport Service",
      transport_desc: "Airport to hotel and Ziyarat transportation",
      guidance: "Training & Guidance",
      guidance_desc: "Training and guidance for Hajj & Umrah rituals",
      support: "24/7 Support",
      support_desc: "Complete assistance and support during journey",
    },
    visa: {
      title: "Visa Processing Services",
      subtitle: "Global Services",
      description: "We provide hassle-free visa processing services for various countries.",
      track_application: "Track Your Visa Application",
      search_countries: "Search countries...",
      processing_time: "Processing Time",
      price_range: "Price Range",
      all_times: "All Processing Times",
      fast: "Fast (≤ 7 days)",
      medium: "Medium (8-15 days)",
      slow: "Standard (15+ days)",
      all_countries: "All Visa Processing Countries",
      inquiry: "Visa Inquiry",
      inquiry_desc: "Have questions? We'll get back to you soon.",
      inquiry_submitted: "Inquiry Submitted!",
      inquiry_success: "We'll contact you shortly regarding your visa inquiry.",
      full_name: "Full Name",
      email: "Email",
      phone: "Phone Number",
      country_interest: "Country of Interest",
      your_message: "Your Message",
      select_country: "Select a country",
      tell_requirements: "Tell us about your visa requirements...",
      have_questions: "Have Questions? Contact Us",
    },
    contact: {
      title: "Contact Us",
      subtitle: "Get in Touch",
      name: "Name",
      email: "Email",
      phone: "Phone",
      message: "Message",
      send: "Send",
      address: "Address",
      office_hours: "Office Hours",
    },
    footer: {
      quick_links: "Quick Links",
      services: "Our Services",
      contact_info: "Contact Info",
      phone_numbers: "Phone Numbers",
      copyright: "All Rights Reserved",
      privacy_policy: "Privacy Policy",
      terms: "Terms of Service",
      refund: "Refund Policy",
    },
    testimonials: {
      title: "Testimonials",
      subtitle: "What Our Satisfied Customers Say",
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Answers to Your Questions",
    },
    team: {
      title: "Our Team",
      subtitle: "Meet Our Experienced Professionals",
    },
    forms: {
      your_name: "Your Name",
      your_email: "Your Email",
      your_phone: "Your Phone Number",
      your_message: "Your Message",
      required: "Required",
      optional: "Optional",
    },
    errors: {
      something_wrong: "Something went wrong",
      try_again: "Try again",
      not_found: "Not found",
    },
    success: {
      message_sent: "Message sent!",
      booking_confirmed: "Booking confirmed!",
    },
  },
  ar: {
    nav: {
      home: "الرئيسية",
      hajj: "باقات الحج",
      umrah: "باقات العمرة",
      visa: "خدمات التأشيرة",
      about: "من نحن",
      contact: "اتصل بنا",
      gallery: "معرض الصور",
      team: "فريقنا",
      faq: "الأسئلة الشائعة",
      track_order: "تتبع الطلب",
      my_bookings: "حجوزاتي",
      profile: "إعدادات الملف",
      admin_dashboard: "لوحة الإدارة",
      account: "الحساب",
    },
    common: {
      book_now: "احجز الآن",
      view_details: "عرض التفاصيل",
      call: "اتصل",
      chat: "دردشة",
      whatsapp: "واتساب",
      loading: "جارٍ التحميل...",
      contact_us: "تواصل معنا",
      send_message: "إرسال رسالة",
      read_more: "اقرأ المزيد",
      price: "السعر",
      duration: "المدة",
      days: "أيام",
      per_person: "للشخص",
      sign_in: "تسجيل الدخول",
      sign_out: "تسجيل الخروج",
      submit: "إرسال",
      cancel: "إلغاء",
      save: "حفظ",
      search: "بحث",
      filter: "تصفية",
      clear_all: "مسح الكل",
      show_filters: "إظهار الفلاتر",
      hide_filters: "إخفاء الفلاتر",
      active: "نشط",
      popular: "شائع",
      from: "من",
      apply: "تقديم",
      details: "تفاصيل",
      experience: "سنوات الخبرة",
      pilgrims: "حجاج سعداء",
      satisfaction: "نسبة الرضا",
      support: "الدعم",
      success_rate: "نسبة النجاح",
      only_left: "متبقي فقط",
      view_all: "عرض الكل",
      sending: "جارٍ الإرسال...",
      no_match: "لا توجد نتائج",
      showing: "عرض",
      of: "من",
      countries: "دولة",
    },
    hero: {
      title: "دار الفرقان للسفر والسياحة",
      subtitle: "شريكك في الرحلة المقدسة",
      description: "وكالة موثوقة لباقات الحج والعمرة في بنغلاديش.",
      badge: "وكالة حج وعمرة معتمدة من الحكومة",
    },
    packages: {
      umrah_title: "باقات العمرة ٢٠٢٦",
      hajj_title: "باقات الحج ٢٠٢٦",
      special_offer: "عرض خاص",
      booking_offer: "عرض الحجز",
      lottery_text: "فرصة عمرة مجانية لـ ١ من كل ٥٠",
      transit_flight: "رحلة ترانزيت",
      direct_flight: "رحلة مباشرة",
      itikaf: "اعتكاف",
      flight_date: "تاريخ الرحلة",
      includes: "يشمل",
      visa: "تأشيرة",
      air_ticket: "تذكرة طيران",
      hotel: "فندق",
      transport: "مواصلات",
      meals: "٣ وجبات يومياً",
      riyazul_jannah: "رياض الجنة",
      package_price: "سعر الباقة",
      sort_by: "ترتيب حسب",
      price_low_high: "السعر: من الأقل للأعلى",
      price_high_low: "السعر: من الأعلى للأقل",
      duration_short: "المدة: من الأقصر للأطول",
      duration_long: "المدة: من الأطول للأقصر",
      compare: "مقارنة",
    },
    services: {
      title: "خدماتنا",
      subtitle: "الخدمات التي نقدمها",
      flight_booking: "حجز الطيران",
      flight_booking_desc: "حجز رحلات داخلية ودولية بأسعار معقولة",
      visa_processing: "معالجة التأشيرات",
      visa_processing_desc: "معالجة تأشيرات سريعة وموثوقة لمختلف البلدان",
      hotel_booking: "حجز الفنادق",
      hotel_booking_desc: "أفضل حجز فنادق بالقرب من الحرم الشريف",
      transport: "خدمة النقل",
      transport_desc: "النقل من المطار إلى الفندق والزيارات",
      guidance: "التدريب والإرشاد",
      guidance_desc: "تدريب وإرشاد لمناسك الحج والعمرة",
      support: "دعم على مدار الساعة",
      support_desc: "مساعدة ودعم كامل أثناء الرحلة",
    },
    visa: {
      title: "خدمات معالجة التأشيرات",
      subtitle: "خدمات عالمية",
      description: "نقدم خدمات معالجة تأشيرات خالية من المتاعب لمختلف البلدان.",
      track_application: "تتبع طلب التأشيرة",
      search_countries: "ابحث عن الدول...",
      processing_time: "وقت المعالجة",
      price_range: "نطاق السعر",
      all_times: "جميع أوقات المعالجة",
      fast: "سريع (≤ ٧ أيام)",
      medium: "متوسط (٨-١٥ يوم)",
      slow: "عادي (+١٥ يوم)",
      all_countries: "جميع دول معالجة التأشيرات",
      inquiry: "استفسار التأشيرة",
      inquiry_desc: "لديك أسئلة؟ سنتواصل معك قريباً.",
      inquiry_submitted: "تم إرسال الاستفسار!",
      inquiry_success: "سنتصل بك قريباً بخصوص استفسار التأشيرة.",
      full_name: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "رقم الهاتف",
      country_interest: "الدولة المطلوبة",
      your_message: "رسالتك",
      select_country: "اختر دولة",
      tell_requirements: "أخبرنا عن متطلبات التأشيرة...",
      have_questions: "لديك أسئلة؟ تواصل معنا",
    },
    contact: {
      title: "اتصل بنا",
      subtitle: "تواصل معنا",
      name: "الاسم",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      message: "الرسالة",
      send: "إرسال",
      address: "العنوان",
      office_hours: "ساعات العمل",
    },
    footer: {
      quick_links: "روابط سريعة",
      services: "خدماتنا",
      contact_info: "معلومات الاتصال",
      phone_numbers: "أرقام الهاتف",
      copyright: "جميع الحقوق محفوظة",
      privacy_policy: "سياسة الخصوصية",
      terms: "شروط الخدمة",
      refund: "سياسة الاسترداد",
    },
    testimonials: {
      title: "شهادات العملاء",
      subtitle: "ماذا يقول عملاؤنا الراضون",
    },
    faq: {
      title: "الأسئلة الشائعة",
      subtitle: "إجابات لأسئلتك",
    },
    team: {
      title: "فريقنا",
      subtitle: "تعرف على محترفينا ذوي الخبرة",
    },
    forms: {
      your_name: "اسمك",
      your_email: "بريدك الإلكتروني",
      your_phone: "رقم هاتفك",
      your_message: "رسالتك",
      required: "مطلوب",
      optional: "اختياري",
    },
    errors: {
      something_wrong: "حدث خطأ ما",
      try_again: "حاول مرة أخرى",
      not_found: "غير موجود",
    },
    success: {
      message_sent: "تم إرسال الرسالة!",
      booking_confirmed: "تم تأكيد الحجز!",
    },
  },
};

// Geo-detection to suggest language
const detectLanguageFromLocation = async (): Promise<LanguageCode | null> => {
  try {
    const response = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
    const data = await response.json();
    const country = data.country_code?.toUpperCase();
    
    // Arabic speaking countries
    const arabicCountries = ["SA", "AE", "QA", "KW", "BH", "OM", "EG", "JO", "IQ", "SY", "LB", "YE", "LY", "SD", "TN", "DZ", "MA"];
    if (arabicCountries.includes(country)) {
      return "ar";
    }
    
    // Bangladesh
    if (country === "BD") {
      return "bn";
    }
    
    // Default to Bangla for other countries (since this is a Bangladesh-based travel agency)
    return "bn";
  } catch {
    return null;
  }
};

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageCode>("bn");
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasDetectedLocation, setHasDetectedLocation] = useState(false);

  // Load saved language or detect from location
  useEffect(() => {
    const initLanguage = async () => {
      const savedLang = localStorage.getItem("language") as LanguageCode | null;
      
      if (savedLang && AVAILABLE_LANGUAGES.some(l => l.code === savedLang)) {
        setLanguageState(savedLang);
      } else if (!hasDetectedLocation) {
        setHasDetectedLocation(true);
        const detectedLang = await detectLanguageFromLocation();
        if (detectedLang) {
          setLanguageState(detectedLang);
          localStorage.setItem("language", detectedLang);
        }
      }
    };
    
    initLanguage();
  }, [hasDetectedLocation]);

  // Fetch translations from database
  useEffect(() => {
    fetchTranslations();
  }, [language]);

  // Update document direction for RTL languages
  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const fetchTranslations = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("translations")
      .select("section, key, value")
      .eq("language_code", language);

    if (!error && data) {
      const translationMap: Record<string, string> = {};
      data.forEach((t: Translation) => {
        translationMap[`${t.section}.${t.key}`] = t.value;
      });
      setTranslations(translationMap);
    }
    setIsLoading(false);
  };

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  }, []);

  const t = useCallback((section: string, key: string, fallback?: string): string => {
    const fullKey = `${section}.${key}`;
    
    // First try database translations
    if (translations[fullKey]) {
      return translations[fullKey];
    }
    
    // Then try default translations
    const defaultLangTranslations = DEFAULT_TRANSLATIONS[language];
    if (defaultLangTranslations?.[section]?.[key]) {
      return defaultLangTranslations[section][key];
    }
    
    // Finally use fallback or key
    return fallback || key;
  }, [translations, language]);

  const isRTL = language === "ar";
  const languageName = AVAILABLE_LANGUAGES.find(l => l.code === language)?.nativeName || "বাংলা";

  return (
    <TranslationContext.Provider 
      value={{ 
        language, 
        setLanguage, 
        t, 
        isLoading, 
        isRTL, 
        languageName,
        availableLanguages: AVAILABLE_LANGUAGES 
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
};

export default useTranslation;
