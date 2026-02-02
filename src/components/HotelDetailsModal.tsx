import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Phone, Mail, Wifi, Car, Utensils, Dumbbell } from "lucide-react";

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
}

interface HotelDetailsModalProps {
  hotel: Hotel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookNow: () => void;
}

const facilityIcons: Record<string, any> = {
  wifi: Wifi,
  parking: Car,
  restaurant: Utensils,
  gym: Dumbbell,
};

const HotelDetailsModal = ({ hotel, open, onOpenChange, onBookNow }: HotelDetailsModalProps) => {
  if (!hotel) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hotel.name}
            <div className="flex ml-2">
              {Array.from({ length: hotel.star_rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Images */}
        {hotel.images && hotel.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {hotel.images.slice(0, 4).map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${hotel.name} ${index + 1}`}
                className="w-full h-40 object-cover rounded-lg"
              />
            ))}
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{hotel.city}, {hotel.country}</span>
          {hotel.distance_from_haram > 0 && (
            <span className="text-sm">• {hotel.distance_from_haram}m from Haram</span>
          )}
        </div>

        {/* Description */}
        {hotel.description && (
          <p className="text-muted-foreground">{hotel.description}</p>
        )}

        {/* Facilities */}
        {hotel.facilities && hotel.facilities.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Facilities</h4>
            <div className="flex flex-wrap gap-2">
              {hotel.facilities.map((facility, index) => {
                const IconComponent = facilityIcons[facility.toLowerCase()] || null;
                return (
                  <span
                    key={index}
                    className="bg-muted px-3 py-1 rounded-full text-sm flex items-center gap-1"
                  >
                    {IconComponent && <IconComponent className="h-3 w-3" />}
                    {facility}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Contact */}
        {(hotel.contact_phone || hotel.contact_email) && (
          <div>
            <h4 className="font-semibold mb-2">Contact</h4>
            <div className="space-y-1">
              {hotel.contact_phone && (
                <p className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" /> {hotel.contact_phone}
                </p>
              )}
              {hotel.contact_email && (
                <p className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" /> {hotel.contact_email}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Map */}
        {hotel.google_map_embed_url && (
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              src={hotel.google_map_embed_url}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          {hotel.google_map_link && (
            <Button
              variant="outline"
              onClick={() => window.open(hotel.google_map_link!, '_blank')}
            >
              <MapPin className="h-4 w-4 mr-2" /> View on Map
            </Button>
          )}
          <Button onClick={onBookNow} className="flex-1">
            Book Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HotelDetailsModal;
