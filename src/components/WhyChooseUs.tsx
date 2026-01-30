import { Shield, Users, Clock, FileCheck, Building, HeartHandshake } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { motion } from "framer-motion";

const WhyChooseUs = () => {
  const { t, isRTL } = useTranslation();

  const features = [
    {
      icon: Users,
      title: t("why_choose", "experienced", "অভিজ্ঞ টিম"),
      description: t("why_choose", "experienced_desc", "১০+ বছরের অভিজ্ঞ দল আপনার সেবায়"),
    },
    {
      icon: FileCheck,
      title: t("why_choose", "visa", "ভিসা প্রসেসিং"),
      description: t("why_choose", "visa_desc", "দ্রুত ও নির্ভরযোগ্য ভিসা প্রসেসিং"),
    },
    {
      icon: Building,
      title: t("why_choose", "riyazul", "রিয়াদুল জান্নাহ সাপোর্ট"),
      description: t("why_choose", "riyazul_desc", "মসজিদে নববীতে বিশেষ সহায়তা"),
    },
    {
      icon: Clock,
      title: t("why_choose", "support", "২৪/৭ সাপোর্ট"),
      description: t("why_choose", "support_desc", "সার্বক্ষণিক কাস্টমার সাপোর্ট"),
    },
    {
      icon: Shield,
      title: t("why_choose", "secure", "নিরাপদ পেমেন্ট"),
      description: t("why_choose", "secure_desc", "SSL সিকিউর পেমেন্ট গেটওয়ে"),
    },
    {
      icon: HeartHandshake,
      title: t("why_choose", "agreement", "লিখিত চুক্তি"),
      description: t("why_choose", "agreement_desc", "সম্পূর্ণ স্বচ্ছ চুক্তিপত্র"),
    },
  ];

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
            {t("why_choose", "badge", "আমাদের বিশেষত্ব")}
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t("why_choose", "title", "কেন আমাদের বেছে নেবেন?")}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t("why_choose", "subtitle", "আমরা আপনার পবিত্র যাত্রাকে স্মরণীয় করতে প্রতিশ্রুতিবদ্ধ")}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="group text-center p-4"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-110 transition-all duration-300">
                <feature.icon className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-1 text-sm md:text-base">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
