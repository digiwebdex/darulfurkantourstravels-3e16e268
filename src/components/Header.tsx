import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useTranslation } from "@/hooks/useTranslation";
import TopBar from "./TopBar";
import MainNavbar from "./MainNavbar";

const ANNOUNCEMENT_DISMISSED_KEY = "darulFurkan_announcementDismissed";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(ANNOUNCEMENT_DISMISSED_KEY) === 'true';
    }
    return false;
  });
  const { appearance } = useSiteSettings();
  const { isRTL } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const showAnnouncement = appearance.show_announcement_bar && appearance.announcement_text && !announcementDismissed;

  const dismissAnnouncement = () => {
    setAnnouncementDismissed(true);
    sessionStorage.setItem(ANNOUNCEMENT_DISMISSED_KEY, 'true');
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Announcement Bar */}
      {showAnnouncement && (
        <div className="bg-accent text-accent-foreground py-2 text-sm font-medium animate-fade-down">
          <div className="container flex items-center justify-center gap-2 relative px-4">
            <span>📢</span>
            <span>{appearance.announcement_text}</span>
            <button 
              onClick={dismissAnnouncement}
              className="absolute right-4 p-1 hover:bg-accent-foreground/10 rounded transition-colors"
              aria-label="Dismiss announcement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {/* Top Bar - Hidden on scroll for cleaner look */}
      <div className={`transition-all duration-300 overflow-hidden ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'}`}>
        <TopBar />
      </div>
      
      {/* Main Navbar */}
      <MainNavbar />
    </header>
  );
};

export default Header;
