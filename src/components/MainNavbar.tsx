import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, LayoutDashboard, Settings, LogIn, ClipboardList, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useTranslation } from "@/hooks/useTranslation";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { hasGuestBookings } from "@/utils/guestBookingStorage";
import companyLogo from "@/assets/darul-furkan-logo.jpeg";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  order_index: number;
}

const MainNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const { companyInfo } = useSiteSettings();
  const { t, isRTL, language } = useTranslation();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
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
  }, [language]);

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

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 140;
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

  const getCompanyName = () => {
    if (language === "bn") return "দারুল ফুরকান";
    if (language === "ar") return "دار الفرقان";
    return "Darul Furkan";
  };

  const getTagline = () => {
    if (language === "bn") return "ট্যুরস এন্ড ট্রাভেলস";
    if (language === "ar") return "للسفر والسياحة";
    return "Tours & Travels";
  };

  return (
    <nav 
      className={`bg-card/98 backdrop-blur-md shadow-lg transition-all duration-300 ${isScrolled ? 'py-2' : 'py-3'}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container flex items-center justify-between px-4">
        {/* Logo */}
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          className="flex items-center gap-3 group cursor-pointer"
        >
          <img 
            src={logoSrc} 
            alt={getCompanyName()} 
            className={`object-contain rounded-xl ring-2 ring-primary/20 p-1 bg-white shadow-md group-hover:ring-primary/40 transition-all duration-300 ${isScrolled ? 'h-10' : 'h-12 md:h-14'}`}
          />
          <div className="flex flex-col">
            <span className={`font-heading font-bold text-primary group-hover:text-primary/80 transition-all duration-300 leading-tight ${isScrolled ? 'text-sm md:text-base' : 'text-base md:text-lg'}`}>
              {getCompanyName()}
            </span>
            <span className={`text-muted-foreground ${isScrolled ? 'text-[10px]' : 'text-xs'}`}>
              {getTagline()}
            </span>
          </div>
        </button>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          {menuItems.map((link) => (
            <a
              key={link.id}
              href={link.href}
              onClick={(e) => handleSmoothScroll(e, link.href)}
              className="text-foreground hover:text-primary text-sm font-medium transition-colors relative group cursor-pointer"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-3">
          <Link to="/track-order">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1.5 border-primary/30 hover:bg-primary hover:text-primary-foreground"
            >
              <MapPin className="w-4 h-4" />
              {t("nav", "track_order", "Track Order")}
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
              <Button 
                size="sm" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 rounded-full shadow-gold"
              >
                <LogIn className="w-4 h-4 mr-1.5" />
                {t("common", "sign_in", "Sign In")}
              </Button>
            </Link>
          )}

          {/* Book Now Button */}
          <a href="#packages">
            <Button 
              size="sm" 
              className="bg-gradient-gold hover:opacity-90 text-accent-foreground font-bold px-6 rounded-full shadow-gold"
            >
              {t("common", "book_now", "Book Now")}
            </Button>
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden p-2 text-foreground"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4 animate-fade-in px-4 max-h-[70vh] overflow-y-auto">
          <div className="flex flex-col gap-3">
            {menuItems.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className="text-foreground hover:text-primary font-medium py-2 px-3 rounded-lg hover:bg-muted transition-colors"
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
                  <Button className="w-full gap-2 bg-primary hover:bg-primary/90">
                    <LogIn className="w-4 h-4" />
                    {t("common", "sign_in", "Sign In")}
                  </Button>
                </Link>
              )}
              
              <a href="#packages" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-gradient-gold hover:opacity-90 font-bold">
                  {t("common", "book_now", "Book Now")}
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default MainNavbar;
