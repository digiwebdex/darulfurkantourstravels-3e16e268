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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[95%] sm:w-[90%] md:w-[80%] lg:w-[500px] max-w-lg"
          >
            <div className="relative rounded-2xl shadow-2xl overflow-hidden bg-white">
              {/* Header */}
              <div className="bg-amber-50 px-4 py-3 flex items-center justify-between border-b border-amber-100">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="font-semibold text-gray-800 text-sm sm:text-base">
                    Special Offer
                  </span>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Close popup"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Image Banner */}
              {settings.image_url && (
                <div className="w-full">
                  <img
                    src={settings.image_url}
                    alt="Offer Banner"
                    className="w-full h-32 sm:h-40 md:h-48 lg:h-52 object-cover"
                  />
                </div>
              )}

              {/* Content Section */}
              <div
                className="p-4 sm:p-6 text-center"
                style={{
                  backgroundColor: settings.background_color || "#10b981",
                  color: settings.text_color || "#ffffff",
                }}
              >
                {/* Title with Sparkles */}
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-heading flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
                  {settings.title}
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
                </h2>

                {/* Subtitle */}
                {settings.subtitle && (
                  <p className="text-xs sm:text-sm md:text-base opacity-90 mt-1 sm:mt-2">
                    {settings.subtitle}
                  </p>
                )}

                {/* Description */}
                {settings.description && (
                  <p className="text-xs sm:text-sm opacity-80 mt-2 sm:mt-3 leading-relaxed px-2 sm:px-4">
                    {settings.description}
                  </p>
                )}

                {/* Discount Badge */}
                <div className="mt-3 sm:mt-4">
                  <span className="inline-block bg-white/20 backdrop-blur-sm px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold">
                    Save up to 20%
                  </span>
                </div>

                {/* CTA Buttons */}
                <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center px-2">
                  <Button
                    onClick={() => handleButtonClick("#hajj-packages")}
                    variant="outline"
                    className="bg-white text-primary hover:bg-white/90 font-semibold px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg border-0 gap-1"
                  >
                    Explore Packages
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                  <Button
                    onClick={() => handleButtonClick(settings.button_link)}
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg gap-1"
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
