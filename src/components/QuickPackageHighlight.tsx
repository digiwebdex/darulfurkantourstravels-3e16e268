import { Plane, Moon, Building2, Gift, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/currency";

const QuickPackageHighlight = () => {
  const { t, isRTL } = useTranslation();

  const packages = [
    {
      icon: Building2,
      title: t("packages", "hajj_title", "হজ্জ প্যাকেজ"),
      description: t("packages", "hajj_desc", "পবিত্র হজ্জ ২০২৬ - প্রিমিয়াম সার্ভিস"),
      price: 850000,
      link: "#hajj",
      gradient: "from-primary to-emerald-dark",
      iconBg: "bg-primary/10",
    },
    {
      icon: Moon,
      title: t("packages", "umrah_title", "উমরাহ প্যাকেজ"),
      description: t("packages", "umrah_desc", "সারা বছর উমরাহ - বিশেষ অফার"),
      price: 135000,
      link: "#umrah",
      gradient: "from-accent to-gold",
      iconBg: "bg-accent/10",
    },
    {
      icon: Moon,
      title: t("packages", "ramadan_itikaf", "রমজান ইতিকাফ"),
      description: t("packages", "itikaf_desc", "রমজানের শেষ ১০ দিন মক্কায় ইতিকাফ"),
      price: 250000,
      link: "#umrah",
      gradient: "from-purple-600 to-purple-800",
      iconBg: "bg-purple-100",
    },
    {
      icon: Gift,
      title: t("packages", "special_offer", "বিশেষ অফার"),
      description: t("packages", "lottery_text", "প্রতি ৫০ জনে ১ জন ফ্রি উমরাহ!"),
      price: 0,
      priceLabel: t("packages", "free_lottery", "লটারি ফ্রি"),
      link: "#packages",
      gradient: "from-rose-500 to-red-600",
      iconBg: "bg-rose-100",
      featured: true,
    },
  ];

  return (
    <section className="py-16 bg-muted/30" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t("packages", "our_packages", "আমাদের প্যাকেজসমূহ")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("packages", "package_subtitle", "আপনার পবিত্র যাত্রার জন্য সেরা প্যাকেজ নির্বাচন করুন")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative bg-card rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border ${
                pkg.featured ? 'border-accent ring-2 ring-accent/20' : 'border-border hover:border-primary/30'
              }`}
            >
              {pkg.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                  {t("packages", "hot", "🔥 Hot")}
                </div>
              )}
              
              <div className={`w-14 h-14 rounded-xl ${pkg.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <pkg.icon className={`w-7 h-7 ${pkg.featured ? 'text-accent' : 'text-primary'}`} />
              </div>
              
              <h3 className="font-heading text-xl font-bold text-foreground mb-2">
                {pkg.title}
              </h3>
              
              <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                {pkg.description}
              </p>
              
              <div className="mb-4">
                {pkg.priceLabel ? (
                  <span className="text-accent font-bold text-lg">{pkg.priceLabel}</span>
                ) : (
                  <>
                    <span className="text-muted-foreground text-sm">{t("common", "from", "শুরু")}</span>
                    <span className="text-primary font-bold text-xl ml-1">{formatCurrency(pkg.price)}</span>
                  </>
                )}
              </div>
              
              <a href={pkg.link}>
                <Button 
                  variant={pkg.featured ? "default" : "outline"} 
                  className={`w-full gap-2 group-hover:gap-3 transition-all ${
                    pkg.featured ? 'bg-accent hover:bg-accent/90 text-accent-foreground' : ''
                  }`}
                >
                  {t("common", "view_details", "বিস্তারিত দেখুন")}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickPackageHighlight;
