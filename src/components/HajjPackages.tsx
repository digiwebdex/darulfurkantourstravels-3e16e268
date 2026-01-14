import PackageCard from "./PackageCard";
import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";

const HajjPackages = () => {
  const packages = [
    {
      name: "Super Economy",
      price: "6,35,000/-",
      features: [
        "Hotels in Makkah and Medina",
        "800m from Haram in Mecca",
        "900m from Masjid Nabawi in Medina",
        "5-6 people per room",
        "Saudi / Biman Bangladesh Airlines",
        "AC Bus Transportation",
        "Three meals daily (Local food)",
        "Ziyarah in Makkah & Madinah",
      ],
    },
    {
      name: "Classic",
      price: "7,40,000/-",
      features: [
        "3-Star Hotels in Makkah and Medina",
        "700m from Haram in Mecca",
        "600m from Masjid Nabawi in Medina",
        "5-6 people per room",
        "Saudi / Biman Bangladesh Airlines",
        "AC Bus Transportation",
        "Three meals daily (Local food)",
        "Ziyarah in Makkah & Madinah",
      ],
    },
    {
      name: "Premium",
      price: "8,90,000/-",
      isPopular: true,
      features: [
        "3-Star Hotels in Makkah and Medina",
        "500m from Haram in Mecca",
        "300m from Masjid Nabawi in Medina",
        "4-5 people per room",
        "Laundry service included",
        "Saudi / Biman Bangladesh Airlines",
        "AC Bus Transportation",
        "Three meals daily",
      ],
    },
    {
      name: "VIP",
      price: "14,50,000/-",
      features: [
        "5-Star Hotels in Makkah and Medina",
        "Adjacent to Haram in Mecca",
        "Adjacent to Masjid Nabawi in Medina",
        "4 people per room",
        "Full laundry and concierge service",
        "Saudi Airlines (Business Class)",
        "Private Transport Service",
        "Buffet food arrangement",
      ],
    },
  ];

  return (
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
            Our Packages
          </span>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mt-3 mb-6">
            Hajj Packages 2026
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Choose from our carefully curated Hajj packages designed to provide you with a comfortable 
            and spiritually enriching experience on this sacred journey.
          </p>
          
          {/* Quick Info */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-elegant">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Makkah & Madinah</span>
            </div>
            <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-elegant">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Dhul Hijjah 1447</span>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 xl:gap-6">
          {packages.map((pkg, index) => (
            <PackageCard key={pkg.name} {...pkg} index={index} />
          ))}
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground text-sm mb-4">
            All prices are subject to change. Government taxes and visa fees included.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="inline-flex items-center gap-2 text-primary text-sm font-medium">
              ✓ Govt. Approved Agency
            </span>
            <span className="inline-flex items-center gap-2 text-primary text-sm font-medium">
              ✓ 10+ Years Experience
            </span>
            <span className="inline-flex items-center gap-2 text-primary text-sm font-medium">
              ✓ 5000+ Successful Pilgrims
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HajjPackages;
