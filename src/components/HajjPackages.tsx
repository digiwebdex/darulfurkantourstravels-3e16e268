import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import DynamicPackages from "./DynamicPackages";
import IslamicBorder from "./IslamicBorder";

const HajjPackages = () => {
  return (
    <IslamicBorder>
      <section id="hajj" className="py-24 bg-muted geometric-pattern relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-secondary font-semibold uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            Hajj Packages
          </span>
          <h2 className="font-calligraphy text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mt-3 mb-2">
            Hajj Packages 2026
          </h2>
          <span className="font-thuluth text-secondary/60 text-2xl md:text-3xl block mb-6">حج</span>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Premium Hajj packages for the sacred pilgrimage to Makkah. Experience the journey of a lifetime with complete care and guidance.
          </p>
          
          {/* Quick Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-6 mt-8"
          >
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-elegant cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Makkah & Madinah</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-elegant cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Dhul Hijjah 1447</span>
            </motion.div>
          </motion.div>
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
            Government Approved Hajj & Umrah Agency
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {["Government Approved", "10+ Years Experience", "5000+ Happy Pilgrims"].map((item, index) => (
              <motion.span 
                key={item}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                className="inline-flex items-center gap-2 text-primary text-sm font-medium"
              >
                ✓ {item}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
      </section>
    </IslamicBorder>
  );
};

export default HajjPackages;
