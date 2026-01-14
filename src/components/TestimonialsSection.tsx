import { Star, Quote } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Mohammad Rahman",
      location: "Dhaka, Bangladesh",
      package: "Hajj Premium 2025",
      rating: 5,
      text: "Alhamdulillah, the Hajj experience with SM Elite was beyond our expectations. The team took care of everything - from visa to comfortable accommodation near Haram. The guides were knowledgeable and caring. Highly recommend!",
      avatar: "MR",
    },
    {
      name: "Fatima Begum",
      location: "Chittagong, Bangladesh",
      package: "Umrah Economy",
      rating: 5,
      text: "As a first-time Umrah pilgrim, I was nervous about the journey. SM Elite made everything so easy. The hotel was very close to Masjid al-Haram, and the group leader helped us perform all rituals correctly. JazakAllah!",
      avatar: "FB",
    },
    {
      name: "Abdul Karim",
      location: "Sylhet, Bangladesh",
      package: "Hajj VIP 2024",
      rating: 5,
      text: "The VIP package was worth every penny. 5-star hotel adjacent to Haram, business class flights, and personal attention from staff. My parents performed Hajj comfortably at their age. Thank you SM Elite!",
      avatar: "AK",
    },
    {
      name: "Rashida Khatun",
      location: "Rajshahi, Bangladesh",
      package: "Umrah Etekaf",
      rating: 5,
      text: "The Etekaf package during Ramadan was spiritually transforming. Everything was well-organized - from iftar arrangements to Taraweeh. The coordinators in Madinah were extremely helpful. Will definitely travel again with SM Elite.",
      avatar: "RK",
    },
    {
      name: "Zahirul Islam",
      location: "Khulna, Bangladesh",
      package: "Hajj Classic 2024",
      rating: 5,
      text: "Very professional service from start to finish. The documentation process was smooth, flights were on time, and the hotels were clean and close to Haram. The food arrangements were also excellent. Highly satisfied!",
      avatar: "ZI",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted overflow-hidden">
      <div className="container">
        <div className="text-center mb-16">
          <span className="text-secondary font-semibold uppercase tracking-wider">
            Testimonials
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mt-3 mb-6">
            What Our Pilgrims Say
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Read authentic experiences from our valued pilgrims who trusted us 
            with their sacred journey.
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-6xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="bg-card rounded-2xl p-6 shadow-elegant h-full flex flex-col relative group hover:shadow-lg transition-all duration-300">
                  <Quote className="w-10 h-10 text-secondary/30 absolute top-4 right-4" />
                  
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-secondary fill-secondary" />
                    ))}
                  </div>

                  {/* Testimonial Text */}
                  <p className="text-foreground/80 text-sm leading-relaxed flex-grow mb-6">
                    "{testimonial.text}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-heading font-bold">
                        {testimonial.avatar}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-heading font-semibold text-foreground">
                        {testimonial.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.location}
                      </p>
                      <p className="text-xs text-secondary font-medium">
                        {testimonial.package}
                      </p>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-12" />
          <CarouselNext className="hidden md:flex -right-12" />
        </Carousel>
      </div>
    </section>
  );
};

export default TestimonialsSection;
