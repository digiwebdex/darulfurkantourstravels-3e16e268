import { useState, useEffect, useCallback, useRef } from "react";
import { Star, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence, Easing } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";

// Import hero images
import heroKaaba from "@/assets/hero-kaaba-new.jpg";
import heroMedina from "@/assets/hero-medina-new.jpg";
import heroHajj from "@/assets/hero-hajj-new.jpg";

const defaultHeroImages = [heroKaaba, heroMedina, heroHajj];
const WHATSAPP_NUMBER = "8801339080532";

interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  badge_text?: string;
  primary_button_text?: string;
  primary_button_link?: string;
  secondary_button_text?: string;
  secondary_button_link?: string;
  background_image_url?: string;
  video_url?: string;
  stats?: { number: string; label: string }[];
}

const HeroSection = () => {
  const { t, language } = useTranslation();
  
  const getDefaultSlides = useCallback((): HeroSlide[] => [
    {
      id: "default-1",
      title: t("hero", "title", "দারুল ফুরকান ট্যুরস এবং ট্রাভেলস"),
      subtitle: t("hero", "subtitle", "আপনার পবিত্র যাত্রার সঙ্গী"),
      description: t("hero", "description", "হজ্জ ও উমরাহ প্যাকেজের জন্য বাংলাদেশের বিশ্বস্ত প্রতিষ্ঠান। আমরা প্রিমিয়াম সার্ভিস ও সম্পূর্ণ গাইডেন্স প্রদান করি।"),
      badge_text: t("hero", "badge", "সরকার অনুমোদিত হজ্জ ও উমরাহ এজেন্সি"),
      primary_button_text: t("packages", "hajj_title", "হজ্জ প্যাকেজ দেখুন"),
      primary_button_link: "#hajj",
      secondary_button_text: t("packages", "umrah_title", "উমরাহ প্যাকেজ দেখুন"),
      secondary_button_link: "#umrah",
      background_image_url: heroKaaba,
      stats: [
        { number: "১০+", label: t("common", "experience", "বছরের অভিজ্ঞতা") },
        { number: "৫০০০+", label: t("common", "pilgrims", "সন্তুষ্ট হাজী") },
        { number: "১০০%", label: t("common", "satisfaction", "সন্তুষ্টি হার") },
        { number: "২৪/৭", label: t("common", "support", "সাপোর্ট") },
      ],
    },
    {
      id: "default-2",
      title: t("packages", "umrah_title", "উমরাহ ২০২৬"),
      subtitle: t("packages", "special_offer", "বিশেষ অফার"),
      description: t("packages", "lottery_text", "হজ্জের পর উমরাহ প্যাকেজ - লটারি ভিত্তিক ফ্রি উমরাহের সুযোগ। প্রতি ৫০ জনে ১ জন বিজয়ী!"),
      badge_text: t("packages", "booking_offer", "বিশেষ ছাড়"),
      primary_button_text: t("common", "view_details", "প্যাকেজ দেখুন"),
      primary_button_link: "#packages",
      background_image_url: heroMedina,
      stats: [
        { number: "৳১,৩৫,০০০", label: t("packages", "transit_flight", "ট্রানজিট ফ্লাইট থেকে") },
        { number: "৳১,৪৫,০০০", label: t("packages", "direct_flight", "ডাইরেক্ট ফ্লাইট থেকে") },
      ],
    },
    {
      id: "default-3",
      title: t("packages", "hajj_title", "হজ্জ ২০২৬"),
      subtitle: t("common", "book_now", "এখনই বুকিং করুন"),
      description: "পবিত্র হজ্জ ২০২৬ এর জন্য আজই আপনার আসন নিশ্চিত করুন। সীমিত আসন।",
      badge_text: "সীমিত আসন",
      primary_button_text: t("common", "book_now", "বুকিং করুন"),
      primary_button_link: "#hajj",
      background_image_url: heroHajj,
      stats: [
        { number: "৫ স্টার", label: t("packages", "hotel", "হোটেল") },
        { number: "VIP", label: "সার্ভিস" },
        { number: "৩ বেলা", label: t("packages", "meals", "খাবার") },
      ],
    },
  ], [t]);

  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setSlides(getDefaultSlides());
  }, [language, getDefaultSlides]);

  useEffect(() => {
    fetchHeroContent();
  }, [language]);

  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1 || isHovered) {
      if (autoplayRef.current) clearTimeout(autoplayRef.current);
      return;
    }
    
    autoplayRef.current = setTimeout(() => {
      setCurrentSlide(curr => (curr + 1) % slides.length);
    }, 5000);

    return () => {
      if (autoplayRef.current) clearTimeout(autoplayRef.current);
    };
  }, [isAutoPlaying, slides.length, currentSlide, isHovered]);

  const fetchHeroContent = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("hero_content")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true });
    
    if (data && data.length > 0) {
      const formattedSlides = data.map((item, index) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle || undefined,
        description: item.description || undefined,
        badge_text: item.badge_text || undefined,
        primary_button_text: item.primary_button_text || undefined,
        primary_button_link: item.primary_button_link || undefined,
        secondary_button_text: item.secondary_button_text || undefined,
        secondary_button_link: item.secondary_button_link || undefined,
        background_image_url: item.background_image_url || defaultHeroImages[index % 3],
        video_url: item.video_url || undefined,
        stats: Array.isArray(item.stats) ? item.stats as { number: string; label: string }[] : undefined,
      }));
      setSlides(formattedSlides);
    }
    setIsLoading(false);
  };

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  }, [slides.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) goToNext();
    else if (distance < -50) goToPrevious();
  };

  const defaultContent = getDefaultSlides()[0];
  const content = slides[currentSlide] || defaultContent;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
    exit: { opacity: 0 },
  };

  const easeValue: Easing = [0.25, 0.1, 0.25, 1];
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: easeValue },
    },
  };

  if (isLoading && slides.length === 0) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-primary">
        <div className="container text-center">
          <Skeleton className="h-12 w-64 mx-auto mb-4 bg-primary-foreground/10" />
          <Skeleton className="h-8 w-48 mx-auto mb-8 bg-primary-foreground/10" />
          <Skeleton className="h-6 w-96 mx-auto bg-primary-foreground/10" />
        </div>
      </section>
    );
  }

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Images */}
      <div className="absolute inset-0 overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="absolute inset-0"
            style={{
              opacity: index === currentSlide ? 1 : 0,
              zIndex: index === currentSlide ? 10 : 0,
              transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'opacity',
            }}
          >
            <img
              src={slide.background_image_url || defaultHeroImages[index % 3]}
              alt=""
              className="w-full h-full object-cover transform-gpu scale-105"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
        
        {/* Premium Overlays - Green + Gold */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent z-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-transparent to-primary/50 z-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-transparent to-primary z-20" />
        
        {/* Gold Accent Glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-1/3 bg-accent/10 blur-3xl z-15" />
      </div>

      {/* Content */}
      <div className="relative z-30 container px-4 pt-32 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            {content.badge_text && (
              <motion.div variants={itemVariants} className="mb-6">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-accent/20 text-accent border border-accent/40 backdrop-blur-sm shadow-gold">
                  <Star className="w-4 h-4 fill-current" />
                  {content.badge_text}
                </span>
              </motion.div>
            )}

            {/* Title */}
            <motion.h1
              variants={itemVariants}
              className="font-heading text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary-foreground mb-4 leading-tight"
            >
              {content.title}
              {content.subtitle && (
                <span className="block mt-2 text-xl sm:text-2xl md:text-3xl lg:text-4xl text-accent font-semibold">
                  {content.subtitle}
                </span>
              )}
            </motion.h1>

            {/* Description */}
            {content.description && (
              <motion.p
                variants={itemVariants}
                className="text-base sm:text-lg md:text-xl text-primary-foreground/85 max-w-2xl mx-auto mb-8 leading-relaxed"
              >
                {content.description}
              </motion.p>
            )}

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 mb-10">
              {content.primary_button_text && (
                <Button
                  asChild
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 py-6 text-lg rounded-full shadow-lg"
                >
                  <a href={content.primary_button_link || "#"}>
                    {content.primary_button_text}
                  </a>
                </Button>
              )}
              <a 
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold px-8 py-6 text-lg rounded-full shadow-gold gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </Button>
              </a>
            </motion.div>

            {/* Stats */}
            {content.stats && content.stats.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-primary-foreground/20"
              >
                {content.stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-accent mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-primary-foreground/70">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 md:w-14 md:h-14 rounded-full bg-card/20 backdrop-blur-sm border border-primary-foreground/30 flex items-center justify-center text-primary-foreground hover:bg-card/30 hover:border-accent transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-40 w-12 h-12 md:w-14 md:h-14 rounded-full bg-card/20 backdrop-blur-sm border border-primary-foreground/30 flex items-center justify-center text-primary-foreground hover:bg-card/30 hover:border-accent transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-10 bg-accent shadow-gold"
                  : "w-2.5 bg-primary-foreground/40 hover:bg-primary-foreground/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroSection;
