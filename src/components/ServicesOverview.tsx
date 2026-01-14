import { Plane, Hotel, Shield, Users, Clock, HeartHandshake } from "lucide-react";

const ServicesOverview = () => {
  const services = [
    {
      icon: Plane,
      title: "Flight Booking",
      description: "Premium airlines with comfortable travel arrangements to Saudi Arabia",
    },
    {
      icon: Hotel,
      title: "Hotel Accommodation",
      description: "Hand-picked hotels near Haram for convenient access to worship",
    },
    {
      icon: Shield,
      title: "Visa Processing",
      description: "100% success rate in Hajj & Umrah visa processing",
    },
    {
      icon: Users,
      title: "Expert Guides",
      description: "Experienced Islamic scholars to guide you through rituals",
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock assistance throughout your spiritual journey",
    },
    {
      icon: HeartHandshake,
      title: "Complete Care",
      description: "From departure to return, we handle every detail with care",
    },
  ];

  return (
    <section className="py-20 bg-card relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full translate-x-1/2 translate-y-1/2" />
      
      <div className="container relative z-10">
        <div className="text-center mb-12">
          <span className="text-secondary font-semibold uppercase tracking-wider">
            Why Choose Us
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mt-3">
            Complete Hajj & Umrah Services
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group flex items-start gap-4 p-6 rounded-xl hover:bg-muted/50 transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-elegant">
                <service.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-heading font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesOverview;
