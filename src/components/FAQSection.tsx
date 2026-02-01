import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import IslamicBorder from "./IslamicBorder";
import { useTranslation } from "@/hooks/useTranslation";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order_index: number;
}

interface SectionHeader {
  badge_text: string;
  title: string;
  arabic_text: string;
  description: string;
}

const FAQSection = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sectionHeader, setSectionHeader] = useState<SectionHeader>({
    badge_text: "Have Questions?",
    title: "Frequently Asked Questions",
    arabic_text: "أسئلة شائعة",
    description: "Find answers to common questions about our Hajj and Umrah services."
  });

  const { language } = useTranslation();
  
  useEffect(() => {
    fetchFaqs();
    fetchSectionHeader();
  }, [language]);

  const fetchSectionHeader = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", "faq_section_header")
      .maybeSingle();
    
    if (data?.setting_value) {
      setSectionHeader(data.setting_value as unknown as SectionHeader);
    }
  };

  const fetchFaqs = async () => {
    const { data } = await supabase
      .from("faq_items")
      .select("*")
      .eq("is_active", true)
      .order("order_index");
    
    if (data) {
      setFaqs(data);
    }
    setLoading(false);
  };

  // Return null if loading or no FAQs (no fallback content)
  if (loading || faqs.length === 0) return null;

  return (
    <IslamicBorder>
      <section className="py-24 bg-background">
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-16"
        >
          <span className="text-secondary font-semibold uppercase tracking-wider">
            {sectionHeader.badge_text}
          </span>
          <h2 className="font-calligraphy text-4xl md:text-5xl font-bold text-foreground mt-3 mb-4">
            {sectionHeader.title}
          </h2>
          <span className="font-thuluth text-secondary/60 text-2xl md:text-3xl block mb-6">{sectionHeader.arabic_text}</span>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {sectionHeader.description}
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ 
                  duration: 0.5, 
                  delay: index * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-card rounded-xl px-6 shadow-elegant border-none data-[state=open]:shadow-lg transition-shadow hover:shadow-md"
                >
                  <AccordionTrigger className="hover:no-underline py-6 text-left">
                    <div className="flex items-start gap-4">
                      <HelpCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                      <span className="font-heading font-semibold text-foreground">
                        {faq.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 pl-9 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
      </section>
    </IslamicBorder>
  );
};

export default FAQSection;
