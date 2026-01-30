import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CompanyInfo {
  name: string;
  tagline: string;
  description: string;
  logo_url: string;
}

export interface ContactDetails {
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  google_map_embed_url: string;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  youtube: string;
  twitter: string;
}

export interface Appearance {
  primary_color: string;
  show_announcement_bar: boolean;
  announcement_text: string;
  show_book_now_button: boolean;
  show_mobile_cta_bar: boolean;
}

export interface SiteSettings {
  companyInfo: CompanyInfo;
  contactDetails: ContactDetails;
  socialLinks: SocialLinks;
  appearance: Appearance;
  loading: boolean;
}

const defaultSettings: SiteSettings = {
  companyInfo: {
    name: "দারুল ফুরকান ট্যুরস এন্ড ট্রাভেলস",
    tagline: "আপনার পবিত্র যাত্রার বিশ্বস্ত সঙ্গী",
    description: "সরকার অনুমোদিত হজ্জ ও উমরাহ এজেন্সি",
    logo_url: "",
  },
  contactDetails: {
    email: "digiwebdex@gmail.com",
    phone: "+880 1741-719932",
    whatsapp: "+880 1339-080532",
    address: "৩৮২, বাগানবাড়ি, স্বাধীনতা সরণি, উত্তর বাড্ডা, ঢাকা ১২১২",
    google_map_embed_url: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.5484611458387!2d90.39729221498282!3d23.79416879319868!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c709be6be7b5%3A0x7e53f4e8b8be1a24!2sUttar%20Badda%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd",
  },
  socialLinks: {
    facebook: "",
    instagram: "",
    youtube: "",
    twitter: "",
  },
  appearance: {
    primary_color: "#10b981",
    show_announcement_bar: false,
    announcement_text: "",
    show_book_now_button: true,
    show_mobile_cta_bar: true,
  },
  loading: true,
};

const SiteSettingsContext = createContext<SiteSettings>(defaultSettings);

interface SiteSettingsProviderProps {
  children: ReactNode;
}

export function SiteSettingsProvider({ children }: SiteSettingsProviderProps) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*");

      if (error) {
        console.error("Error fetching site settings:", error);
        setSettings(prev => ({ ...prev, loading: false }));
        return;
      }

      if (data && data.length > 0) {
        const newSettings = { ...defaultSettings, loading: false };
        
        data.forEach((setting) => {
          const value = setting.setting_value as Record<string, unknown>;
          switch (setting.setting_key) {
            case "company_info":
              newSettings.companyInfo = value as unknown as CompanyInfo;
              break;
            case "contact_details":
              newSettings.contactDetails = value as unknown as ContactDetails;
              break;
            case "social_links":
              newSettings.socialLinks = value as unknown as SocialLinks;
              break;
            case "appearance":
              newSettings.appearance = value as unknown as Appearance;
              break;
          }
        });
        
        setSettings(newSettings);
      } else {
        setSettings(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("Error fetching site settings:", error);
      setSettings(prev => ({ ...prev, loading: false }));
    }
  };

  return (
    <SiteSettingsContext.Provider value={settings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error("useSiteSettings must be used within a SiteSettingsProvider");
  }
  return context;
}