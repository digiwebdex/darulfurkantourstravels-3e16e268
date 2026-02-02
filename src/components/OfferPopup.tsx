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
            <div className="relative rounded-xl shadow-2xl overflow-hidden">
              {/* Header - Dark Green matching the reference */}
              <div className="bg-primary px-4 py-3 sm:py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                  <span className="font-semibold text-primary-foreground text-sm sm:text-base">
                    Special Offer
                  </span>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-transparent border-2 border-primary-foreground/60 hover:border-primary-foreground hover:bg-primary-foreground/10 transition-all flex items-center justify-center"
                  aria-label="Close popup"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                </button>
              </div>

              {/* Image Banner */}
              {settings.image_url && (
                <div className="w-full">
                  <img
                    src={settings.image_url}
                    alt="Offer Banner"
                    className="w-full h-40 sm:h-48 md:h-56 object-cover"
                  />
                </div>
              )}

              {/* Content Section - Green */}
              <div
                className="p-5 sm:p-6 md:p-7 text-center"
                style={{
                  backgroundColor: settings.background_color || "#0d7a5f",
                  color: settings.text_color || "#ffffff",
                }}
              >
                {/* Title with Sparkles - Gold/Yellow */}
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-heading flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-secondary flex-shrink-0 animate-pulse" />
                  <span className="text-secondary">{settings.title}</span>
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-secondary flex-shrink-0 animate-pulse" />
                </h2>

                {/* Subtitle */}
                {settings.subtitle && (
                  <p className="text-sm sm:text-base font-semibold mt-2 text-primary-foreground">
                    {settings.subtitle}
                  </p>
                )}

                {/* Description */}
                {settings.description && (
                  <p className="text-xs sm:text-sm opacity-90 mt-3 leading-relaxed px-2 sm:px-6">
                    {settings.description}
                  </p>
                )}

                {/* Discount Badge - Darker/muted green background */}
                <div className="mt-4 sm:mt-5">
                  <span className="inline-block bg-primary/40 px-6 sm:px-8 py-2 sm:py-2.5 rounded-full text-sm sm:text-base font-semibold text-primary-foreground shadow-inner">
                    Save up to 20%
                  </span>
                </div>

                {/* CTA Buttons - Gold/Secondary */}
                <div className="mt-5 sm:mt-6 flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-4">
                  <Button
                    onClick={() => handleButtonClick("#hajj-packages")}
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-5 sm:px-6 py-2.5 sm:py-3 text-sm rounded-md gap-1.5 shadow-md border-2 border-secondary"
                  >
                    Explore Packages
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleButtonClick(settings.button_link)}
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-5 sm:px-6 py-2.5 sm:py-3 text-sm rounded-md gap-1.5 shadow-md border-2 border-secondary"
                  >
                    {settings.button_text || "Book Now"}
                    <ArrowRight className="w-4 h-4" />
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
