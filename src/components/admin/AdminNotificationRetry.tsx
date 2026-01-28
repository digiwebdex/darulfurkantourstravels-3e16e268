import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { format } from "date-fns";
import { 
  Bell, 
  RefreshCw, 
  Search, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  MessageSquare,
  Send,
  Eye,
  RotateCw,
  Trash2
} from "lucide-react";
import { motion } from "framer-motion";

interface NotificationLog {
  id: string;
  booking_id: string | null;
  notification_type: string;
  recipient: string;
  status: string;
  error_message: string | null;
  retry_count: number;
  last_retry_at: string | null;
  message_content: string | null;
  booking_type: string;
  created_at: string;
}

const AdminNotificationRetry = () => {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("failed");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);
  const [manualMessage, setManualMessage] = useState("");
  const [showManualSend, setShowManualSend] = useState(false);
  const [selectedForManual, setSelectedForManual] = useState<NotificationLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [statusFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("notification_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs((data || []) as NotificationLog[]);
    } catch (error) {
      console.error("Error fetching notification logs:", error);
      toast.error("Failed to load notification logs");
    } finally {
      setLoading(false);
    }
  };

  const retryNotification = async (log: NotificationLog) => {
    setRetrying(log.id);
    
    try {
      // Determine which edge function to call based on notification type
      let functionName = "send-booking-notification";
      const body: Record<string, unknown> = {
        bookingId: log.booking_id,
        retry: true,
      };

      if (log.notification_type.includes("tracking") || log.notification_type.includes("status")) {
        functionName = "send-tracking-notification";
      } else if (log.notification_type.includes("emi") || log.notification_type.includes("installment")) {
        functionName = "send-emi-notification";
        body.notificationType = log.notification_type.includes("reminder") ? "payment_due" : "payment_recorded";
      } else if (log.notification_type.includes("visa")) {
        functionName = "send-visa-notification";
      }

      const { error } = await supabase.functions.invoke(functionName, { body });

      if (error) throw error;

      // Update retry count
      await supabase
        .from("notification_logs")
        .update({
          retry_count: (log.retry_count || 0) + 1,
          last_retry_at: new Date().toISOString(),
        })
        .eq("id", log.id);

      toast.success("Notification retry initiated");
      fetchLogs();
    } catch (error) {
      console.error("Retry error:", error);
      toast.error("Failed to retry notification");
    } finally {
      setRetrying(null);
    }
  };

  const sendManualNotification = async () => {
    if (!selectedForManual || !manualMessage.trim()) return;
    
    setRetrying(selectedForManual.id);
    
    try {
      // Determine notification channel
      const isSMS = selectedForManual.notification_type.includes("sms");
      const isEmail = selectedForManual.notification_type.includes("email");

      if (isSMS) {
        // Get SMS settings
        const { data: smsSettings } = await supabase
          .from("notification_settings")
          .select("*")
          .eq("setting_type", "sms")
          .single();

        if (!smsSettings?.is_enabled) {
          throw new Error("SMS notifications are disabled");
        }

        const config = smsSettings.config as { api_url: string; api_key: string; sender_id: string };
        
        // Format phone number
        let phone = selectedForManual.recipient;
        if (phone.startsWith("0")) {
          phone = "88" + phone;
        } else if (!phone.startsWith("88")) {
          phone = "88" + phone;
        }

        // Send SMS
        const smsUrl = `${config.api_url}?api_key=${config.api_key}&senderid=${config.sender_id}&number=${phone}&message=${encodeURIComponent(manualMessage)}`;
        const response = await fetch(smsUrl);
        
        if (!response.ok) {
          throw new Error("SMS API error");
        }
      }

      // Log the manual send
      await supabase.from("notification_logs").insert({
        booking_id: selectedForManual.booking_id,
        notification_type: `manual_${selectedForManual.notification_type}`,
        recipient: selectedForManual.recipient,
        status: "sent",
        message_content: manualMessage,
      });

      toast.success("Manual notification sent successfully");
      setShowManualSend(false);
      setManualMessage("");
      setSelectedForManual(null);
      fetchLogs();
    } catch (error) {
      console.error("Manual send error:", error);
      toast.error("Failed to send manual notification");
    } finally {
      setRetrying(null);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.notification_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.booking_id?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || log.notification_type.includes(typeFilter);
    
    return matchesSearch && matchesType;
  });

  const stats = {
    total: logs.length,
    sent: logs.filter(l => l.status === "sent").length,
    failed: logs.filter(l => l.status === "failed").length,
    pending: logs.filter(l => l.status === "pending").length,
    retried: logs.filter(l => (l.retry_count || 0) > 0).length,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-green-100 text-green-800 gap-1"><CheckCircle className="h-3 w-3" />Sent</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800 gap-1"><XCircle className="h-3 w-3" />Failed</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 gap-1"><Clock className="h-3 w-3" />Pending</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    if (type.includes("sms")) return <MessageSquare className="h-4 w-4" />;
    if (type.includes("email")) return <Mail className="h-4 w-4" />;
    return <Bell className="h-4 w-4" />;
  };

  const formatNotificationType = (type: string) => {
    return type
      .replace(/_/g, " ")
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace("Sms", "SMS")
      .replace("Email", "Email");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Notification Management
          </h2>
          <p className="text-muted-foreground">
            Monitor and retry failed SMS/Email notifications
          </p>
        </div>
        <Button variant="outline" onClick={fetchLogs} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.sent}</p>
                <p className="text-xs text-muted-foreground">Sent</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.retried}</p>
                <p className="text-xs text-muted-foreground">Retried</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Recipient, type, booking ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="sms">SMS Only</SelectItem>
                  <SelectItem value="email">Email Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/50">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{filteredLogs.length} notifications</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Failed Notifications Alert */}
      {stats.failed > 0 && statusFilter !== "sent" && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">
                  {stats.failed} notifications failed to send
                </p>
                <p className="text-sm text-red-600 dark:text-red-300">
                  You can retry failed notifications or send them manually
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Logs</CardTitle>
          <CardDescription>
            View and manage notification delivery status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Date/Time</TableHead>
                  <TableHead className="whitespace-nowrap">Type</TableHead>
                  <TableHead className="whitespace-nowrap">Recipient</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Retries</TableHead>
                  <TableHead className="whitespace-nowrap">Error</TableHead>
                  <TableHead className="whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No notifications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id} className={log.status === "failed" ? "bg-red-50/50 dark:bg-red-950/10" : ""}>
                      <TableCell className="whitespace-nowrap">
                        <div>
                          <p className="font-medium text-sm">
                            {format(new Date(log.created_at), "MMM dd, yyyy")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(log.created_at), "hh:mm a")}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(log.notification_type)}
                          <span className="text-sm">{formatNotificationType(log.notification_type)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-mono text-sm">{log.recipient}</p>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(log.status)}
                      </TableCell>
                      <TableCell>
                        {(log.retry_count || 0) > 0 ? (
                          <Badge variant="outline" className="gap-1">
                            <RotateCw className="h-3 w-3" />
                            {log.retry_count}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        {log.error_message ? (
                          <p className="text-xs text-red-600 truncate" title={log.error_message}>
                            {log.error_message}
                          </p>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {log.status === "failed" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => retryNotification(log)}
                                disabled={retrying === log.id}
                              >
                                {retrying === log.id ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <RotateCw className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedForManual(log);
                                  setShowManualSend(true);
                                }}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Notification Details</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Date/Time</Label>
                  <p className="font-medium">
                    {format(new Date(selectedLog.created_at), "PPpp")}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="font-medium">{formatNotificationType(selectedLog.notification_type)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Recipient</Label>
                  <p className="font-mono text-sm">{selectedLog.recipient}</p>
                </div>
              </div>

              {selectedLog.booking_id && (
                <div>
                  <Label className="text-muted-foreground">Booking ID</Label>
                  <Badge variant="outline" className="mt-1">{selectedLog.booking_id.substring(0, 8)}</Badge>
                </div>
              )}

              {selectedLog.error_message && (
                <div>
                  <Label className="text-muted-foreground">Error Message</Label>
                  <p className="text-sm text-red-600 p-2 bg-red-50 rounded mt-1">
                    {selectedLog.error_message}
                  </p>
                </div>
              )}

              {selectedLog.message_content && (
                <div>
                  <Label className="text-muted-foreground">Message Content</Label>
                  <ScrollArea className="h-24 rounded-md border p-2 mt-1">
                    <p className="text-sm whitespace-pre-wrap">{selectedLog.message_content}</p>
                  </ScrollArea>
                </div>
              )}

              {(selectedLog.retry_count || 0) > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Retry Count</Label>
                    <p className="font-medium">{selectedLog.retry_count}</p>
                  </div>
                  {selectedLog.last_retry_at && (
                    <div>
                      <Label className="text-muted-foreground">Last Retry</Label>
                      <p className="font-medium">
                        {format(new Date(selectedLog.last_retry_at), "PPpp")}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manual Send Dialog */}
      <Dialog open={showManualSend} onOpenChange={setShowManualSend}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Manual Notification</DialogTitle>
            <DialogDescription>
              Compose and send a custom message to the recipient
            </DialogDescription>
          </DialogHeader>
          {selectedForManual && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Recipient</Label>
                <p className="font-mono">{selectedForManual.recipient}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your message..."
                  value={manualMessage}
                  onChange={(e) => setManualMessage(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {manualMessage.length}/160 characters (SMS limit)
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManualSend(false)}>
              Cancel
            </Button>
            <Button 
              onClick={sendManualNotification}
              disabled={!manualMessage.trim() || retrying === selectedForManual?.id}
              className="gap-2"
            >
              {retrying === selectedForManual?.id ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNotificationRetry;
