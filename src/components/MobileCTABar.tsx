import { Phone, MessageCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useTranslation } from "@/hooks/useTranslation";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";

const WHATSAPP_NUMBER = "8801339080532";
const PHONE_NUMBER = "+8801339080532";

const MobileCTABar = () => {
  const { appearance } = useSiteSettings();
  const { t, language } = useTranslation();
  const { trackEvent } = useFacebookPixel();

  // Don't render if disabled in settings
  if (appearance.show_mobile_cta_bar === false) {
    return null;
  }

  const handleWhatsAppClick = () => {
    // Track Contact event via Facebook Pixel
    trackEvent({
      eventName: 'Contact',
      contentName: 'Mobile CTA WhatsApp Click',
      customData: {
        contact_method: 'whatsapp',
        whatsapp_number: WHATSAPP_NUMBER,
        source: 'mobile_cta_bar',
      },
    });
  };

  // Localized labels
  const labels = {
    call: language === "bn" ? "কল" : language === "ar" ? "اتصل" : "Call",
    book: language === "bn" ? "বুক করুন" : language === "ar" ? "احجز الآن" : "Book Now",
    chat: language === "bn" ? "চ্যাট" : language === "ar" ? "دردشة" : "Chat",
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.15)]">
      <div className="flex items-center justify-around py-2 px-3 gap-2">
        {/* Call Button */}
        <a 
          href={`tel:${PHONE_NUMBER}`}
          className="flex-1"
        >
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full gap-1.5 text-xs h-10 border-primary/30 hover:bg-primary/10"
          >
            <Phone className="w-4 h-4 text-primary" />
            <span>{labels.call}</span>
          </Button>
        </a>

        {/* Book Now Button - Primary CTA */}
        <a href="#darul-furkan-packages" className="flex-[1.5]">
          <Button 
            size="sm" 
            className="w-full gap-1.5 text-xs h-10 bg-gradient-primary hover:opacity-90 shadow-gold"
          >
            <Calendar className="w-4 h-4" />
            <span>{labels.book}</span>
          </Button>
        </a>

        {/* WhatsApp Button */}
        <a 
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
          onClick={handleWhatsAppClick}
        >
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full gap-1.5 text-xs h-10 border-[#25D366]/30 hover:bg-[#25D366]/10"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>{labels.chat}</span>
          </Button>
        </a>
      </div>
      
      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </div>
  );
};

export default MobileCTABar;
