import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface AuditLogEntry {
  actionType: string;
  actionDescription: string;
  entityType?: string;
  entityId?: string;
  oldValue?: Json;
  newValue?: Json;
  bookingRef?: string;
  metadata?: Json;
}

/**
 * Logs an administrative action to the audit log
 */
export const logAdminAction = async (entry: AuditLogEntry) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn("No authenticated user for audit log");
      return;
    }

    const { error } = await supabase
      .from("staff_activity_log")
      .insert([{
        user_id: user.id,
        action_type: entry.actionType,
        action_description: entry.actionDescription,
        entity_type: entry.entityType || null,
        entity_id: entry.entityId || null,
        old_value: entry.oldValue || null,
        new_value: entry.newValue || null,
        booking_ref: entry.bookingRef || null,
        metadata: entry.metadata || {},
      }]);

    if (error) {
      console.error("Failed to log admin action:", error);
    }
  } catch (err) {
    console.error("Audit log error:", err);
  }
};

/**
 * Pre-defined action types for consistency
 */
export const AuditActionTypes = {
  STATUS_CHANGE: "status_change",
  PAYMENT_UPDATE: "payment_update",
  BOOKING_CREATED: "booking_created",
  BOOKING_DELETED: "booking_deleted",
  BOOKING_UPDATED: "booking_updated",
  DOCUMENT_UPLOADED: "document_uploaded",
  DOCUMENT_DELETED: "document_deleted",
  PACKAGE_CREATED: "package_created",
  PACKAGE_UPDATED: "package_updated",
  PACKAGE_DELETED: "package_deleted",
  VISA_STATUS_CHANGE: "visa_status_change",
  EMI_PLAN_CREATED: "emi_plan_created",
  EMI_PAYMENT_RECORDED: "emi_payment_recorded",
  SETTINGS_CHANGED: "settings_changed",
  USER_LOGIN: "login",
  USER_LOGOUT: "logout",
  BACKUP_CREATED: "backup_created",
  BACKUP_RESTORED: "backup_restored",
  NOTIFICATION_SENT: "notification_sent",
  NOTIFICATION_RETRY: "notification_retry",
} as const;

export type AuditActionType = typeof AuditActionTypes[keyof typeof AuditActionTypes];
