import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { 
  TrendingUp, TrendingDown, Package, Users, Calendar, Clock, CheckCircle, 
  XCircle, AlertCircle, Wallet, DollarSign, ArrowDownLeft, ArrowUpRight,
  CreditCard, AlertTriangle, RefreshCw
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";
import { cn } from "@/lib/utils";
import { useFinancialData } from "@/hooks/useFinancialData";
import { Button } from "@/components/ui/button";

interface RecentActivity {
  id: string;
  type: 'booking';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

const COLORS = {
  pending: 'hsl(var(--chart-3))',
  confirmed: 'hsl(var(--chart-2))',
  completed: 'hsl(var(--chart-1))',
  cancelled: 'hsl(var(--chart-5))',
};

const AdminOverview = () => {
  const { summary, monthlyData, loading: financialLoading, refresh } = useFinancialData();
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<{ name: string; value: number; color: string }[]>([]);
  const [bookingTrends, setBookingTrends] = useState<{ date: string; bookings: number; revenue: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickStats, setQuickStats] = useState({
    todayBookings: 0, weekBookings: 0, pendingCount: 0,
    bookingChange: 0, revenueChange: 0, weekRevenue: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchBookingTrends(), fetchRecentActivities(), fetchStatusDistribution(), fetchQuickStats()]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingTrends = async () => {
    const endDate = new Date();
    const startDate = subDays(endDate, 30);
    const { data: bookings } = await supabase
      .from("bookings")
      .select("created_at, total_price, status")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString());

    if (bookings) {
      const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
      setBookingTrends(dateRange.map(date => {
        const dateStr = format(date, "yyyy-MM-dd");
        const dayBookings = bookings.filter(b => format(new Date(b.created_at), "yyyy-MM-dd") === dateStr);
        return {
          date: format(date, "MMM dd"),
          bookings: dayBookings.length,
          revenue: dayBookings
            .filter(b => b.status === "confirmed" || b.status === "completed")
            .reduce((sum, b) => sum + Number(b.total_price), 0),
        };
      }));
    }
  };

  const fetchRecentActivities = async () => {
    const { data: bookings } = await supabase
      .from("bookings")
      .select("id, created_at, status, guest_name, packages(title)")
      .order("created_at", { ascending: false })
      .limit(8);

    if (bookings) {
      setRecentActivities(bookings.map(b => ({
        id: b.id,
        type: 'booking' as const,
        title: `New booking: ${b.packages?.title || 'Package'}`,
        description: b.guest_name || 'Customer',
        timestamp: b.created_at,
        status: b.status,
      })));
    }
  };

  const fetchStatusDistribution = async () => {
    const { data: bookings } = await supabase.from("bookings").select("status");
    if (bookings) {
      setStatusDistribution([
        { name: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: COLORS.pending },
        { name: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, color: COLORS.confirmed },
        { name: 'Completed', value: bookings.filter(b => b.status === 'completed').length, color: COLORS.completed },
        { name: 'Cancelled', value: bookings.filter(b => b.status === 'cancelled').length, color: COLORS.cancelled },
      ].filter(item => item.value > 0));
    }
  };

  const fetchQuickStats = async () => {
    const today = startOfDay(new Date());
    const weekAgo = subDays(today, 7);
    const twoWeeksAgo = subDays(today, 14);
    const { data: allBookings } = await supabase
      .from("bookings")
      .select("created_at, total_price, status")
      .gte("created_at", twoWeeksAgo.toISOString());

    if (allBookings) {
      const todayBookings = allBookings.filter(b => new Date(b.created_at) >= today).length;
      const thisWeek = allBookings.filter(b => new Date(b.created_at) >= weekAgo);
      const lastWeek = allBookings.filter(b => new Date(b.created_at) >= twoWeeksAgo && new Date(b.created_at) < weekAgo);
      const thisWeekRev = thisWeek.filter(b => b.status === "confirmed" || b.status === "completed").reduce((s, b) => s + Number(b.total_price), 0);
      const lastWeekRev = lastWeek.filter(b => b.status === "confirmed" || b.status === "completed").reduce((s, b) => s + Number(b.total_price), 0);
      setQuickStats({
        todayBookings,
        weekBookings: thisWeek.length,
        weekRevenue: thisWeekRev,
        pendingCount: allBookings.filter(b => b.status === "pending").length,
        revenueChange: lastWeekRev > 0 ? ((thisWeekRev - lastWeekRev) / lastWeekRev) * 100 : 0,
        bookingChange: lastWeek.length > 0 ? ((thisWeek.length - lastWeek.length) / lastWeek.length) * 100 : 0,
      });
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const isLoading = loading || financialLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Summary - Primary KPIs */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Financial Overview</h2>
        <Button variant="ghost" size="sm" onClick={refresh} className="gap-1">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Sales</p>
                <p className="text-xl font-bold">{formatCurrency(summary.totalSales)}</p>
                <p className="text-xs text-muted-foreground">{summary.totalBookings} bookings</p>
              </div>
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Income Received</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(summary.incomeReceived)}</p>
                <p className="text-xs text-muted-foreground">{summary.collectionRate}% collected</p>
              </div>
              <ArrowDownLeft className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Customer Due</p>
                <p className="text-xl font-bold text-amber-600">{formatCurrency(summary.customerDue)}</p>
                {summary.overdueAmount > 0 && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {formatCurrency(summary.overdueAmount)} overdue
                  </p>
                )}
              </div>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Net Profit</p>
                <p className={cn("text-xl font-bold", summary.netProfit >= 0 ? "text-emerald-600" : "text-red-600")}>
                  {formatCurrency(summary.netProfit)}
                </p>
                <p className="text-xs text-muted-foreground">after expenses</p>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Financial KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Cash Balance</p>
            <p className="text-lg font-bold">{formatCurrency(summary.cashBalance)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total Expenses</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(summary.totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Supplier Due</p>
            <p className="text-lg font-bold text-orange-600">{formatCurrency(summary.supplierDue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Commission</p>
            <p className="text-lg font-bold">{formatCurrency(summary.totalCommission)}</p>
            {summary.pendingCommission > 0 && (
              <p className="text-xs text-muted-foreground">{formatCurrency(summary.pendingCommission)} pending</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Gross Profit</p>
            <p className={cn("text-lg font-bold", summary.grossProfit >= 0 ? "" : "text-red-600")}>
              {formatCurrency(summary.grossProfit)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Collection Rate */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Collection: {formatCurrency(summary.incomeReceived)} / {formatCurrency(summary.totalSales)}</span>
            <span className="font-bold">{summary.collectionRate}%</span>
          </div>
          <Progress value={summary.collectionRate} className="h-2" />
          <div className="grid grid-cols-3 gap-4 mt-3 text-center">
            <div>
              <p className="text-lg font-bold text-green-600">{summary.paidBookings}</p>
              <p className="text-xs text-muted-foreground">Fully Paid</p>
            </div>
            <div>
              <p className="text-lg font-bold text-blue-600">{summary.partialBookings}</p>
              <p className="text-xs text-muted-foreground">Partial/EMI</p>
            </div>
            <div>
              <p className="text-lg font-bold text-yellow-600">{summary.pendingBookings}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Double-Entry Balance Check */}
      {(summary.totalDebits > 0 || summary.totalCredits > 0) && (
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Accounting Entries</p>
                  <p className="text-sm">
                    Debits: <span className="font-bold">{formatCurrency(summary.totalDebits)}</span>
                    {' — '}
                    Credits: <span className="font-bold">{formatCurrency(summary.totalCredits)}</span>
                  </p>
                </div>
              </div>
              <Badge variant={summary.totalDebits === summary.totalCredits ? "default" : "destructive"}>
                {summary.totalDebits === summary.totalCredits ? "Balanced ✓" : "Imbalanced ✗"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Today's Bookings</p>
                <p className="text-2xl font-bold">{quickStats.todayBookings}</p>
              </div>
              <Calendar className="w-5 h-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">{quickStats.weekBookings}</p>
                {quickStats.bookingChange !== 0 && (
                  <div className={cn("flex items-center gap-1 text-xs mt-1", quickStats.bookingChange > 0 ? "text-green-600" : "text-red-600")}>
                    {quickStats.bookingChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(quickStats.bookingChange).toFixed(0)}%
                  </div>
                )}
              </div>
              <Package className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Week Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(quickStats.weekRevenue)}</p>
                {quickStats.revenueChange !== 0 && (
                  <div className={cn("flex items-center gap-1 text-xs mt-1", quickStats.revenueChange > 0 ? "text-green-600" : "text-red-600")}>
                    {quickStats.revenueChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(quickStats.revenueChange).toFixed(0)}%
                  </div>
                )}
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{quickStats.pendingCount}</p>
              </div>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Booking Trends (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={bookingTrends}>
                  <defs>
                    <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#colorBookings)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Revenue vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number, name: string) => [formatCurrency(value), name === 'revenue' ? 'Revenue' : name === 'received' ? 'Received' : 'Expenses']} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="revenue" />
                  <Bar dataKey="expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Booking Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {statusDistribution.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Receivable vs Payable */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receivable vs Payable</CardTitle>
            <CardDescription>Must always balance with transaction data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Accounts Receivable</span>
                <span className="font-bold text-amber-600">{formatCurrency(summary.customerDue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">↳ Overdue</span>
                <span className="font-bold text-red-600">{formatCurrency(summary.overdueAmount)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-sm">
                <span className="text-muted-foreground">Accounts Payable</span>
                <span className="font-bold text-orange-600">{formatCurrency(summary.supplierDue + summary.pendingCommission)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">↳ Supplier Due</span>
                <span>{formatCurrency(summary.supplierDue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">↳ Commission Due</span>
                <span>{formatCurrency(summary.pendingCommission)}</span>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Hajj Revenue</span>
                <span className="font-bold">{formatCurrency(summary.hajjRevenue)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="font-medium">Umrah Revenue</span>
                <span className="font-bold">{formatCurrency(summary.umrahRevenue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {recentActivities.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No recent activity</p>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg bg-muted/50">
                    <div className="mt-0.5">{getStatusIcon(activity.status)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge variant="outline" className="text-xs capitalize">{activity.status}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">{format(new Date(activity.timestamp), "MMM dd, HH:mm")}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
