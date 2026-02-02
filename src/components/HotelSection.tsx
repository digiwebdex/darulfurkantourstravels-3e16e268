import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Home, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HotelDetailsModal from "./HotelDetailsModal";
import HotelBookingModal from "./HotelBookingModal";

interface Hotel {
  id: string;
  name: string;
  city: string;
  country: string;
  star_rating: number;
  distance_from_haram: number;
  description: string | null;
  facilities: string[];
  images: string[];
  google_map_link: string | null;
  google_map_embed_url: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  is_active: boolean;
}

interface Destination {
  id: string;
  country_name: string;
  country_code: string;
  flag_url: string | null;
  is_active: boolean;
  order_index: number;
}

interface SectionSettings {
  title: string;
  subtitle: string;
  is_enabled: boolean;
  booking_enabled: boolean;
  star_label: string;
}

const HotelSection = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedStarRating, setSelectedStarRating] = useState<number | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [settings, setSettings] = useState<SectionSettings>({
    title: "Hotel Bookings",
    subtitle: "Find your perfect stay",
    is_enabled: true,
    booking_enabled: true,
    star_label: "Star",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [hotelsRes, destinationsRes, settingsRes] = await Promise.all([
      supabase.from("hotels").select("*").eq("is_active", true).order("order_index"),
      supabase.from("hotel_destinations").select("*").eq("is_active", true).order("order_index"),
      supabase.from("hotel_section_settings").select("*").eq("section_key", "general").maybeSingle(),
    ]);

    if (!hotelsRes.error) setHotels(hotelsRes.data || []);
    if (!destinationsRes.error) setDestinations(destinationsRes.data || []);
    
    if (settingsRes.data) {
      setSettings({
        title: settingsRes.data.title || "Hotel Bookings",
        subtitle: settingsRes.data.subtitle || "Find your perfect stay",
        is_enabled: settingsRes.data.is_enabled ?? true,
        booking_enabled: settingsRes.data.booking_enabled ?? true,
        star_label: settingsRes.data.star_label || "Star",
      });
    }
    setLoading(false);
  };

  const getSelectedDestination = () => {
    return destinations.find(d => d.country_name === selectedCountry);
  };

  const getStarRatings = () => {
    const filtered = hotels.filter(h => (h.country || "Saudi Arabia") === selectedCountry);
    const ratings = new Set(filtered.map(h => h.star_rating));
    return Array.from(ratings).sort((a, b) => a - b);
  };

  const getFilteredHotels = () => {
    return hotels.filter(
      h => (h.country || "Saudi Arabia") === selectedCountry && h.star_rating === selectedStarRating
    );
  };

  const handleBookNow = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setBookingModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const starRatings = getStarRatings();
  const filteredHotels = getFilteredHotels();
  const selectedDestination = getSelectedDestination();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
                <Home className="h-8 w-8 text-primary" />
                {settings.title}
              </h1>
              <p className="text-muted-foreground mt-2">{settings.subtitle}</p>
            </div>
            <Button variant="outline" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Country Selection */}
          {!selectedCountry && (
            <motion.div
              key="countries"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-2xl font-semibold mb-6 text-center">Select Destination Country</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {destinations.map((destination) => (
                  <button
                    key={destination.id}
                    onClick={() => setSelectedCountry(destination.country_name)}
                    className="bg-card p-5 shadow-md rounded-xl hover:bg-primary/10 transition-all hover:shadow-lg hover:scale-105 text-left border flex flex-col items-start gap-3"
                  >
                    {destination.flag_url ? (
                      <img 
                        src={destination.flag_url} 
                        alt={`${destination.country_name} flag`} 
                        className="w-16 h-auto rounded shadow-sm"
                      />
                    ) : (
                      <span className="text-4xl">🌍</span>
                    )}
                    <span className="font-medium">{destination.country_name}</span>
                  </button>
                ))}
              </div>
              {destinations.length === 0 && (
                <p className="text-center text-muted-foreground py-12">No destinations available.</p>
              )}
            </motion.div>
          )}

          {/* Step 2: Star Category */}
          {selectedCountry && !selectedStarRating && (
            <motion.div
              key="stars"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <button
                onClick={() => setSelectedCountry(null)}
                className="mb-4 text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <h2 className="text-2xl font-semibold mb-6 text-center flex items-center justify-center gap-3">
                {selectedDestination?.flag_url && (
                  <img 
                    src={selectedDestination.flag_url} 
                    alt={`${selectedCountry} flag`} 
                    className="w-8 h-auto rounded shadow-sm"
                  />
                )}
                {selectedCountry} - Select Category
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
                {starRatings.map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setSelectedStarRating(rating)}
                    className="bg-card p-8 shadow-md rounded-xl hover:bg-primary/10 transition-all hover:shadow-lg hover:scale-105 border flex flex-col items-center gap-3"
                  >
                    <div className="flex gap-1">
                      {Array.from({ length: rating }).map((_, i) => (
                        <Star key={i} className="h-6 w-6 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="font-semibold text-lg">{rating} {settings.star_label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Hotel Listings */}
          {selectedCountry && selectedStarRating && (
            <motion.div
              key="hotels"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <button
                onClick={() => setSelectedStarRating(null)}
                className="mb-4 text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <h2 className="text-2xl font-semibold mb-6 text-center">
                {selectedStarRating} {settings.star_label} Hotels in {selectedCountry}
              </h2>

              {filteredHotels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredHotels.map((hotel) => (
                    <div key={hotel.id} className="bg-card rounded-xl shadow-lg overflow-hidden border hover:shadow-xl transition-shadow">
                      {hotel.images?.[0] && (
                        <img src={hotel.images[0]} alt={hotel.name} className="w-full h-48 object-cover" />
                      )}
                      <div className="p-5">
                        <h3 className="font-bold text-lg mb-1">{hotel.name}</h3>
                        <p className="text-muted-foreground text-sm flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {hotel.city}
                        </p>
                        {hotel.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{hotel.description}</p>
                        )}
                        <div className="flex gap-2 mt-4">
                          {hotel.google_map_link && (
                            <Button variant="outline" size="sm" onClick={() => window.open(hotel.google_map_link!, '_blank')}>
                              <MapPin className="h-4 w-4 mr-1" /> Map
                            </Button>
                          )}
                          {settings.booking_enabled && (
                            <Button size="sm" onClick={() => handleBookNow(hotel)}>Book Now</Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">No hotels available for this selection.</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <HotelDetailsModal
        hotel={selectedHotel}
        open={detailsModalOpen}
        onOpenChange={setDetailsModalOpen}
        onBookNow={() => { setDetailsModalOpen(false); setBookingModalOpen(true); }}
      />
      <HotelBookingModal hotel={selectedHotel} open={bookingModalOpen} onOpenChange={setBookingModalOpen} />
    </div>
  );
};

export default HotelSection;
