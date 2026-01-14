import { Check, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PackageCardProps {
  name: string;
  price: string;
  features: string[];
  isPopular?: boolean;
  flightDate?: string;
  index?: number;
}

const PackageCard = ({ name, price, features, isPopular, flightDate, index = 0 }: PackageCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className={cn(
        "relative bg-card rounded-2xl shadow-elegant overflow-hidden transition-all duration-300 hover:shadow-lg group",
        isPopular && "ring-2 ring-secondary scale-105 z-10"
      )}
    >
      {isPopular && (
        <div className="absolute top-0 left-0 right-0 bg-secondary text-secondary-foreground py-2 text-center text-sm font-semibold flex items-center justify-center gap-2">
          <Star className="w-4 h-4 fill-current" />
          Most Popular Choice
        </div>
      )}

      {/* Header */}
      <div className={cn(
        "bg-gradient-primary p-6 text-primary-foreground relative overflow-hidden",
        isPopular && "pt-12"
      )}>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary-foreground/10 rounded-full" />
        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-primary-foreground/5 rounded-full" />
        
        <h3 className="font-heading text-2xl font-bold mb-2 relative z-10">{name}</h3>
        {flightDate && (
          <p className="text-sm text-primary-foreground/80 mb-3 relative z-10">
            ✈️ Flight Date: {flightDate}
          </p>
        )}
        <div className="flex items-baseline gap-2 relative z-10">
          <span className="font-heading text-4xl font-bold">{price}</span>
          <span className="text-primary-foreground/70 text-sm">BDT/person</span>
        </div>
      </div>

      {/* Features */}
      <div className="p-6">
        <ul className="space-y-3 mb-6">
          {features.slice(0, 8).map((feature, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              className="flex items-start gap-3"
            >
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                isPopular ? "bg-secondary/20" : "bg-primary/10"
              )}>
                <Check className={cn(
                  "w-3 h-3",
                  isPopular ? "text-secondary" : "text-primary"
                )} />
              </div>
              <span className="text-foreground/80 text-sm">{feature}</span>
            </motion.li>
          ))}
        </ul>

        <Button
          className={cn(
            "w-full group/btn relative overflow-hidden",
            isPopular
              ? "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-gold"
              : "bg-gradient-primary hover:opacity-90"
          )}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            Book This Package
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </span>
        </Button>
      </div>
    </motion.div>
  );
};

export default PackageCard;
