import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  FileText, 
  FileCheck, 
  Search, 
  CheckCircle, 
  Settings, 
  PackageCheck 
} from "lucide-react";

type TrackingStatus = 'order_submitted' | 'documents_received' | 'under_review' | 'approved' | 'processing' | 'completed';

interface AdminTrackingStatusProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  currentStatus: TrackingStatus;
  onUpdate: () => void;
}

const trackingStatusOptions: { value: TrackingStatus; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'order_submitted', label: 'Order Submitted', icon: FileText },
  { value: 'documents_received', label: 'Documents Received', icon: FileCheck },
  { value: 'under_review', label: 'Under Review', icon: Search },
  { value: 'approved', label: 'Approved', icon: CheckCircle },
  { value: 'processing', label: 'Processing', icon: Settings },
  { value: 'completed', label: 'Completed', icon: PackageCheck },
];

const AdminTrackingStatus = ({ 
  isOpen, 
  onClose, 
  bookingId, 
  currentStatus, 
  onUpdate 
}: AdminTrackingStatusProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newStatus, setNewStatus] = useState<TrackingStatus>(currentStatus);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (newStatus === currentStatus && !notes) {
      onClose();
      return;
    }

    setSaving(true);

    try {
      // Update booking tracking status
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ 
          tracking_status: newStatus,
          admin_notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq("id", bookingId);

      if (updateError) throw updateError;

      // Insert status history record
      if (newStatus !== currentStatus) {
        const { error: historyError } = await supabase
          .from("booking_status_history")
          .insert({
            booking_id: bookingId,
            previous_status: currentStatus,
            new_status: newStatus,
            notes: notes || null,
            changed_by: user?.id
          });

        if (historyError) throw historyError;
      }

      toast({
        title: "Status Updated",
        description: "The booking tracking status has been updated successfully.",
      });

      onUpdate();
      onClose();
      setNotes("");
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update tracking status.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Tracking Status</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Status</Label>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              {(() => {
                const current = trackingStatusOptions.find(o => o.value === currentStatus);
                const Icon = current?.icon || FileText;
                return (
                  <>
                    <Icon className="w-4 h-4" />
                    <span>{current?.label}</span>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newStatus">New Status</Label>
            <Select 
              value={newStatus} 
              onValueChange={(value) => setNewStatus(value as TrackingStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {trackingStatusOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes / Remarks (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes or remarks for this status update..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminTrackingStatus;
