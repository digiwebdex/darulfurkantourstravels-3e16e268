import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";

const CTASection = () => {
  const { t, isRTL } = useTranslation();

  return (
    <section className="py-20 bg-gradient-primary relative overflow-hidden" dir={isRTL ? "rtl" : "ltr"}>
      {/* Decorative Pattern */}
      <div className="absolute inset-0 geometric-pattern opacity-10" />
      
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      <div className="container px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
            {t("cta", "title", "আপনার আধ্যাত্মিক যাত্রা শুরু করুন আজই")}
          </h2>
          <p className="text-primary-foreground/80 text-lg md:text-xl mb-8">
            {t("cta", "subtitle", "হজ্জ ও উমরাহর পবিত্র যাত্রায় আমরা আপনার পাশে আছি। এখনই বুকিং করুন এবং বিশেষ ছাড় পান!")}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="#packages">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-8 py-6 text-lg rounded-full shadow-gold gap-2 group"
              >
                {t("common", "book_now", "এখনই বুকিং করুন")}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <a href="tel:+8801339080532">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 px-8 py-6 text-lg rounded-full gap-2"
              >
                <Phone className="w-5 h-5" />
                {t("common", "call_now", "কল করুন")}
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
