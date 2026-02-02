import { useState, useEffect } from "react";
import { X, Flame, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const POPUP_DISMISSED_KEY = "darulFurkan_offerPopupDismissed";
const POPUP_LAST_SHOWN_KEY = "darulFurkan_offerPopupLastShown";

interface PopupSettings {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  button_text: string | null;
  button_link: string | null;
  image_url: string | null;
  background_color: string | null;
  text_color: string | null;
  is_enabled: boolean;
  show_on_every_visit: boolean;
  delay_seconds: number | null;
}

const OfferPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<PopupSettings | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("offer_popup_settings")
        .select("*")
        .eq("is_enabled", true)
        .maybeSingle();

      if (error) {
        console.error("Error fetching popup settings:", error);
        return;
      }

      if (data) {
        setSettings(data);
        checkAndShowPopup(data);
      }
    } catch (error) {
      console.error("Error fetching popup settings:", error);
    }
  };

  const checkAndShowPopup = (popupSettings: PopupSettings) => {
    const dismissed = sessionStorage.getItem(POPUP_DISMISSED_KEY);
    const lastShown = localStorage.getItem(POPUP_LAST_SHOWN_KEY);
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    if (!popupSettings.show_on_every_visit) {
      if (dismissed === "true") return;
      if (lastShown && parseInt(lastShown) > oneDayAgo) return;
    } else {
      if (dismissed === "true") return;
    }

    const delay = (popupSettings.delay_seconds || 2) * 1000;
    setTimeout(() => {
      setIsOpen(true);
      localStorage.setItem(POPUP_LAST_SHOWN_KEY, now.toString());
    }, delay);
  };

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem(POPUP_DISMISSED_KEY, "true");
  };

  const handleButtonClick = (link?: string | null) => {
    handleClose();
    if (link) {
      if (link.startsWith("#")) {
        const element = document.querySelector(link);
        element?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = link;
      }
    }
  };

  if (!settings) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Popup - Centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[92%] sm:w-[85%] md:w-[70%] lg:w-[480px] max-w-[500px]"
          >
            <div className="relative rounded-xl shadow-2xl overflow-hidden bg-card">
              {/* Header - Cream/Beige */}
              <div className="bg-[#fef9f0] px-4 py-2.5 sm:py-3 flex items-center justify-between border-b border-[#f5e6d3]">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  <span className="font-semibold text-foreground text-sm sm:text-base">
                    Special Offer
                  </span>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 sm:p-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors border border-border"
                  aria-label="Close popup"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Image Banner */}
              {settings.image_url && (
                <div className="w-full">
                  <img
                    src={settings.image_url}
                    alt="Offer Banner"
                    className="w-full h-36 sm:h-44 md:h-52 object-cover"
                  />
                </div>
              )}

              {/* Content Section - Green */}
              <div
                className="p-4 sm:p-5 md:p-6 text-center"
                style={{
                  backgroundColor: settings.background_color || "#0d7a5f",
                  color: settings.text_color || "#ffffff",
                }}
              >
                {/* Title with Sparkles */}
                <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold font-heading flex items-center justify-center gap-1.5 sm:gap-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 flex-shrink-0" />
                  <span>{settings.title}</span>
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300 flex-shrink-0" />
                </h2>

                {/* Subtitle */}
                {settings.subtitle && (
                  <p className="text-xs sm:text-sm opacity-95 mt-1 sm:mt-1.5 font-medium">
                    {settings.subtitle}
                  </p>
                )}

                {/* Description */}
                {settings.description && (
                  <p className="text-[11px] sm:text-xs md:text-sm opacity-90 mt-2 sm:mt-3 leading-relaxed px-1 sm:px-4">
                    {settings.description}
                  </p>
                )}

                {/* Discount Badge - Darker Green */}
                <div className="mt-3 sm:mt-4">
                  <span className="inline-block bg-[#0a5c47] px-5 sm:px-6 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-semibold shadow-sm">
                    Save up to 20%
                  </span>
                </div>

                {/* CTA Buttons */}
                <div className="mt-4 sm:mt-5 flex flex-col xs:flex-row gap-2 sm:gap-3 justify-center px-1 sm:px-2">
                  <Button
                    onClick={() => handleButtonClick("#hajj-packages")}
                    className="bg-card text-primary hover:bg-card/90 font-semibold px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm rounded-md border border-transparent gap-1 shadow-sm"
                  >
                    Explore Packages
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    onClick={() => handleButtonClick(settings.button_link)}
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm rounded-md gap-1 shadow-sm"
                  >
                    {settings.button_text || "Book Now"}
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OfferPopup;
