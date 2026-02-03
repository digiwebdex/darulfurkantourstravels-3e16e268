import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface OfferPopupSettings {
  is_enabled: boolean;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  button_text: string;
  button_link: string;
  badge_text: string;
  discount_text: string;
  display_delay_seconds: number;
  show_once_per_session: boolean;
  background_color: string;
  text_color: string;
  overlay_opacity: number;
  full_view_image_url?: string;
}

const STORAGE_KEY = "offer_popup_shown";

const OfferPopup = () => {
  const [settings, setSettings] = useState<OfferPopupSettings | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!settings || !settings.is_enabled || loading) return;

    if (settings.show_once_per_session) {
      const alreadyShown = sessionStorage.getItem(STORAGE_KEY);
      if (alreadyShown) return;
    }

    const timer = setTimeout(() => {
      setIsOpen(true);
      if (settings.show_once_per_session) {
        sessionStorage.setItem(STORAGE_KEY, "true");
      }
    }, settings.display_delay_seconds * 1000);

    return () => clearTimeout(timer);
  }, [settings, loading]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("setting_value")
        .eq("setting_key", "offer_popup")
        .maybeSingle();

      if (error) {
        console.error("Error fetching popup settings:", error);
        return;
      }

      if (data?.setting_value) {
        setSettings(data.setting_value as unknown as OfferPopupSettings);
      }
    } catch (error) {
      console.error("Error fetching popup settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => setIsOpen(false);

  const handleButtonClick = () => {
    setIsOpen(false);
    if (settings?.button_link) {
      if (settings.button_link.startsWith("#")) {
        const element = document.querySelector(settings.button_link);
        if (element) element.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = settings.button_link;
      }
    }
  };

  if (!settings || !settings.is_enabled) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black cursor-pointer"
            style={{ opacity: settings.overlay_opacity || 0.7 }}
            onClick={handleClose}
          />

          {/* Popup Content */}
          {settings.full_view_image_url ? (
            /* Full-View Image Mode - Only show the promotional flyer */
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-lg rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/30 hover:bg-black/50 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <img
                src={settings.full_view_image_url}
                alt="Promotional Offer"
                className="w-full h-auto max-h-[90vh] object-contain"
              />
            </motion.div>
          ) : (
            /* Standard Mode - Show full popup with text and buttons */
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
              style={{ backgroundColor: settings.background_color || "#0d4a3e" }}
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>

              {/* Badge */}
              {settings.badge_text && (
                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-secondary text-secondary-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    {settings.badge_text}
                  </span>
                </div>
              )}

              {/* Image Banner */}
              {settings.image_url && (
                <div className="w-full h-48 overflow-hidden">
                  <img
                    src={settings.image_url}
                    alt="Offer Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content Section */}
              <div
                className="p-6 text-center"
                style={{ backgroundColor: settings.background_color || "#0d4a3e" }}
              >
                {/* Title */}
                <h3
                  className="text-2xl font-bold mb-2"
                  style={{ color: settings.text_color || "#d4a84b" }}
                >
                  ✨ {settings.title} ✨
                </h3>

                {/* Subtitle */}
                {settings.subtitle && (
                  <p className="text-white font-semibold text-sm mb-3">
                    {settings.subtitle}
                  </p>
                )}

                {/* Description */}
                {settings.description && (
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed max-w-sm mx-auto">
                    {settings.description}
                  </p>
                )}

                {/* Discount Badge */}
                {settings.discount_text && (
                  <div className="mb-5">
                    <span className="inline-block bg-secondary text-secondary-foreground font-bold px-6 py-2.5 rounded-full text-sm shadow-lg">
                      {settings.discount_text}
                    </span>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="flex flex-row justify-center gap-3">
                  <Button
                    onClick={handleButtonClick}
                    size="default"
                    className="font-semibold px-6 py-5 text-sm rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg hover:shadow-xl transition-all"
                  >
                    {settings.button_text} →
                  </Button>
                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      const element = document.querySelector("#umrah");
                      if (element) element.scrollIntoView({ behavior: "smooth" });
                    }}
                    size="default"
                    className="font-semibold px-6 py-5 text-sm rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg hover:shadow-xl transition-all"
                  >
                    Book Now →
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfferPopup;
