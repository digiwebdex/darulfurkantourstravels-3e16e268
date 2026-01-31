import { useState, useEffect } from "react";
import { Shield, Users, Clock, FileCheck, Building, HeartHandshake, Award, Star, CheckCircle, Zap, Globe, Phone } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface WhyChooseItem {
  id: string;
  icon_name: string;
  title: string;
  description: string;
  order_index: number;
  is_active: boolean;
}

interface WhyChooseSettings {
  id: string;
  badge_text: string;
  title: string;
  subtitle: string;
  is_active: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Users,
  Clock,
  FileCheck,
  Building,
  HeartHandshake,
  Award,
  Star,
  CheckCircle,
  Zap,
  Globe,
  Phone,
};

const WhyChooseUs = () => {
  const { isRTL } = useTranslation();
  const [items, setItems] = useState<WhyChooseItem[]>([]);
  const [settings, setSettings] = useState<WhyChooseSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, settingsRes] = await Promise.all([
        supabase.from("why_choose_us").select("*").eq("is_active", true).order("order_index"),
        supabase.from("why_choose_settings").select("*").single(),
      ]);

      if (itemsRes.data) setItems(itemsRes.data);
      if (settingsRes.data) setSettings(settingsRes.data);
    } catch (error) {
      console.error("Error fetching why choose us data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !settings?.is_active || items.length === 0) return null;

  return (
    <section className="py-20 bg-cream" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            {settings.badge_text}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
            {settings.title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {settings.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {items.map((item, index) => {
            const IconComponent = iconMap[item.icon_name] || Shield;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group text-center p-4"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                  <IconComponent className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-1 text-sm md:text-base">
                  {item.title}
                </h3>
                <p className="text-muted-foreground text-xs md:text-sm">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
