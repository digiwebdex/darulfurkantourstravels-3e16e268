import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";
import { ArrowRight, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CTAContent {
  id: string;
  title: string;
  subtitle: string;
  primary_button_text: string;
  primary_button_link: string;
  secondary_button_text: string;
  secondary_button_link: string;
  show_primary_button: boolean;
  show_secondary_button: boolean;
  is_active: boolean;
}

const CTASection = () => {
  const { isRTL } = useTranslation();
  const [content, setContent] = useState<CTAContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data } = await supabase
        .from("cta_content")
        .select("*")
        .single();

      if (data) setContent(data);
    } catch (error) {
      console.error("Error fetching CTA content:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !content?.is_active) return null;

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
            {content.title}
          </h2>
          <p className="text-primary-foreground/80 text-lg md:text-xl mb-8">
            {content.subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {content.show_primary_button && (
              <a href={content.primary_button_link}>
                <Button 
                  size="lg" 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-8 py-6 text-lg rounded-full shadow-gold gap-2 group"
                >
                  {content.primary_button_text}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
            )}
            {content.show_secondary_button && (
              <a href={content.secondary_button_link}>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-secondary bg-secondary/20 text-secondary hover:bg-secondary/30 px-8 py-6 text-lg rounded-full gap-2"
                >
                  <Phone className="w-5 h-5" />
                  {content.secondary_button_text}
                </Button>
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
