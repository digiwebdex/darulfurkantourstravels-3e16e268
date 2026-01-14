import { ChevronDown, Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-kaaba.jpg";
import { motion } from "framer-motion";

const HeroSection = () => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={heroImage}
          alt="The Holy Kaaba in Mecca"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        {/* Animated Overlay Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
        </div>
      </div>

      {/* Floating Decorative Elements */}
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-10 w-20 h-20 border border-secondary/30 rounded-full hidden lg:block"
      />
      <motion.div
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 right-10 w-32 h-32 border border-secondary/20 rounded-full hidden lg:block"
      />

      {/* Content */}
      <div className="relative z-10 container text-center text-primary-foreground pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-secondary/20 backdrop-blur-md rounded-full text-secondary font-medium mb-8 border border-secondary/30"
          >
            <Star className="w-4 h-4 fill-secondary" />
            Govt. Approved Hajj & Umrah Agency
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight"
          >
            Your Sacred Journey
            <span className="block text-gradient-gold mt-2">Begins Here</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Experience the spiritual journey of a lifetime with SM Elite Hajj. 
            We provide premium Hajj & Umrah packages with complete care and guidance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <Button
              size="lg"
              onClick={() => scrollToSection("hajj")}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-gold text-lg px-8 py-7 font-semibold group"
            >
              <span>Explore Hajj Packages</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="ml-2"
              >
                →
              </motion.span>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToSection("umrah")}
              className="border-2 border-primary-foreground/50 text-primary-foreground bg-primary-foreground/10 backdrop-blur-sm hover:bg-primary-foreground/20 text-lg px-8 py-7"
            >
              View Umrah Packages
            </Button>
          </motion.div>

          {/* Video CTA */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="inline-flex items-center gap-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors group"
          >
            <span className="w-14 h-14 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary-foreground/30 transition-all group-hover:scale-110">
              <Play className="w-5 h-5 fill-current ml-1" />
            </span>
            <span className="font-medium">Watch Our Journey Video</span>
          </motion.button>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-12 border-t border-primary-foreground/20"
          >
            {[
              { number: "10+", label: "Years Experience" },
              { number: "5000+", label: "Happy Pilgrims" },
              { number: "100%", label: "Satisfaction Rate" },
              { number: "24/7", label: "Support Available" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                className="text-center group"
              >
                <div className="font-heading text-4xl md:text-5xl font-bold text-secondary mb-2 group-hover:scale-110 transition-transform">
                  {stat.number}
                </div>
                <div className="text-primary-foreground/80 text-sm md:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.a
          href="#hajj"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ 
            opacity: { delay: 1.2, duration: 0.5 },
            y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors"
        >
          <span className="text-sm font-medium">Scroll to Explore</span>
          <ChevronDown className="w-6 h-6" />
        </motion.a>
      </div>
    </section>
  );
};

export default HeroSection;
