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
            className="fixed inset-0 bg-black/70 z-[100]"
          />

          {/* Popup - Centered */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90%] max-w-lg"
          >
            <div className="relative rounded-2xl shadow-2xl overflow-hidden border-4 border-white bg-white">
              {/* Header - Dark Green */}
              <div className="bg-primary px-5 py-3 flex items-center justify-between">
                <h2 className="font-semibold text-primary-foreground flex items-center gap-2 text-base">
                  🔥 Special Offer
                </h2>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full border-2 border-primary-foreground/70 hover:border-primary-foreground hover:bg-primary-foreground/10 transition-all flex items-center justify-center"
                  aria-label="Close popup"
                >
                  <X className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>

              {/* Image Banner */}
              {settings.image_url && (
                <div className="w-full">
                  <img
                    src={settings.image_url}
                    alt="Offer Banner"
                    className="w-full h-56 sm:h-64 object-cover"
                  />
                </div>
              )}

              {/* Content Section - Green */}
              <div
                className="px-6 py-8 text-center"
                style={{
                  backgroundColor: settings.background_color || "#166534",
                  color: settings.text_color || "#ffffff",
                }}
              >
                {/* Title with Sparkles */}
                <h3 className="text-2xl sm:text-3xl font-bold mb-2 text-amber-400">
                  ✨ {settings.title} ✨
                </h3>

                {/* Subtitle */}
                {settings.subtitle && (
                  <p className="text-sm mb-4 opacity-90">
                    {settings.subtitle}
                  </p>
                )}

                {/* Description */}
                {settings.description && (
                  <p className="text-sm mb-6 opacity-90 leading-relaxed">
                    {settings.description}
                  </p>
                )}

                {/* Discount Badge */}
                <div className="mb-6">
                  <span className="inline-block bg-white text-primary font-semibold px-6 py-2 rounded-full text-sm shadow-md">
                    Save up to 20%
                  </span>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Button
                    onClick={() => handleButtonClick("#hajj-packages")}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-6 py-3 text-sm rounded-lg transition-colors"
                  >
                    Explore Packages →
                  </Button>
                  <Button
                    onClick={() => handleButtonClick(settings.button_link)}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-semibold px-6 py-3 text-sm rounded-lg transition-colors"
                  >
                    {settings.button_text || "Book Now"} →
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
