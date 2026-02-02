import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Phone, Mail, Calendar, Users, MessageSquare, Building2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface HotelBookingRequest {
  id: string;
  request_id: string;
  hotel_id: string | null;
  guest_name: string;
  guest_phone: string;
  guest_email: string | null;
  country_code: string | null;
  check_in_date: string;
  check_out_date: string;
  room_count: number | null;
  adult_count: number | null;
  child_count: number | null;
  special_requests: string | null;
  status: string | null;
  admin_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
  hotels?: {
    name: string;
    city: string;
    country: string | null;
    star_rating: number | null;
  } | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
  confirmed: "bg-green-500/20 text-green-600 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-600 border-red-500/30",
  completed: "bg-blue-500/20 text-blue-600 border-blue-500/30",
};

const AdminHotelBookings = () => {
  const [bookings, setBookings] = useState<HotelBookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<HotelBookingRequest | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("hotel_booking_requests")
      .select(`
        *,
        hotels (
          name,
          city,
          country,
          star_rating
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch hotel bookings");
      console.error(error);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  const handleViewDetails = (booking: HotelBookingRequest) => {
    setSelectedBooking(booking);
    setAdminNotes(booking.admin_notes || "");
    setNewStatus(booking.status || "pending");
    setDetailsOpen(true);
  };

  const handleUpdateBooking = async () => {
    if (!selectedBooking) return;

    const { error } = await supabase
      .from("hotel_booking_requests")
      .update({
        status: newStatus,
        admin_notes: adminNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selectedBooking.id);

    if (error) {
      toast.error("Failed to update booking");
    } else {
      toast.success("Booking updated successfully");
      setDetailsOpen(false);
      fetchBookings();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking request?")) return;

    const { error } = await supabase
      .from("hotel_booking_requests")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete booking");
    } else {
      toast.success("Booking deleted");
      fetchBookings();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Hotel Booking Requests</CardTitle>
              <CardDescription>
                Manage hotel booking inquiries from customers ({bookings.length} total)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No hotel booking requests yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Hotel</TableHead>
                    <TableHead>Check In/Out</TableHead>
                    <TableHead>Rooms</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono text-sm">
                        {booking.request_id}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.guest_name}</p>
                          <p className="text-sm text-muted-foreground">{booking.guest_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {booking.hotels ? (
                          <div>
                            <p className="font-medium">{booking.hotels.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking.hotels.city}, {booking.hotels.country}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{format(new Date(booking.check_in_date), "dd MMM yyyy")}</p>
                          <p className="text-muted-foreground">
                            to {format(new Date(booking.check_out_date), "dd MMM yyyy")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{booking.room_count || 1} room(s)</p>
                          <p className="text-muted-foreground">
                            {booking.adult_count || 1}A, {booking.child_count || 0}C
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[booking.status || "pending"]}>
                          {booking.status || "pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {booking.created_at && format(new Date(booking.created_at), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetails(booking)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Booking Details - {selectedBooking?.request_id}
            </DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              {/* Guest Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Guest Name</p>
                    <p className="font-medium">{selectedBooking.guest_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{selectedBooking.guest_phone}</p>
                  </div>
                </div>
                {selectedBooking.guest_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedBooking.guest_email}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Hotel & Stay Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Hotel</p>
                    <p className="font-medium">
                      {selectedBooking.hotels?.name || "N/A"}
                      {selectedBooking.hotels?.star_rating && ` (${selectedBooking.hotels.star_rating}⭐)`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Stay Dates</p>
                    <p className="font-medium">
                      {format(new Date(selectedBooking.check_in_date), "dd MMM")} - {format(new Date(selectedBooking.check_out_date), "dd MMM yyyy")}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rooms</p>
                  <p className="font-medium">{selectedBooking.room_count || 1} room(s)</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Guests</p>
                  <p className="font-medium">
                    {selectedBooking.adult_count || 1} Adults, {selectedBooking.child_count || 0} Children
                  </p>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.special_requests && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Special Requests</p>
                  </div>
                  <p className="text-sm">{selectedBooking.special_requests}</p>
                </div>
              )}

              {/* Status Update */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Update Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Admin Notes</label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this booking..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleUpdateBooking} className="flex-1">
                    Save Changes
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDelete(selectedBooking.id);
                      setDetailsOpen(false);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHotelBookings;
