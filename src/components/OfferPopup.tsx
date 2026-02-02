import { useState, useEffect } from "react";
import { X, Gift, ArrowRight } from "lucide-react";
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
    // Check if popup should be shown
    const dismissed = sessionStorage.getItem(POPUP_DISMISSED_KEY);
    const lastShown = localStorage.getItem(POPUP_LAST_SHOWN_KEY);
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    // If show_on_every_visit is false, check if we've shown it recently
    if (!popupSettings.show_on_every_visit) {
      if (dismissed === "true") return;
      if (lastShown && parseInt(lastShown) > oneDayAgo) return;
    } else {
      // For every visit, only check session
      if (dismissed === "true") return;
    }

    // Show popup after delay
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

  const handleButtonClick = () => {
    handleClose();
    if (settings?.button_link) {
      if (settings.button_link.startsWith("#")) {
        const element = document.querySelector(settings.button_link);
        element?.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = settings.button_link;
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

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[92%] max-w-md max-h-[90vh] overflow-hidden"
          >
            <div
              className="relative rounded-2xl shadow-2xl overflow-hidden"
              style={{
                backgroundColor: settings.background_color || "#10b981",
                color: settings.text_color || "#ffffff",
              }}
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors z-10"
                aria-label="Close popup"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Decorative Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full geometric-pattern" />
              </div>

              {/* Glow Effects */}
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

              <div className="relative p-4 sm:p-6 md:p-8 max-h-[85vh] overflow-y-auto">
                {/* Icon */}
                <div className="flex justify-center mb-3 sm:mb-4">
                  <div className="p-3 sm:p-4 bg-white/20 rounded-full animate-pulse">
                    <Gift className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                </div>

                {/* Image */}
                {settings.image_url && (
                  <div className="mb-3 sm:mb-4 rounded-xl overflow-hidden">
                    <img
                      src={settings.image_url}
                      alt="Offer"
                      className="w-full h-28 sm:h-36 md:h-40 object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="text-center space-y-2 sm:space-y-3">
                  {settings.subtitle && (
                    <p className="text-xs sm:text-sm md:text-base opacity-90 font-medium">
                      {settings.subtitle}
                    </p>
                  )}
                  
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading">
                    {settings.title}
                  </h2>

                  {settings.description && (
                    <p className="text-xs sm:text-sm md:text-base opacity-90 leading-relaxed">
                      {settings.description}
                    </p>
                  )}

                  {/* CTA Button */}
                  {settings.button_text && (
                    <div className="pt-3 sm:pt-4">
                      <Button
                        onClick={handleButtonClick}
                        size="lg"
                        className="bg-white text-primary hover:bg-white/90 font-bold px-5 sm:px-8 py-4 sm:py-6 text-sm sm:text-lg rounded-full shadow-lg gap-2 group"
                      >
                        {settings.button_text}
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Bottom Decoration */}
                <div className="flex justify-center mt-4 sm:mt-6 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white/40"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
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
