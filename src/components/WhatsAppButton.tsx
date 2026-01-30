import { MessageCircle, ArrowUp } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useFacebookPixel } from "@/hooks/useFacebookPixel";

const WHATSAPP_NUMBER = "8801339080532";

const WhatsAppButton = () => {
  const { trackEvent } = useFacebookPixel();
  const { t, language } = useTranslation();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Localized default message
  const getDefaultMessage = () => {
    if (language === "bn") {
      return "আসসালামু আলাইকুম! আমি আপনাদের হজ্জ/উমরাহ প্যাকেজ সম্পর্কে জানতে আগ্রহী। অনুগ্রহ করে আরও তথ্য দিন।";
    }
    if (language === "ar") {
      return "السلام عليكم! أنا مهتم بباقات الحج والعمرة. يرجى تزويدي بمزيد من المعلومات.";
    }
    return "Assalamu Alaikum! I'm interested in your Hajj/Umrah packages. Please provide more information.";
  };

  const openWhatsApp = () => {
    // Track Contact event via Facebook Pixel
    trackEvent({
      eventName: 'Contact',
      contentName: 'WhatsApp Button Click',
      customData: {
        contact_method: 'whatsapp',
        whatsapp_number: WHATSAPP_NUMBER,
      },
    });

    const encodedMessage = encodeURIComponent(getDefaultMessage());
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      {/* WhatsApp Button - Left Side (hidden on mobile since it's in the CTA bar) */}
      <button
        onClick={openWhatsApp}
        className="hidden lg:flex fixed bottom-6 left-6 z-50 bg-[#25D366] hover:bg-[#20BA5C] text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
        aria-label={t("common", "whatsapp", "Chat on WhatsApp")}
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-card text-foreground px-4 py-2 rounded-lg shadow-elegant text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {language === "bn" ? "হোয়াটসঅ্যাপে চ্যাট করুন!" : language === "ar" ? "تحدث معنا على واتساب!" : "Chat with us on WhatsApp!"}
        </span>
      </button>

      {/* Back to Top Button - Right Side (hidden on mobile) */}
      <button
        onClick={scrollToTop}
        className={`hidden lg:flex fixed bottom-6 right-6 z-50 bg-primary hover:bg-primary/90 text-primary-foreground p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 ${
          showBackToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
        aria-label="Back to top"
      >
        <ArrowUp className="w-6 h-6" />
      </button>
    </>
  );
};

export default WhatsAppButton;
