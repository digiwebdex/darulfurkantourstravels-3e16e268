import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { TrendingUp, Package, Wallet, FileText, FileSpreadsheet } from "lucide-react";
import { formatCurrency, CURRENCY } from "@/lib/currency";
import { useToast } from "@/hooks/use-toast";
import { useFinancialData } from "@/hooks/useFinancialData";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import * as XLSX from "xlsx";

interface PackageRevenue {
  name: string;
  revenue: number;
  bookings: number;
  type: string;
}

const COLORS = ["#006D5B", "#D4AF37", "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B"];

const AdminRevenue = () => {
  const { toast } = useToast();
  const { summary, monthlyData, loading } = useFinancialData();
  const [packageRevenue, setPackageRevenue] = useState<PackageRevenue[]>([]);
  const [pkgLoading, setPkgLoading] = useState(true);

  useEffect(() => {
    fetchPackageRevenue();
  }, []);

  const fetchPackageRevenue = async () => {
    const { data: bookings } = await supabase
      .from("bookings")
      .select("total_price, created_at, status, packages(title, type)")
      .in("status", ["confirmed", "completed"]);

    if (bookings) {
      const packageMap = new Map<string, { revenue: number; bookings: number; type: string }>();
      bookings.forEach((b) => {
        const title = (b.packages as any)?.title || "Unknown";
        const type = (b.packages as any)?.type || "unknown";
        const existing = packageMap.get(title) || { revenue: 0, bookings: 0, type };
        packageMap.set(title, {
          revenue: existing.revenue + Number(b.total_price),
          bookings: existing.bookings + 1,
          type,
        });
      });
      setPackageRevenue(
        Array.from(packageMap.entries())
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
      );
    }
    setPkgLoading(false);
  };

  const exportToCSV = () => {
    if (packageRevenue.length === 0) return;
    const headers = ["Package", "Type", "Bookings", "Revenue", "% of Total"];
    const csvData = packageRevenue.map((pkg) => [
      pkg.name, pkg.type, pkg.bookings, pkg.revenue,
      summary.totalSales > 0 ? ((pkg.revenue / summary.totalSales) * 100).toFixed(1) + "%" : "0%"
    ]);
    const csvContent = [headers.map(h => `"${h}"`).join(","), ...csvData.map(row => row.map(cell => `"${String(cell)}"`).join(","))].join("\r\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `revenue-report-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Export Successful", description: "CSV downloaded" });
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const summaryData = [
      ["Revenue Report"], ["Generated:", new Date().toLocaleDateString()], [],
      ["Summary"],
      ["Total Sales", summary.totalSales],
      ["Income Received", summary.incomeReceived],
      ["Customer Due", summary.customerDue],
      ["Total Expenses", summary.totalExpenses],
      ["Net Profit", summary.netProfit],
      ["Hajj Revenue", summary.hajjRevenue],
      ["Umrah Revenue", summary.umrahRevenue],
    ];
    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    ws["!cols"] = [{ wch: 20 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws, "Summary");

    if (monthlyData.length > 0) {
      const mSheet = [["Month", "Revenue", "Received", "Expenses", "Bookings"], ...monthlyData.map(m => [m.month, m.revenue, m.received, m.expenses, m.bookings])];
      const mWs = XLSX.utils.aoa_to_sheet(mSheet);
      XLSX.utils.book_append_sheet(wb, mWs, "Monthly");
    }

    if (packageRevenue.length > 0) {
      const pSheet = [["Package", "Type", "Bookings", "Revenue"], ...packageRevenue.map(p => [p.name, p.type, p.bookings, p.revenue])];
      const pWs = XLSX.utils.aoa_to_sheet(pSheet);
      XLSX.utils.book_append_sheet(wb, pWs, "Packages");
    }

    XLSX.writeFile(wb, `revenue-report-${new Date().toISOString().split("T")[0]}.xlsx`);
    toast({ title: "Export Successful", description: "Excel downloaded" });
  };

  if (loading || pkgLoading) {
    return <Card><CardContent className="py-10 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" /></CardContent></Card>;
  }

  const pieData = [
    { name: "Hajj", value: summary.hajjRevenue },
    { name: "Umrah", value: summary.umrahRevenue },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={exportToCSV} disabled={packageRevenue.length === 0} className="gap-2" size="sm">
          <FileText className="w-4 h-4" /> CSV
        </Button>
        <Button variant="outline" onClick={exportToExcel} disabled={packageRevenue.length === 0 && monthlyData.length === 0} className="gap-2" size="sm">
          <FileSpreadsheet className="w-4 h-4" /> Excel
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(summary.totalSales)}</p>
                  <p className="text-xs text-muted-foreground mt-1">Received: {formatCurrency(summary.incomeReceived)}</p>
                </div>
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed Bookings</p>
                  <p className="text-3xl font-bold">{summary.totalBookings}</p>
                </div>
                <Package className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                  <p className="text-3xl font-bold">{formatCurrency(summary.netProfit)}</p>
                </div>
                <TrendingUp className="w-6 h-6 text-secondary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Revenue trend over time</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `${CURRENCY.symbol}${v / 1000}k`} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">No revenue data yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Package Type</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((entry, i) => <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue by Package</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Package</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packageRevenue.map((pkg) => (
                <TableRow key={pkg.name}>
                  <TableCell className="font-medium">{pkg.name}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{pkg.type}</Badge></TableCell>
                  <TableCell>{pkg.bookings}</TableCell>
                  <TableCell className="font-bold">{formatCurrency(pkg.revenue)}</TableCell>
                  <TableCell>{summary.totalSales > 0 ? ((pkg.revenue / summary.totalSales) * 100).toFixed(1) : 0}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {packageRevenue.length === 0 && <div className="text-center py-10 text-muted-foreground">No revenue data yet</div>}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRevenue;
