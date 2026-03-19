import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
import { DollarSign, TrendingUp, Users, Target, Calculator, PieChart, BarChart3 } from "lucide-react";
import { format, subMonths, startOfMonth } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, Legend, LineChart, Line,
} from "recharts";
import { useFinancialData } from "@/hooks/useFinancialData";

interface PackageRevenue {
  name: string;
  revenue: number;
  count: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const AdminFinancialAnalytics = () => {
  const { toast } = useToast();
  const { summary, monthlyData, loading: financialLoading } = useFinancialData();
  const [dateRange, setDateRange] = useState("6");
  const [costPerLead, setCostPerLead] = useState(50);
  const [packageRevenue, setPackageRevenue] = useState<PackageRevenue[]>([]);
  const [filteredMonthly, setFilteredMonthly] = useState<typeof monthlyData>([]);
  const [leadStats, setLeadStats] = useState({ totalLeads: 0, convertedLeads: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeadData();
  }, [dateRange, costPerLead]);

  useEffect(() => {
    // Filter monthly data by date range
    const months = parseInt(dateRange);
    const cutoff = format(startOfMonth(subMonths(new Date(), months - 1)), "yyyy-MM");
    setFilteredMonthly(monthlyData.filter(m => m.monthKey >= cutoff));
  }, [monthlyData, dateRange]);

  const fetchLeadData = async () => {
    setLoading(true);
    const months = parseInt(dateRange);
    const startDate = format(startOfMonth(subMonths(new Date(), months - 1)), "yyyy-MM-dd");

    const [{ data: bookings }, { data: leads }] = await Promise.all([
      supabase.from("bookings").select("id, total_price, created_at, package:packages(title)")
        .gte("created_at", startDate).in("status", ["confirmed", "completed"]),
      supabase.from("leads").select("id, lead_status").gte("created_at", startDate),
    ]);

    if (leads) {
      setLeadStats({
        totalLeads: leads.length,
        convertedLeads: leads.filter(l => l.lead_status === "Converted").length,
      });
    }

    if (bookings) {
      const pkgMap: Record<string, PackageRevenue> = {};
      bookings.forEach(b => {
        const name = (b.package as any)?.title || "Unknown";
        if (!pkgMap[name]) pkgMap[name] = { name, revenue: 0, count: 0 };
        pkgMap[name].revenue += Number(b.total_price);
        pkgMap[name].count += 1;
      });
      setPackageRevenue(Object.values(pkgMap).sort((a, b) => b.revenue - a.revenue));
    }

    setLoading(false);
  };

  const conversionRate = leadStats.totalLeads > 0 ? (leadStats.convertedLeads / leadStats.totalLeads) * 100 : 0;
  const totalAdSpend = leadStats.totalLeads * costPerLead;
  const costPerConversion = leadStats.convertedLeads > 0 ? totalAdSpend / leadStats.convertedLeads : 0;
  const roi = totalAdSpend > 0 ? ((summary.totalSales - totalAdSpend) / totalAdSpend) * 100 : 0;
  const avgBookingValue = summary.totalBookings > 0 ? summary.totalSales / summary.totalBookings : 0;

  const saveCostPerLead = async () => {
    const { error } = await supabase.from("site_settings").upsert(
      { setting_key: "cost_per_lead", setting_value: { value: costPerLead }, category: "marketing" },
      { onConflict: "setting_key" }
    );
    toast(error ? { title: "Error", description: error.message, variant: "destructive" as const } : { title: "Saved", description: "Cost per lead updated" });
  };

  if (loading || financialLoading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-2">
          <Label>Time Range</Label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Last 3 months</SelectItem>
              <SelectItem value="6">Last 6 months</SelectItem>
              <SelectItem value="12">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Cost Per Lead (BDT)</Label>
          <div className="flex gap-2">
            <Input type="number" value={costPerLead} onChange={(e) => setCostPerLead(parseFloat(e.target.value) || 0)} className="w-32" />
            <Button variant="outline" onClick={saveCostPerLead}>Save</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg"><DollarSign className="w-5 h-5 text-green-500" /></div>
            <div><p className="text-sm text-muted-foreground">Total Sales</p><p className="text-2xl font-bold">{formatCurrency(summary.totalSales)}</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg"><Users className="w-5 h-5 text-blue-500" /></div>
            <div><p className="text-sm text-muted-foreground">Total Bookings</p><p className="text-2xl font-bold">{summary.totalBookings}</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg"><Target className="w-5 h-5 text-purple-500" /></div>
            <div><p className="text-sm text-muted-foreground">Conversion Rate</p><p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p></div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg"><TrendingUp className="w-5 h-5 text-primary" /></div>
            <div><p className="text-sm text-muted-foreground">ROI</p><p className={`text-2xl font-bold ${roi >= 0 ? "text-green-600" : "text-red-600"}`}>{roi.toFixed(0)}%</p></div>
          </div>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Total Leads</p><p className="text-xl font-bold">{leadStats.totalLeads}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Converted Leads</p><p className="text-xl font-bold">{leadStats.convertedLeads}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Cost Per Conversion</p><p className="text-xl font-bold">{formatCurrency(costPerConversion)}</p></CardContent></Card>
        <Card><CardContent className="pt-4"><p className="text-sm text-muted-foreground">Avg Booking Value</p><p className="text-xl font-bold">{formatCurrency(avgBookingValue)}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" />Monthly Revenue</CardTitle></CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredMonthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), "Revenue"]} />
                  <Bar dataKey="revenue" fill="#0088FE" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><PieChart className="w-5 h-5" />Revenue by Package</CardTitle></CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie data={packageRevenue} cx="50%" cy="50%" labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100} dataKey="revenue">
                    {packageRevenue.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" />Bookings Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredMonthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="bookings" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Revenue by Package</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {packageRevenue.map((pkg, i) => (
              <div key={pkg.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{pkg.name}</span>
                    <span className="text-muted-foreground">{pkg.count} bookings</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <div className="w-full bg-muted rounded-full h-2 mr-4">
                      <div className="h-2 rounded-full" style={{ width: `${summary.totalSales > 0 ? (pkg.revenue / summary.totalSales) * 100 : 0}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                    <span className="font-medium whitespace-nowrap">{formatCurrency(pkg.revenue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFinancialAnalytics;
