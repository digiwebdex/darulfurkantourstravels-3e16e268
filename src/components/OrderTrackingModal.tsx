import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/currency";
import { 
  FileText, 
  FileCheck, 
  Search, 
  CheckCircle, 
  Settings, 
  PackageCheck,
  Calendar,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

type TrackingStatus = 'order_submitted' | 'documents_received' | 'under_review' | 'approved' | 'processing' | 'completed';

interface StatusHistory {
  id: string;
  previous_status: TrackingStatus | null;
  new_status: TrackingStatus;
  notes: string | null;
  created_at: string;
}

interface Booking {
  id: string;
  tracking_status: TrackingStatus;
  admin_notes: string | null;
  total_price: number;
  passenger_count: number;
  travel_date: string | null;
  created_at: string;
  packages: {
    title: string;
    type: string;
    duration_days: number;
  };
}

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
}

const trackingSteps: { status: TrackingStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { status: 'order_submitted', label: 'Order Submitted', icon: FileText },
  { status: 'documents_received', label: 'Documents Received', icon: FileCheck },
  { status: 'under_review', label: 'Under Review', icon: Search },
  { status: 'approved', label: 'Approved', icon: CheckCircle },
  { status: 'processing', label: 'Processing', icon: Settings },
  { status: 'completed', label: 'Completed', icon: PackageCheck },
];

const getStatusIndex = (status: TrackingStatus): number => {
  return trackingSteps.findIndex(step => step.status === status);
};

const OrderTrackingModal = ({ isOpen, onClose, booking }: OrderTrackingModalProps) => {
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && booking) {
      fetchStatusHistory();
      subscribeToUpdates();
    }
  }, [isOpen, booking?.id]);

  const fetchStatusHistory = async () => {
    if (!booking) return;
    setLoading(true);
    
    const { data } = await supabase
      .from("booking_status_history")
      .select("*")
      .eq("booking_id", booking.id)
      .order("created_at", { ascending: false });

    if (data) {
      setStatusHistory(data as StatusHistory[]);
    }
    setLoading(false);
  };

  const subscribeToUpdates = () => {
    if (!booking) return;

    const channel = supabase
      .channel(`booking-${booking.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${booking.id}`,
        },
        () => {
          fetchStatusHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (!booking) return null;

  const currentIndex = getStatusIndex(booking.tracking_status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Order Tracking</DialogTitle>
        </DialogHeader>

        {/* Package Info */}
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{booking.packages.title}</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {booking.packages.type} Package • {booking.packages.duration_days} Days
                </p>
              </div>
              <Badge variant="outline" className="text-primary">
                {booking.id.slice(0, 8).toUpperCase()}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>
                  {booking.travel_date 
                    ? new Date(booking.travel_date).toLocaleDateString()
                    : "TBD"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Passengers:</span> {booking.passenger_count}
              </div>
              <div className="text-right">
                <span className="font-bold text-primary">{formatCurrency(booking.total_price)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Tracker */}
        <div className="py-6">
          <h4 className="font-semibold mb-6">Order Progress</h4>
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
            <div 
              className="absolute left-6 top-0 w-0.5 bg-primary transition-all duration-500"
              style={{ 
                height: `${Math.min((currentIndex / (trackingSteps.length - 1)) * 100, 100)}%` 
              }}
            />

            {/* Steps */}
            <div className="space-y-6">
              {trackingSteps.map((step, index) => {
                const isCompleted = index <= currentIndex;
                const isCurrent = index === currentIndex;
                const Icon = step.icon;

                return (
                  <div key={step.status} className="relative flex items-start gap-4">
                    <div
                      className={cn(
                        "relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                        isCompleted
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                        isCurrent && "ring-4 ring-primary/20"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 pt-2">
                      <p className={cn(
                        "font-medium",
                        isCompleted ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {step.label}
                      </p>
                      {isCurrent && booking.admin_notes && (
                        <p className="text-sm text-muted-foreground mt-1 bg-muted/50 p-2 rounded">
                          {booking.admin_notes}
                        </p>
                      )}
                    </div>
                    {isCompleted && (
                      <CheckCircle className="w-5 h-5 text-primary mt-3" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Status History */}
        {statusHistory.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Status History
            </h4>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {statusHistory.map((history) => (
                <div key={history.id} className="flex items-start gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1">
                    <p className="font-medium">
                      {trackingSteps.find(s => s.status === history.new_status)?.label}
                    </p>
                    {history.notes && (
                      <p className="text-muted-foreground">{history.notes}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(history.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderTrackingModal;
