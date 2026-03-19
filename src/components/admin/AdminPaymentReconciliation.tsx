import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useFinancialData } from "@/hooks/useFinancialData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, differenceInDays, isAfter } from "date-fns";
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Download,
  RefreshCw,
  DollarSign,
  Calendar,
  Users
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";

interface BookingPayment {
  id: string;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  total_price: number;
  payment_status: string;
  payment_method: string | null;
  status: string;
  tracking_status: string;
  created_at: string;
  package: {
    title: string;
    type: string;
  };
  emi_payment?: {
    total_amount: number;
    advance_amount: number;
    remaining_amount: number;
    paid_emis: number;
    number_of_emis: number;
    installments: Array<{
      id: string;
      installment_number: number;
      amount: number;
      status: string;
      due_date: string | null;
      paid_date: string | null;
    }>;
  };
  user?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  };
}

const AdminPaymentReconciliation = () => {
  const { summary: financialSummary } = useFinancialData();
  const [bookings, setBookings] = useState<BookingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [overdueOnly, setOverdueOnly] = useState(false);

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const fetchPaymentData = async () => {
    setLoading(true);
    try {
      // Fetch bookings with payment details
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select(`
          id,
          guest_name,
          guest_email,
          guest_phone,
          total_price,
          payment_status,
          payment_method,
          status,
          tracking_status,
          created_at,
          user_id,
          package:packages(title, type)
        `)
        .order("created_at", { ascending: false });

      if (bookingsError) throw bookingsError;

      // Fetch EMI payments with installments
      const { data: emiData, error: emiError } = await supabase
        .from("emi_payments")
        .select(`
          id,
          booking_id,
          total_amount,
          advance_amount,
          remaining_amount,
          paid_emis,
          number_of_emis,
          installments:emi_installments(
            id,
            installment_number,
            amount,
            status,
            due_date,
            paid_date
          )
        `);

      if (emiError) throw emiError;

      // Fetch user profiles for registered bookings
      const userIds = bookingsData?.filter(b => b.user_id).map(b => b.user_id) || [];
      let profiles: Record<string, { full_name: string | null; email: string | null; phone: string | null }> = {};
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from("profiles")
          .select("id, full_name, email, phone")
          .in("id", userIds);
        
        profilesData?.forEach(p => {
          profiles[p.id] = { full_name: p.full_name, email: p.email, phone: p.phone };
        });
      }

      // Combine data
      const combinedBookings = (bookingsData || []).map((booking: any) => {
        const emiPayment = emiData?.find(e => e.booking_id === booking.id);
        return {
          ...booking,
          emi_payment: emiPayment ? {
            ...emiPayment,
            installments: emiPayment.installments || []
          } : undefined,
          user: booking.user_id ? profiles[booking.user_id] : undefined
        };
      });

      setBookings(combinedBookings);
    } catch (error) {
      console.error("Error fetching payment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = (booking: BookingPayment) => {
    return booking.user?.full_name || booking.guest_name || "Unknown";
  };

  const getCustomerContact = (booking: BookingPayment) => {
    return booking.user?.phone || booking.guest_phone || booking.user?.email || booking.guest_email || "-";
  };

  const calculateAmountReceived = (booking: BookingPayment) => {
    if (booking.payment_status === "paid") {
      return booking.total_price;
    }
    if (booking.emi_payment) {
      const paidInstallments = booking.emi_payment.installments.filter(i => i.status === "paid");
      const paidAmount = paidInstallments.reduce((sum, i) => sum + i.amount, 0);
      return booking.emi_payment.advance_amount + paidAmount;
    }
    return 0;
  };

  const calculateAmountDue = (booking: BookingPayment) => {
    if (booking.payment_status === "paid") return 0;
    if (booking.emi_payment) {
      return booking.emi_payment.remaining_amount;
    }
    return booking.total_price;
  };

  const getOverdueAmount = (booking: BookingPayment) => {
    if (!booking.emi_payment) return 0;
    const today = new Date();
    const overdueInstallments = booking.emi_payment.installments.filter(
      i => i.status === "pending" && i.due_date && isAfter(today, new Date(i.due_date))
    );
    return overdueInstallments.reduce((sum, i) => sum + i.amount, 0);
  };

  const hasOverduePayments = (booking: BookingPayment) => {
    return getOverdueAmount(booking) > 0;
  };

  const getNextDueDate = (booking: BookingPayment) => {
    if (!booking.emi_payment) return null;
    const pendingInstallments = booking.emi_payment.installments
      .filter(i => i.status === "pending" && i.due_date)
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());
    return pendingInstallments[0]?.due_date || null;
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      getCustomerName(booking).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCustomerContact(booking).toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.payment_status === statusFilter;
    const matchesOverdue = !overdueOnly || hasOverduePayments(booking);
    
    return matchesSearch && matchesStatus && matchesOverdue;
  });

  // Calculate summary stats
  const stats = {
    totalExpected: bookings.reduce((sum, b) => sum + b.total_price, 0),
    totalReceived: bookings.reduce((sum, b) => sum + calculateAmountReceived(b), 0),
    totalDue: bookings.reduce((sum, b) => sum + calculateAmountDue(b), 0),
    totalOverdue: bookings.reduce((sum, b) => sum + getOverdueAmount(b), 0),
    paidBookings: bookings.filter(b => b.payment_status === "paid").length,
    partialBookings: bookings.filter(b => b.payment_status === "partial" || b.emi_payment).length,
    pendingBookings: bookings.filter(b => b.payment_status === "pending").length,
    overdueBookings: bookings.filter(b => hasOverduePayments(b)).length,
  };

  const collectionRate = stats.totalExpected > 0 
    ? Math.round((stats.totalReceived / stats.totalExpected) * 100) 
    : 0;

  const exportToExcel = () => {
    const exportData = filteredBookings.map(booking => ({
      "Booking ID": booking.id.substring(0, 8),
      "Customer": getCustomerName(booking),
      "Contact": getCustomerContact(booking),
      "Package": booking.package?.title || "-",
      "Total Amount": booking.total_price,
      "Received": calculateAmountReceived(booking),
      "Due": calculateAmountDue(booking),
      "Overdue": getOverdueAmount(booking),
      "Payment Status": booking.payment_status,
      "Payment Method": booking.payment_method || "-",
      "Booking Date": format(new Date(booking.created_at), "yyyy-MM-dd"),
      "Next Due Date": getNextDueDate(booking) ? format(new Date(getNextDueDate(booking)!), "yyyy-MM-dd") : "-",
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payment Reconciliation");
    XLSX.writeFile(wb, `payment-reconciliation-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
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
            <Wallet className="h-6 w-6" />
            Payment Reconciliation
          </h2>
          <p className="text-muted-foreground">
            Track expected vs received payments across all bookings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPaymentData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportToExcel} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Expected</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalExpected)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Received</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalReceived)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Due</p>
                  <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.totalDue)}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalOverdue)}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Collection Rate Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Collection Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Collected: {formatCurrency(stats.totalReceived)}</span>
              <span className="font-bold">{collectionRate}%</span>
            </div>
            <Progress value={collectionRate} className="h-3" />
            <div className="grid grid-cols-4 gap-4 mt-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.paidBookings}</p>
                <p className="text-xs text-muted-foreground">Fully Paid</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.partialBookings}</p>
                <p className="text-xs text-muted-foreground">Partial/EMI</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.overdueBookings}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Customer, phone, booking ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payment Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Fully Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="emi_pending">EMI Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                variant={overdueOnly ? "default" : "outline"}
                onClick={() => setOverdueOnly(!overdueOnly)}
                className="w-full gap-2"
              >
                <AlertTriangle className="h-4 w-4" />
                {overdueOnly ? "Showing Overdue Only" : "Show Overdue Only"}
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Total Results</Label>
              <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-muted/50">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{filteredBookings.length} bookings</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>
            Individual booking payment breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Customer</TableHead>
                  <TableHead className="whitespace-nowrap">Package</TableHead>
                  <TableHead className="whitespace-nowrap text-right">Expected</TableHead>
                  <TableHead className="whitespace-nowrap text-right">Received</TableHead>
                  <TableHead className="whitespace-nowrap text-right">Due</TableHead>
                  <TableHead className="whitespace-nowrap text-right">Overdue</TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Next Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => {
                    const received = calculateAmountReceived(booking);
                    const due = calculateAmountDue(booking);
                    const overdue = getOverdueAmount(booking);
                    const nextDue = getNextDueDate(booking);
                    const paymentProgress = booking.total_price > 0 
                      ? Math.round((received / booking.total_price) * 100) 
                      : 0;

                    return (
                      <TableRow key={booking.id} className={overdue > 0 ? "bg-red-50 dark:bg-red-950/20" : ""}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{getCustomerName(booking)}</p>
                            <p className="text-xs text-muted-foreground">{getCustomerContact(booking)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{booking.package?.title}</p>
                            <Badge variant="outline" className="text-xs">
                              {booking.package?.type}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(booking.total_price)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="space-y-1">
                            <p className="font-medium text-green-600">{formatCurrency(received)}</p>
                            <Progress value={paymentProgress} className="h-1.5 w-16 ml-auto" />
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-yellow-600">
                          {formatCurrency(due)}
                        </TableCell>
                        <TableCell className="text-right">
                          {overdue > 0 ? (
                            <span className="font-medium text-red-600">{formatCurrency(overdue)}</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {booking.payment_status === "paid" ? (
                            <Badge className="bg-green-100 text-green-800 gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Paid
                            </Badge>
                          ) : booking.emi_payment ? (
                            <Badge className="bg-blue-100 text-blue-800 gap-1">
                              <Calendar className="h-3 w-3" />
                              {booking.emi_payment.paid_emis}/{booking.emi_payment.number_of_emis} EMI
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800 gap-1">
                              <Clock className="h-3 w-3" />
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {nextDue ? (
                            <div className="text-sm">
                              {format(new Date(nextDue), "MMM dd")}
                              {differenceInDays(new Date(nextDue), new Date()) < 0 && (
                                <Badge variant="destructive" className="ml-1 text-xs">
                                  Overdue
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPaymentReconciliation;
