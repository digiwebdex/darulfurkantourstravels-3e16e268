import { useState, useEffect } from "react";
import { Plane, Moon, Building2, Gift, ArrowRight, Star, Award, Crown, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { formatCurrency } from "@/lib/currency";
import { supabase } from "@/integrations/supabase/client";

interface QuickPackage {
  id: string;
  icon_name: string;
  title: string;
  description: string;
  price: number;
  price_label: string | null;
  link: string;
  gradient_from: string;
  gradient_to: string;
  icon_bg: string;
  is_featured: boolean;
  order_index: number;
  is_active: boolean;
}

interface QuickPackagesSettings {
  id: string;
  title: string;
  subtitle: string;
  is_active: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  Moon,
  Gift,
  Plane,
  Star,
  Award,
  Crown,
  Heart,
};

const QuickPackageHighlight = () => {
  const { t, isRTL } = useTranslation();
  const [packages, setPackages] = useState<QuickPackage[]>([]);
  const [settings, setSettings] = useState<QuickPackagesSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [packagesRes, settingsRes] = await Promise.all([
        supabase.from("quick_packages").select("*").eq("is_active", true).order("order_index"),
        supabase.from("quick_packages_settings").select("*").single(),
      ]);

      if (packagesRes.data) setPackages(packagesRes.data);
      if (settingsRes.data) setSettings(settingsRes.data);
    } catch (error) {
      console.error("Error fetching quick packages:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !settings?.is_active || packages.length === 0) return null;

  return (
    <section className="py-16 bg-muted/30" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
            {settings.title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {settings.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => {
            const IconComponent = iconMap[pkg.icon_name] || Building2;
            return (
              <div
                key={pkg.id}
                className={`group relative bg-card rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border ${
                  pkg.is_featured ? 'border-accent ring-2 ring-accent/20' : 'border-border hover:border-primary/30'
                }`}
              >
                {pkg.is_featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                    {t("packages", "hot", "🔥 Hot")}
                  </div>
                )}
                
                <div className={`w-14 h-14 rounded-xl ${pkg.icon_bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <IconComponent className={`w-7 h-7 ${pkg.is_featured ? 'text-accent' : 'text-primary'}`} />
                </div>
                
                <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                  {pkg.title}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {pkg.description}
                </p>
                
                <div className="mb-4">
                  {pkg.price_label ? (
                    <span className="text-accent font-bold text-lg">{pkg.price_label}</span>
                  ) : (
                    <>
                      <span className="text-muted-foreground text-sm">{t("common", "from", "শুরু")}</span>
                      <span className="text-primary font-bold text-xl ml-1">{formatCurrency(pkg.price)}</span>
                    </>
                  )}
                </div>
                
                <a href={pkg.link}>
                  <Button 
                    variant={pkg.is_featured ? "default" : "outline"} 
                    className={`w-full gap-2 group-hover:gap-3 transition-all ${
                      pkg.is_featured ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : ''
                    }`}
                  >
                    {t("common", "view_details", "বিস্তারিত দেখুন")}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickPackageHighlight;
