import { motion } from "framer-motion";
import { Plane, Check, Gift, Calendar, MapPin, Phone, Clock, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/currency";
import MakkahIcon from "./icons/MakkahIcon";

const DarulFurkanPackages = () => {
  const packageInclusions = [
    "ভিসা (Visa)",
    "এয়ার টিকেট (Air Ticket)",
    "রিয়াজুল জান্নাহ (Riyazul Jannah)",
    "হোটেল (Hotel)",
    "ট্রান্সপোর্ট (Transport)",
    "জিয়ারাহ (Ziyarah)",
    "৩ বেলা খাবার (3 Meals/Day)",
  ];

  const flightPackages = [
    {
      type: "Transit Flight",
      typeBn: "ট্রানজিট ফ্লাইট",
      price: 135000,
      flightDate: "10 June 2026",
      flightDateBn: "১০ জুন ২০২৬",
      highlight: false,
    },
    {
      type: "Direct Flight",
      typeBn: "ডিরেক্ট ফ্লাইট",
      price: 145000,
      flightDate: "15 June 2026",
      flightDateBn: "১৫ জুন ২০২৬",
      highlight: true,
    },
  ];

  const itikafPackages = [
    { days: 15, daysBn: "১৫ দিন", price: 165000, label: "15 Days Itikaf" },
    { days: 20, daysBn: "২০ দিন", price: 170000, label: "20 Days Itikaf" },
    { days: 30, daysBn: "৩০ দিন", price: 192000, label: "30 Days Itikaf" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" as const },
    },
  };

  return (
    <section id="umrah-packages" className="py-20 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 islamic-star-pattern opacity-30" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-2 text-sm font-semibold">
            <Sparkles className="w-4 h-4 mr-2" />
            ২০২৬ হজ্জ পরবর্তী উমরাহ প্যাকেজ
          </Badge>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            Umrah Package <span className="text-gradient-green">2026</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            হজ্জ পরবর্তী উমরাহ প্যাকেজ - সম্পূর্ণ সেবা সহ পবিত্র ভূমিতে আপনার যাত্রা
          </p>
        </motion.div>

        {/* Lottery Offer Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mb-12 bg-gradient-to-r from-primary via-emerald-dark to-primary rounded-3xl p-6 md:p-8 text-primary-foreground shadow-lg relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-secondary rounded-full flex items-center justify-center shadow-gold">
                <Gift className="w-8 h-8 md:w-10 md:h-10 text-foreground" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-1">
                  লটারির মাধ্যমে ফ্রি উমরাহ!
                </h3>
                <p className="text-primary-foreground/80 text-lg">
                  প্রতি ৫০ জনে একজন সুযোগ পাবেন
                </p>
              </div>
            </div>
            <div className="bg-secondary/20 backdrop-blur-sm rounded-xl px-6 py-4 border border-secondary/30">
              <p className="text-sm text-primary-foreground/70 mb-1">Special Offer Period</p>
              <p className="text-xl md:text-2xl font-bold">
                ২৪ জানুয়ারি - ১০ ফেব্রুয়ারি
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Package Inclusions Card */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="df-card h-full p-8 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MakkahIcon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-foreground">প্যাকেজের অন্তর্ভুক্ত</h3>
                  <p className="text-sm text-muted-foreground">Package Includes</p>
                </div>
              </div>
              
              <ul className="space-y-4">
                {packageInclusions.map((item, index) => (
                  <motion.li
                    key={index}
                    variants={itemVariants}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground font-medium">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Flight Packages */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {flightPackages.map((pkg, index) => (
                <motion.div
                  key={pkg.type}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className={`df-card relative overflow-hidden ${
                    pkg.highlight 
                      ? "ring-2 ring-secondary shadow-gold" 
                      : ""
                  }`}
                >
                  {pkg.highlight && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-secondary text-foreground text-xs font-bold px-4 py-1 rounded-bl-xl">
                        RECOMMENDED
                      </div>
                    </div>
                  )}
                  
                  <div className="p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        pkg.highlight 
                          ? "bg-secondary text-foreground" 
                          : "bg-primary/10 text-primary"
                      }`}>
                        <Plane className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-heading text-xl font-bold text-foreground">{pkg.typeBn}</h4>
                        <p className="text-sm text-muted-foreground">{pkg.type}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-sm text-muted-foreground mb-1">Package Price</p>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-4xl md:text-5xl font-bold ${
                          pkg.highlight ? "text-gradient-gold" : "text-gradient-green"
                        }`}>
                          {formatCurrency(pkg.price)}
                        </span>
                        <span className="text-muted-foreground">/-</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl mb-6">
                      <Calendar className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Flight Date</p>
                        <p className="font-semibold text-foreground">{pkg.flightDateBn}</p>
                      </div>
                    </div>

                    <Button 
                      className={`w-full ${
                        pkg.highlight 
                          ? "bg-gradient-gold hover:opacity-90 text-foreground" 
                          : "bg-gradient-primary hover:opacity-90"
                      }`}
                      size="lg"
                    >
                      Book Now
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Itikaf Packages */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-secondary/10 text-secondary border-secondary/20">
              <Star className="w-4 h-4 mr-2" />
              পবিত্র রমজানে ইতেকাফ
            </Badge>
            <h3 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
              Itikaf Packages
            </h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {itikafPackages.map((pkg, index) => (
              <motion.div
                key={pkg.days}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="df-card text-center p-6 md:p-8"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                
                <h4 className="font-heading text-2xl font-bold text-foreground mb-2">
                  {pkg.daysBn}
                </h4>
                <p className="text-muted-foreground mb-6">{pkg.label}</p>
                
                <div className="mb-6">
                  <span className="text-3xl md:text-4xl font-bold text-gradient-green">
                    {formatCurrency(pkg.price)}
                  </span>
                  <span className="text-muted-foreground">/-</span>
                </div>

                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                  Select Package
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-r from-primary to-emerald-dark rounded-3xl p-8 md:p-12 text-primary-foreground"
        >
          <div className="text-center mb-8">
            <h3 className="font-heading text-2xl md:text-3xl font-bold mb-2">
              Darul Furkan Tours & Travels
            </h3>
            <p className="text-primary-foreground/80">যোগাযোগ করুন</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-primary-foreground/10 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-primary-foreground/70 mb-1">Address</p>
                <p className="font-medium">
                  382, Baganbari, Swadhinata Sarani,<br />
                  Uttar Badda, Dhaka 1212
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-primary-foreground/10 rounded-full flex items-center justify-center">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-primary-foreground/70 mb-1">Phone</p>
                <a href="tel:+8801741719932" className="block font-bold text-xl hover:text-secondary transition-colors">
                  01741-719932
                </a>
                <a href="tel:+8801339080532" className="block font-bold text-xl hover:text-secondary transition-colors">
                  01339-080532
                </a>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                <Gift className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-primary-foreground/70 mb-1">Special Offer</p>
                <p className="font-bold text-secondary">
                  ২৪ জানুয়ারি - ১০ ফেব্রুয়ারি
                </p>
                <p className="text-sm text-primary-foreground/80">বিশেষ ছাড় চলছে!</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DarulFurkanPackages;
