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
    },
    hero: {
      title: "আপনার পবিত্র যাত্রা",
      subtitle: "এখান থেকে শুরু",
      description: "দারুল ফুরকান ট্যুরস এন্ড ট্রাভেলসের সাথে আপনার জীবনের সবচেয়ে পবিত্র যাত্রা অভিজ্ঞতা নিন।",
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
      copyright: "সর্বস্বত্ব সংরক্ষিত",
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
    },
    hero: {
      title: "Your Sacred Journey",
      subtitle: "Begins Here",
      description: "Experience the most sacred journey of your lifetime with Darul Furkan Tours & Travels.",
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
      copyright: "All Rights Reserved",
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
    },
    hero: {
      title: "رحلتك المقدسة",
      subtitle: "تبدأ من هنا",
      description: "استمتع بأقدس رحلة في حياتك مع دار الفرقان للسفر والسياحة.",
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
      copyright: "جميع الحقوق محفوظة",
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
    
    // Default to English for other countries
    return "en";
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
