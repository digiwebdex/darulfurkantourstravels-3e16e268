import { Phone, Mail, MessageCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import LanguageSwitcher from "./LanguageSwitcher";

const WHATSAPP_NUMBER = "8801339080532";

const TopBar = () => {
  const { t, isRTL, language } = useTranslation();

  return (
    <div 
      className="bg-emerald-dark text-primary-foreground py-2 text-sm"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container flex justify-between items-center px-4">
        {/* Left - Contact Info */}
        <div className="flex items-center gap-4 md:gap-6">
          <a 
            href="tel:+8801339080532" 
            className="flex items-center gap-1.5 hover:text-accent transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">+880 1339-080532</span>
          </a>
          <a 
            href="tel:+8801741719932" 
            className="hidden md:flex items-center gap-1.5 hover:text-accent transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>+880 1741-719932</span>
          </a>
          <a 
            href="mailto:info@darulfurkantravels.com" 
            className="hidden lg:flex items-center gap-1.5 hover:text-accent transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>info@darulfurkantravels.com</span>
          </a>
          <a 
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-accent hover:text-accent/80 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t("common", "whatsapp")}</span>
          </a>
        </div>

        {/* Right - Language Switcher */}
        <div className="flex items-center">
          <LanguageSwitcher variant="compact" className="text-primary-foreground hover:text-accent" />
        </div>
      </div>
    </div>
  );
};

export default TopBar;
