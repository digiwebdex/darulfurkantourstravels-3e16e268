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

interface SectionSettings {
  title: string;
  subtitle: string;
  is_enabled: boolean;
  booking_enabled: boolean;
  star_label: string;
}

// Demo fallback data
const DEMO_HOTELS: Record<string, Record<string, { name: string; city: string; price: string; country: string; image: string; mapLink: string }[]>> = {
  "Saudi Arabia": {
    "3": [
      { name: "Al Ebaa Hotel", city: "Makkah", price: "৳8,000/night", country: "Saudi Arabia", image: "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Al+Ebaa+Hotel+Makkah" },
      { name: "Diyar Al Salam", city: "Madinah", price: "৳7,500/night", country: "Saudi Arabia", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Diyar+Al+Salam+Hotel+Madinah" }
    ],
    "4": [
      { name: "Elaf Ajyad Hotel", city: "Makkah", price: "৳12,000/night", country: "Saudi Arabia", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Elaf+Ajyad+Hotel+Makkah" },
      { name: "Saja Al Madinah", city: "Madinah", price: "৳11,000/night", country: "Saudi Arabia", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Saja+Al+Madinah+Hotel" }
    ],
    "5": [
      { name: "Swissotel Makkah", city: "Makkah", price: "৳25,000/night", country: "Saudi Arabia", image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Swissotel+Makkah" },
      { name: "Anwar Al Madinah Mövenpick", city: "Madinah", price: "৳23,000/night", country: "Saudi Arabia", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Anwar+Al+Madinah+Movenpick" }
    ]
  },
  "Dubai": {
    "3": [{ name: "Citymax Hotel", city: "Dubai", price: "৳7,000/night", country: "Dubai", image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Citymax+Hotel+Dubai" }],
    "4": [{ name: "Golden Tulip Deira", city: "Dubai", price: "৳13,000/night", country: "Dubai", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Golden+Tulip+Deira+Dubai" }],
    "5": [{ name: "Atlantis The Palm", city: "Dubai", price: "৳45,000/night", country: "Dubai", image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Atlantis+The+Palm+Dubai" }]
  },
  "Turkey": {
    "3": [{ name: "Grand Hilarium Hotel", city: "Istanbul", price: "৳6,500/night", country: "Turkey", image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Grand+Hilarium+Hotel+Istanbul" }],
    "4": [
      { name: "Dosso Dossi Downtown", city: "Istanbul", price: "৳10,000/night", country: "Turkey", image: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Dosso+Dossi+Downtown+Istanbul" },
      { name: "Ramada Plaza Antalya", city: "Antalya", price: "৳9,500/night", country: "Turkey", image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Ramada+Plaza+Antalya" }
    ],
    "5": [{ name: "Four Seasons Sultanahmet", city: "Istanbul", price: "৳35,000/night", country: "Turkey", image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Four+Seasons+Sultanahmet+Istanbul" }]
  },
  "Malaysia": {
    "3": [{ name: "Ancasa Express", city: "Kuala Lumpur", price: "৳5,000/night", country: "Malaysia", image: "https://images.unsplash.com/photo-1596436889106-be35e843f974?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Ancasa+Express+Kuala+Lumpur" }],
    "4": [
      { name: "Sunway Putra Hotel", city: "Kuala Lumpur", price: "৳8,500/night", country: "Malaysia", image: "https://images.unsplash.com/photo-1587213811864-46e59f6873b1?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Sunway+Putra+Hotel+Kuala+Lumpur" },
      { name: "DoubleTree Langkawi", city: "Langkawi", price: "৳9,000/night", country: "Malaysia", image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=DoubleTree+Langkawi" }
    ],
    "5": [{ name: "Mandarin Oriental KL", city: "Kuala Lumpur", price: "৳28,000/night", country: "Malaysia", image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Mandarin+Oriental+Kuala+Lumpur" }]
  },
  "Thailand": {
    "3": [{ name: "Ibis Bangkok Siam", city: "Bangkok", price: "৳4,500/night", country: "Thailand", image: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Ibis+Bangkok+Siam" }],
    "4": [
      { name: "Novotel Bangkok", city: "Bangkok", price: "৳7,500/night", country: "Thailand", image: "https://images.unsplash.com/photo-1549294413-26f195200c16?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Novotel+Bangkok" },
      { name: "Centara Pattaya", city: "Pattaya", price: "৳8,000/night", country: "Thailand", image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Centara+Pattaya" }
    ],
    "5": [{ name: "Shangri-La Bangkok", city: "Bangkok", price: "৳22,000/night", country: "Thailand", image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Shangri-La+Bangkok" }]
  },
  "Singapore": {
    "3": [{ name: "Hotel Boss", city: "Singapore", price: "৳7,000/night", country: "Singapore", image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Hotel+Boss+Singapore" }],
    "4": [{ name: "Park Hotel Clarke Quay", city: "Singapore", price: "৳12,000/night", country: "Singapore", image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Park+Hotel+Clarke+Quay+Singapore" }],
    "5": [{ name: "Marina Bay Sands", city: "Singapore", price: "৳55,000/night", country: "Singapore", image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Marina+Bay+Sands+Singapore" }]
  },
  "Indonesia": {
    "3": [{ name: "Fave Hotel Kuta", city: "Bali", price: "৳4,000/night", country: "Indonesia", image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Fave+Hotel+Kuta+Bali" }],
    "4": [{ name: "Swiss-Belhotel Rainforest", city: "Bali", price: "৳8,000/night", country: "Indonesia", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Swiss-Belhotel+Rainforest+Bali" }],
    "5": [{ name: "The Mulia Bali", city: "Bali", price: "৳40,000/night", country: "Indonesia", image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=The+Mulia+Bali" }]
  },
  "Egypt": {
    "3": [{ name: "Pyramids View Inn", city: "Cairo", price: "৳5,500/night", country: "Egypt", image: "https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Pyramids+View+Inn+Cairo" }],
    "4": [{ name: "Steigenberger Pyramids", city: "Cairo", price: "৳9,000/night", country: "Egypt", image: "https://images.unsplash.com/photo-1549294413-26f195200c16?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Steigenberger+Pyramids+Cairo" }],
    "5": [{ name: "Four Seasons Cairo", city: "Cairo", price: "৳32,000/night", country: "Egypt", image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=300&fit=crop", mapLink: "https://maps.google.com/?q=Four+Seasons+Cairo" }]
  }
};

// Country codes for flag images (using flagcdn.com)
const COUNTRY_CODES: Record<string, string> = {
  "Saudi Arabia": "sa",
  "Dubai": "ae",
  "Turkey": "tr",
  "Malaysia": "my",
  "Thailand": "th",
  "Singapore": "sg",
  "Indonesia": "id",
  "Egypt": "eg",
};

const getFlagUrl = (country: string) => {
  const code = COUNTRY_CODES[country];
  if (code) {
    return `https://flagcdn.com/w80/${code}.png`;
  }
  return null;
};

const HotelSection = () => {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState<Hotel[]>([]);
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

  const useDemoData = hotels.length === 0 && !loading;

  useEffect(() => {
    fetchHotels();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from("hotel_section_settings")
      .select("*")
      .eq("section_key", "general")
      .maybeSingle();

    if (data) {
      setSettings({
        title: data.title || "Hotel Bookings",
        subtitle: data.subtitle || "Find your perfect stay",
        is_enabled: data.is_enabled ?? true,
        booking_enabled: data.booking_enabled ?? true,
        star_label: data.star_label || "Star",
      });
    }
  };

  const fetchHotels = async () => {
    const { data, error } = await supabase
      .from("hotels")
      .select("*")
      .eq("is_active", true)
      .order("order_index");

    if (error) {
      console.error("Error fetching hotels:", error);
    } else {
      setHotels(data || []);
    }
    setLoading(false);
  };

  const getCountries = () => {
    if (useDemoData) return Object.keys(DEMO_HOTELS);
    const countrySet = new Set(hotels.map(h => h.country || "Saudi Arabia"));
    return Array.from(countrySet);
  };

  const getStarRatings = () => {
    if (useDemoData && selectedCountry) {
      return Object.keys(DEMO_HOTELS[selectedCountry] || {}).map(r => parseInt(r));
    }
    const filtered = hotels.filter(h => (h.country || "Saudi Arabia") === selectedCountry);
    const ratings = new Set(filtered.map(h => h.star_rating));
    return Array.from(ratings).sort((a, b) => a - b);
  };

  const getFilteredHotels = () => {
    return hotels.filter(
      h => (h.country || "Saudi Arabia") === selectedCountry && h.star_rating === selectedStarRating
    );
  };

  const getDemoHotels = () => {
    if (!selectedCountry || !selectedStarRating) return [];
    return DEMO_HOTELS[selectedCountry]?.[String(selectedStarRating)] || [];
  };

  const handleBookNow = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setBookingModalOpen(true);
  };

  const handleDemoBookNow = (demoHotel: { name: string; city: string; price: string; country: string; image: string; mapLink: string }) => {
    const tempHotel: Hotel = {
      id: `demo-${Date.now()}`,
      name: demoHotel.name,
      city: demoHotel.city,
      country: demoHotel.country,
      star_rating: selectedStarRating || 3,
      distance_from_haram: 0,
      description: null,
      facilities: [],
      images: [demoHotel.image],
      google_map_link: demoHotel.mapLink,
      google_map_embed_url: null,
      contact_phone: null,
      contact_email: null,
      is_active: true,
    };
    setSelectedHotel(tempHotel);
    setBookingModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const countries = getCountries();
  const starRatings = getStarRatings();
  const filteredHotels = getFilteredHotels();
  const demoHotels = getDemoHotels();

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
                {countries.map((country) => {
                  const flagUrl = getFlagUrl(country);
                  return (
                    <button
                      key={country}
                      onClick={() => setSelectedCountry(country)}
                      className="bg-card p-5 shadow-md rounded-xl hover:bg-primary/10 transition-all hover:shadow-lg hover:scale-105 text-left border flex flex-col items-start gap-3"
                    >
                      {flagUrl ? (
                        <img 
                          src={flagUrl} 
                          alt={`${country} flag`} 
                          className="w-16 h-auto rounded shadow-sm"
                        />
                      ) : (
                        <span className="text-4xl">🌍</span>
                      )}
                      <span className="font-medium">{country}</span>
                    </button>
                  );
                })}
              </div>
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
                {getFlagUrl(selectedCountry) && (
                  <img 
                    src={getFlagUrl(selectedCountry)!} 
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

              {/* Database Hotels */}
              {filteredHotels.length > 0 && (
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
              )}

              {/* Demo Hotels */}
              {filteredHotels.length === 0 && demoHotels.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {demoHotels.map((hotel, index) => (
                    <div key={index} className="bg-card rounded-xl shadow-lg overflow-hidden border hover:shadow-xl transition-shadow">
                      <img src={hotel.image} alt={hotel.name} className="w-full h-48 object-cover" />
                      <div className="p-5">
                        <h3 className="font-bold text-lg mb-1">{hotel.name}</h3>
                        <p className="text-muted-foreground text-sm flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {hotel.city}
                        </p>
                        <p className="text-primary font-semibold mt-2">{hotel.price}</p>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" onClick={() => window.open(hotel.mapLink, '_blank')}>
                            <MapPin className="h-4 w-4 mr-1" /> Map
                          </Button>
                          <Button size="sm" onClick={() => handleDemoBookNow(hotel)}>Book Now</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {filteredHotels.length === 0 && demoHotels.length === 0 && (
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
