import { useState, useEffect } from "react";
import { X, Flame, Sparkles, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import makkahImage from "@/assets/makkah-haram-new.jpg";

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
  image_position: string | null;
  image_fit: string | null;
  image_height: number | null;
  image_scale: number | null;
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90%] max-w-lg"
          >
            <div className="relative rounded-2xl shadow-2xl overflow-hidden border-0 bg-primary">
              {/* Header - Dark Green */}
              <div className="bg-primary px-5 py-3 flex items-center justify-between">
                <h2 className="font-semibold text-primary-foreground flex items-center gap-2 text-base">
                  🔥 Special Offer
                </h2>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-all flex items-center justify-center"
                  aria-label="Close popup"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Image Banner */}
              <div className="w-full overflow-hidden">
                <img
                  src={settings.image_url || makkahImage}
                  alt="Offer Banner"
                  className="w-full transition-transform"
                  style={{
                    height: `${settings.image_height || 200}px`,
                    objectFit: (settings.image_fit as React.CSSProperties['objectFit']) || 'cover',
                    objectPosition: settings.image_position || 'center',
                    transform: `scale(${(settings.image_scale || 100) / 100})`,
                    transformOrigin: settings.image_position || 'center',
                  }}
                />
              </div>

              {/* Content Section - Dark Teal Background */}
              <div className="px-6 py-6 text-center bg-[#0d5a4c]">
                {/* Title with Sparkles */}
                <h3 className="text-xl sm:text-2xl font-bold mb-2 text-amber-500 flex items-center justify-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>{settings.title}</span>
                  <Sparkles className="w-5 h-5" />
                </h3>

                {/* Subtitle */}
                {settings.subtitle && (
                  <p className="text-sm font-semibold text-white mb-3">
                    {settings.subtitle}
                  </p>
                )}

                {/* Description */}
                {settings.description && (
                  <p className="text-sm text-gray-300 mb-5 leading-relaxed max-w-sm mx-auto">
                    {settings.description}
                  </p>
                )}

                {/* Discount Badge */}
                <div className="mb-5">
                  <span className="inline-block bg-[#d4a84b] text-gray-900 font-semibold px-6 py-2.5 rounded-full text-sm shadow-md">
                    Save up to 20%
                  </span>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-row justify-center gap-3">
                  <Button
                    onClick={() => handleButtonClick("#hajj-packages")}
                    className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold px-6 py-2.5 text-sm rounded-full transition-colors border-0 shadow-sm"
                  >
                    Explore Packages →
                  </Button>
                  <Button
                    onClick={() => handleButtonClick(settings.button_link)}
                    className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold px-6 py-2.5 text-sm rounded-full transition-colors border-0 shadow-sm"
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
