import { useState, useEffect, useCallback, useRef } from "react";
import { Star, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence, Easing } from "framer-motion";
import { useTranslation } from "@/hooks/useTranslation";
import HeroCurveWave from "./HeroCurveWave";

// Import hero images for fallback image display
import heroKaaba from "@/assets/hero-kaaba.jpg";
import heroMedina from "@/assets/hero-medina-new.jpg";
import heroHajj from "@/assets/hero-hajj-banner.jpg";

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
  
  // No hardcoded default slides - content comes from database only

  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  // Slides loaded from database only

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

  const content = slides[currentSlide];

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

  // Return null if no slides (no fallback content, database must have hero slides)
  if (slides.length === 0) return null;
  
  // Safe guard for content
  if (!content) return null;

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
              transition: 'opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'opacity',
            }}
          >
            <img
              src={slide.background_image_url || defaultHeroImages[index % 3]}
              alt=""
              className="w-full h-full object-cover transform-gpu scale-110 filter brightness-105 contrast-110 saturate-110"
              style={{
                animation: index === currentSlide ? 'slowZoom 12s ease-out forwards' : 'none',
              }}
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
        
        {/* Premium Multi-Layer Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent z-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-transparent to-primary/40 z-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-primary/80 z-20" />
        
        {/* Gold Accent Glow - Multiple Points */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-1/2 bg-accent/20 blur-[100px] z-15" />
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-accent/10 blur-[120px] rounded-full z-15" />
        <div className="absolute top-1/3 left-0 w-80 h-80 bg-accent/10 blur-[100px] rounded-full z-15" />
        
        {/* Animated Shimmer Effect */}
        <div className="absolute inset-0 z-21 opacity-30 pointer-events-none"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(212, 175, 55, 0.1) 45%, rgba(212, 175, 55, 0.2) 50%, rgba(212, 175, 55, 0.1) 55%, transparent 60%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 8s infinite linear',
          }}
        />
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
              <motion.div variants={itemVariants} className="mb-8">
                <span className="inline-flex items-center gap-3 px-6 py-3 rounded-full text-sm font-semibold bg-gradient-to-r from-accent/30 to-accent/20 text-accent border border-accent/50 backdrop-blur-md shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                  <Star className="w-5 h-5 fill-current animate-pulse" />
                  {content.badge_text}
                  <Star className="w-5 h-5 fill-current animate-pulse" />
                </span>
              </motion.div>
            )}

            {/* Title */}
            <motion.h1
              variants={itemVariants}
              className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary-foreground mb-6 leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            >
              <span className="relative inline-block">
                {content.title}
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-60" />
              </span>
              {content.subtitle && (
                <span className="block mt-4 text-2xl sm:text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-accent via-secondary to-accent bg-clip-text text-transparent font-bold animate-pulse">
                  {content.subtitle}
                </span>
              )}
            </motion.h1>

            {/* Description */}
            {content.description && (
              <motion.p
                variants={itemVariants}
                className="text-lg sm:text-xl md:text-2xl text-primary-foreground/90 max-w-3xl mx-auto mb-10 leading-relaxed font-medium drop-shadow-lg"
              >
                {content.description}
              </motion.p>
            )}

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row flex-wrap justify-center gap-5 mb-12">
              {content.primary_button_text && (
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-bold px-10 py-7 text-lg rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-primary-foreground/20 transition-all duration-300 hover:scale-105 hover:shadow-[0_15px_50px_rgba(0,0,0,0.4)]"
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
                  className="bg-gradient-to-r from-accent via-secondary to-accent hover:from-secondary hover:to-accent text-accent-foreground font-bold px-10 py-7 text-lg rounded-full shadow-[0_0_40px_rgba(212,175,55,0.4)] gap-3 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(212,175,55,0.6)]"
                >
                  <MessageCircle className="w-6 h-6" />
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

      {/* Curved Wave Transition */}
      <HeroCurveWave />
    </section>
  );
};

export default HeroSection;
