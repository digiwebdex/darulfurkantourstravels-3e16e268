import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Phone, Mail, User, LogOut, LayoutDashboard, MapPin, MessageCircle, Settings, LogIn, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { hasGuestBookings } from "@/utils/guestBookingStorage";
import companyLogo from "@/assets/darul-furkan-logo.jpeg";
import BookingModal from "./BookingModal";
import VisaApplicationModal from "./VisaApplicationModal";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  order_index: number;
}

interface PackageItem {
  id: string;
  title: string;
  price: number;
  type: "hajj" | "umrah";
  duration_days: number;
}

interface VisaCountry {
  id: string;
  country_name: string;
  flag_emoji: string;
  processing_time: string;
  price: number;
}

const ANNOUNCEMENT_DISMISSED_KEY = "darulFurkan_announcementDismissed";
const WHATSAPP_NUMBER = "8801339080532";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(ANNOUNCEMENT_DISMISSED_KEY) === 'true';
    }
    return false;
  });
  const { user, isAdmin, signOut } = useAuth();
  const { companyInfo, contactDetails, appearance } = useSiteSettings();
  const { t, isRTL, language } = useTranslation();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [visaCountries, setVisaCountries] = useState<VisaCountry[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<PackageItem | null>(null);
  const [selectedVisaCountry, setSelectedVisaCountry] = useState<VisaCountry | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isVisaModalOpen, setIsVisaModalOpen] = useState(false);
  const [showMyBookings, setShowMyBookings] = useState(false);

  useEffect(() => {
    setShowMyBookings(!!user || hasGuestBookings());
  }, [user]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchMenuItems();
    fetchPackages();
    fetchVisaCountries();
  }, []);

  const fetchMenuItems = async () => {
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .eq("is_active", true)
      .order("order_index");
    
    if (data && data.length > 0) {
      setMenuItems(data);
    } else {
      setMenuItems([
        { id: "1", label: t("nav", "home"), href: "#home", order_index: 0 },
        { id: "2", label: t("nav", "hajj"), href: "#hajj", order_index: 1 },
        { id: "3", label: t("nav", "umrah"), href: "#umrah", order_index: 2 },
        { id: "4", label: t("nav", "visa"), href: "#visa", order_index: 3 },
        { id: "5", label: t("nav", "team"), href: "#team", order_index: 4 },
        { id: "6", label: t("nav", "contact"), href: "#contact", order_index: 5 },
      ]);
    }
  };

  const fetchPackages = async () => {
    const { data } = await supabase
      .from("packages")
      .select("id, title, price, type, duration_days")
      .eq("is_active", true)
      .eq("show_book_now", true)
      .order("type")
      .order("price");
    
    if (data) setPackages(data);
  };

  const fetchVisaCountries = async () => {
    const { data } = await supabase
      .from("visa_countries")
      .select("id, country_name, flag_emoji, processing_time, price")
      .eq("is_active", true)
      .order("order_index");
    
    if (data) setVisaCountries(data);
  };

  const handleBookPackage = (pkg: PackageItem) => {
    setSelectedPackage(pkg);
    setIsBookingModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleBookingModalClose = () => {
    setIsBookingModalOpen(false);
    setSelectedPackage(null);
    setShowMyBookings(!!user || hasGuestBookings());
  };

  const handleApplyVisa = (country: VisaCountry) => {
    setSelectedVisaCountry(country);
    setIsVisaModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleVisaModalClose = () => {
    setIsVisaModalOpen(false);
    setSelectedVisaCountry(null);
  };

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 120;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const logoSrc = companyInfo.logo_url || companyLogo;
  const showAnnouncement = appearance.show_announcement_bar && appearance.announcement_text && !announcementDismissed;

  const dismissAnnouncement = () => {
    setAnnouncementDismissed(true);
    sessionStorage.setItem(ANNOUNCEMENT_DISMISSED_KEY, 'true');
  };

  // Company name based on language
  const getCompanyName = () => {
    if (language === "bn") return "দারুল ফুরকান ট্যুরস এন্ড ট্রাভেলস";
    if (language === "ar") return "دار الفرقان للسفر والسياحة";
    return "Darul Furkan Tours & Travels";
  };

  return (
    <>
      {/* Announcement Bar */}
      {showAnnouncement && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-secondary text-secondary-foreground py-2 text-sm font-medium animate-fade-down">
          <div className="container flex items-center justify-center gap-2 relative">
            <span>📢</span>
            <span>{appearance.announcement_text}</span>
            <button 
              onClick={dismissAnnouncement}
              className="absolute right-0 p-1 hover:bg-secondary-foreground/10 rounded transition-colors"
              aria-label="Dismiss announcement"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      <header 
        className={`fixed left-0 right-0 z-50 bg-card/95 backdrop-blur-md shadow-elegant transition-all duration-300 ${isScrolled ? 'shadow-lg' : ''} ${showAnnouncement ? 'top-[36px]' : 'top-0'}`}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Top Bar */}
        <div className={`bg-primary text-primary-foreground overflow-hidden transition-all duration-300 ${isScrolled ? 'h-0 py-0' : 'h-auto py-2'}`}>
          <div className="container flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-2 text-sm">
            <div className="flex items-center gap-4 sm:gap-6">
              <a href={`tel:+8801339080532`} className="flex items-center gap-1.5 hover:text-secondary transition-colors">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden md:inline">+880 1339-080532</span>
              </a>
              <a href={`tel:+8801741719932`} className="flex items-center gap-1.5 hover:text-secondary transition-colors">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden md:inline">+880 1741-719932</span>
              </a>
              <a 
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-[#25D366] transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden md:inline">{t("common", "whatsapp")}</span>
              </a>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher variant="default" className="text-primary-foreground hover:text-secondary" />
            </div>
          </div>
        </div>

        {/* Main Nav */}
        <nav className={`container transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
          <div className="flex items-center justify-between">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="flex items-center gap-2 sm:gap-3 group cursor-pointer"
            >
              <img 
                src={logoSrc} 
                alt={getCompanyName()} 
                className={`object-contain ring-2 ring-primary/20 rounded-lg p-1 bg-white shadow-elegant group-hover:ring-primary/40 transition-all duration-300 ${isScrolled ? 'h-10 w-auto' : 'h-12 sm:h-14 w-auto'}`}
              />
              <div className="flex flex-col">
                <span className={`font-heading font-bold text-primary group-hover:text-primary/80 transition-all duration-300 leading-tight ${isScrolled ? 'text-sm sm:text-base' : 'text-base sm:text-lg'}`}>
                  {language === "bn" ? "দারুল ফুরকান" : language === "ar" ? "دار الفرقان" : "Darul Furkan"}
                </span>
                <span className={`text-muted-foreground ${isScrolled ? 'text-[10px]' : 'text-xs'}`}>
                  {language === "bn" ? "ট্যুরস এন্ড ট্রাভেলস" : language === "ar" ? "للسفر والسياحة" : "Tours & Travels"}
                </span>
              </div>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-5 xl:gap-6">
              {menuItems.map((link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={(e) => handleSmoothScroll(e, link.href)}
                  className="text-foreground hover:text-primary text-sm xl:text-base font-medium transition-colors relative group cursor-pointer whitespace-nowrap"
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-2 xl:gap-3">
              {/* Language Switcher - Compact when scrolled */}
              <div className={isScrolled ? "" : "hidden"}>
                <LanguageSwitcher variant="compact" />
              </div>

              <Link to="/track-order">
                <Button variant="outline" size="sm" className="gap-1.5 text-sm px-3 border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors">
                  <MapPin className="w-4 h-4" />
                  <span className="hidden xl:inline">{t("nav", "track_order", "Track Order")}</span>
                </Button>
              </Link>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <User className="w-4 h-4" />
                      {t("nav", "account", "Account")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align={isRTL ? "start" : "end"} className="bg-card border border-border shadow-lg z-[100]">
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => navigate("/admin")}>
                        <LayoutDashboard className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t("nav", "admin_dashboard", "Admin Dashboard")}
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => navigate("/my-bookings")}>
                      <ClipboardList className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t("nav", "my_bookings", "My Bookings")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <Settings className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t("nav", "profile", "Profile Settings")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t("common", "sign_out", "Sign Out")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/auth">
                  <Button size="sm" className="bg-gradient-primary hover:opacity-90 shadow-gold text-sm px-4 gap-2">
                    <LogIn className="w-4 h-4" />
                    {t("common", "sign_in", "Sign In")}
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4 animate-fade-down max-h-[70vh] overflow-y-auto">
              <div className="flex flex-col gap-4">
                {/* Mobile Language Switcher */}
                <div className="pb-3 border-b border-border">
                  <LanguageSwitcher variant="full" className="w-full justify-start" />
                </div>

                {menuItems.map((link) => (
                  <a
                    key={link.id}
                    href={link.href}
                    className="text-foreground hover:text-primary font-medium py-2"
                    onClick={(e) => handleSmoothScroll(e, link.href)}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border">
                  <Link to="/track-order" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full gap-2">
                      <MapPin className="w-4 h-4" />
                      {t("nav", "track_order", "Track Order")}
                    </Button>
                  </Link>
                  {user ? (
                    <>
                      <Link to="/my-bookings" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full gap-2">
                          <ClipboardList className="w-4 h-4" />
                          {t("nav", "my_bookings", "My Bookings")}
                        </Button>
                      </Link>
                      <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full gap-2">
                          <Settings className="w-4 h-4" />
                          {t("nav", "profile", "Profile Settings")}
                        </Button>
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                          <Button variant="outline" className="w-full gap-2">
                            <LayoutDashboard className="w-4 h-4" />
                            {t("nav", "admin_dashboard", "Admin Dashboard")}
                          </Button>
                        </Link>
                      )}
                      <Button variant="outline" className="w-full gap-2" onClick={handleSignOut}>
                        <LogOut className="w-4 h-4" />
                        {t("common", "sign_out", "Sign Out")}
                      </Button>
                    </>
                  ) : (
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full gap-2 bg-gradient-primary">
                        <LogIn className="w-4 h-4" />
                        {t("common", "sign_in", "Sign In")}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Booking Modal */}
      {selectedPackage && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={handleBookingModalClose}
          package_info={{
            id: selectedPackage.id,
            title: selectedPackage.title,
            price: selectedPackage.price,
            type: selectedPackage.type,
            duration_days: selectedPackage.duration_days,
          }}
        />
      )}

      {/* Visa Application Modal */}
      <VisaApplicationModal
        isOpen={isVisaModalOpen}
        onClose={handleVisaModalClose}
        country={selectedVisaCountry}
      />
    </>
  );
};

export default Header;
