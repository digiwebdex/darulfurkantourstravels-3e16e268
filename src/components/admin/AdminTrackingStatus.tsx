import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { logAdminAction, AuditActionTypes } from "@/utils/auditLogger";
import { 
  FileText, 
  FileCheck, 
  Search, 
  CheckCircle, 
  Settings, 
  PackageCheck,
  Bell
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
  const [sendNotification, setSendNotification] = useState(true);
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

        // Log to audit trail
        const currentLabel = trackingStatusOptions.find(o => o.value === currentStatus)?.label;
        const newLabel = trackingStatusOptions.find(o => o.value === newStatus)?.label;
        
        await logAdminAction({
          actionType: AuditActionTypes.STATUS_CHANGE,
          actionDescription: `Tracking status changed from "${currentLabel}" to "${newLabel}"`,
          entityType: "booking",
          entityId: bookingId,
          bookingRef: bookingId.substring(0, 8).toUpperCase(),
          oldValue: { status: currentStatus },
          newValue: { status: newStatus, notes: notes || null },
        });

        // Send notification if enabled
        if (sendNotification) {
          try {
            const { error: notifError } = await supabase.functions.invoke('send-tracking-notification', {
              body: {
                bookingId,
                newStatus,
                notes: notes || undefined
              }
            });

            if (notifError) {
              console.error("Notification error:", notifError);
              toast({
                title: "Status Updated",
                description: "Status updated but notification failed to send.",
                variant: "default",
              });
            } else {
              toast({
                title: "Status Updated",
                description: "Customer has been notified of the status change.",
              });
            }
          } catch (notifErr) {
            console.error("Notification error:", notifErr);
          }
        } else {
          toast({
            title: "Status Updated",
            description: "The booking tracking status has been updated.",
          });
        }
      } else {
        toast({
          title: "Notes Updated",
          description: "Admin notes have been updated.",
        });
      }

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

          {newStatus !== currentStatus && (
            <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
              <Checkbox
                id="sendNotification"
                checked={sendNotification}
                onCheckedChange={(checked) => setSendNotification(checked as boolean)}
              />
              <Label 
                htmlFor="sendNotification" 
                className="text-sm font-normal cursor-pointer flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
                Send SMS/Email notification to customer
              </Label>
            </div>
          )}
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
