import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import DynamicPackages from "./DynamicPackages";
import IslamicBorder from "./IslamicBorder";
import { useLanguage } from "@/contexts/LanguageContext";

const HajjPackages = () => {
  const { t, isRTL } = useLanguage();

  return (
    <IslamicBorder>
      <section id="hajj" className="py-24 bg-muted geometric-pattern relative overflow-hidden">
        {/* Decorative Elements */}
        <div className={`absolute top-20 ${isRTL ? 'right-0' : 'left-0'} w-72 h-72 bg-primary/5 rounded-full blur-3xl`} />
        <div className={`absolute bottom-20 ${isRTL ? 'left-0' : 'right-0'} w-96 h-96 bg-secondary/5 rounded-full blur-3xl`} />
      
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className={`inline-flex items-center gap-2 text-secondary font-semibold uppercase tracking-wider ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Calendar className="w-4 h-4" />
            {t('packages.hajj')}
          </span>
          <h2 className="font-calligraphy text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mt-3 mb-2">
            {t('packages.hajj')} 2026
          </h2>
          <span className="font-thuluth text-secondary/60 text-2xl md:text-3xl block mb-6">{t('packages.hajjArabic')}</span>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t('packages.hajjDesc')}
          </p>
          
          {/* Quick Info */}
          <div className={`flex flex-wrap justify-center gap-6 mt-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className={`flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-elegant ${isRTL ? 'flex-row-reverse' : ''}`}>
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Makkah & Madinah</span>
            </div>
            <div className={`flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-elegant ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Dhul Hijjah 1447</span>
            </div>
          </div>
        </motion.div>

        <DynamicPackages type="hajj" />

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground text-sm mb-4">
            {t('hero.badge')}
          </p>
          <div className={`flex flex-wrap justify-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <span className={`inline-flex items-center gap-2 text-primary text-sm font-medium ${isRTL ? 'flex-row-reverse' : ''}`}>
              ✓ {t('hero.badge')}
            </span>
            <span className={`inline-flex items-center gap-2 text-primary text-sm font-medium ${isRTL ? 'flex-row-reverse' : ''}`}>
              ✓ 10+ {t('hero.yearsExperience')}
            </span>
            <span className={`inline-flex items-center gap-2 text-primary text-sm font-medium ${isRTL ? 'flex-row-reverse' : ''}`}>
              ✓ 5000+ {t('hero.happyPilgrims')}
            </span>
          </div>
        </motion.div>
      </div>
      </section>
    </IslamicBorder>
  );
};

export default HajjPackages;
