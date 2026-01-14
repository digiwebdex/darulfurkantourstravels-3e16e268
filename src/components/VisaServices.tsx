import { ArrowRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const VisaServices = () => {
  const countries = [
    { name: "Thailand", flag: "🇹🇭", processingTime: "5-7 days", price: "From ৳8,000" },
    { name: "France", flag: "🇫🇷", processingTime: "15-20 days", price: "From ৳18,000" },
    { name: "Italy", flag: "🇮🇹", processingTime: "15-20 days", price: "From ৳18,000" },
    { name: "United States", flag: "🇺🇸", processingTime: "Interview based", price: "From ৳12,000" },
    { name: "Cuba", flag: "🇨🇺", processingTime: "10-15 days", price: "From ৳15,000" },
    { name: "Japan", flag: "🇯🇵", processingTime: "7-10 days", price: "From ৳10,000" },
    { name: "Australia", flag: "🇦🇺", processingTime: "20-25 days", price: "From ৳20,000" },
    { name: "Malaysia", flag: "🇲🇾", processingTime: "3-5 days", price: "From ৳5,000" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="visa" className="py-24 bg-muted relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50 geometric-pattern" />
      
      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-secondary font-semibold uppercase tracking-wider">
            <Globe className="w-4 h-4" />
            Global Services
          </span>
          <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mt-3 mb-6">
            Visa Processing Services
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            We provide hassle-free visa processing services for various countries. 
            Our experienced team ensures smooth documentation and timely processing.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {countries.map((country) => (
            <motion.div
              key={country.name}
              variants={itemVariants}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group bg-card rounded-2xl p-6 shadow-elegant hover:shadow-lg transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {country.flag}
                </div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                  {country.name}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  ⏱️ {country.processingTime}
                </p>
                <p className="text-sm font-semibold text-secondary mb-4">
                  {country.price}
                </p>
                <div className="flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 -translate-x-2">
                  Apply Now
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground group"
          >
            <span>View All Countries</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default VisaServices;
