import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FinancialSummary {
  // Sales
  totalSales: number; // All confirmed/completed booking totals
  totalBookings: number;
  
  // Income
  incomeReceived: number; // Actual money collected (paid bookings + paid EMI installments + advance)
  
  // Receivables (Customer Due)
  customerDue: number; // totalSales - incomeReceived (for confirmed/completed only)
  overdueAmount: number; // EMI installments past due date
  
  // Expenses & Payables
  totalExpenses: number; // From accounting_entries (expense type)
  supplierDue: number; // From accounting_entries (supplier_payment pending)
  supplierCostEstimate: number; // Estimated from supplier_costs table
  
  // Commissions
  totalCommission: number; // From agents table
  pendingCommission: number;
  
  // Profit
  netProfit: number; // incomeReceived - totalExpenses - totalCommission
  grossProfit: number; // totalSales - supplierCostEstimate
  
  // Cash Balance
  cashBalance: number; // incomeReceived - totalExpenses - paid commissions
  
  // Payment breakdown
  paidBookings: number;
  partialBookings: number;
  pendingBookings: number;
  
  // Accounting entries
  totalDebits: number;
  totalCredits: number;
  
  // By type
  hajjRevenue: number;
  umrahRevenue: number;
  
  // Collection rate
  collectionRate: number;
}

export interface MonthlyFinancial {
  month: string;
  monthKey: string;
  revenue: number;
  received: number;
  expenses: number;
  bookings: number;
}

const defaultSummary: FinancialSummary = {
  totalSales: 0, totalBookings: 0,
  incomeReceived: 0, customerDue: 0, overdueAmount: 0,
  totalExpenses: 0, supplierDue: 0, supplierCostEstimate: 0,
  totalCommission: 0, pendingCommission: 0,
  netProfit: 0, grossProfit: 0, cashBalance: 0,
  paidBookings: 0, partialBookings: 0, pendingBookings: 0,
  totalDebits: 0, totalCredits: 0,
  hajjRevenue: 0, umrahRevenue: 0, collectionRate: 0,
};

export const useFinancialData = () => {
  const [summary, setSummary] = useState<FinancialSummary>(defaultSummary);
  const [monthlyData, setMonthlyData] = useState<MonthlyFinancial[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [
        bookingsRes,
        emiPaymentsRes,
        emiInstallmentsRes,
        accountingRes,
        agentsRes,
        supplierCostsRes,
      ] = await Promise.all([
        supabase.from("bookings").select("id, total_price, payment_status, status, created_at, passenger_count, package_id, packages(type)"),
        supabase.from("emi_payments").select("id, booking_id, total_amount, advance_amount, remaining_amount, paid_emis, number_of_emis"),
        supabase.from("emi_installments").select("id, emi_payment_id, amount, status, due_date"),
        supabase.from("accounting_entries").select("id, entry_type, amount, debit_account, credit_account, entry_date, created_at"),
        supabase.from("agents").select("total_commission, pending_commission"),
        supabase.from("supplier_costs").select("amount, per_person, package_id, is_active").eq("is_active", true),
      ]);

      const bookings = bookingsRes.data || [];
      const emiPayments = emiPaymentsRes.data || [];
      const emiInstallments = emiInstallmentsRes.data || [];
      const accountingEntries = accountingRes.data || [];
      const agents = agentsRes.data || [];
      const supplierCosts = supplierCostsRes.data || [];

      // ---- SALES ----
      const confirmedBookings = bookings.filter(
        (b) => b.status === "confirmed" || b.status === "completed"
      );
      const totalSales = confirmedBookings.reduce((s, b) => s + Number(b.total_price), 0);
      const totalBookings = confirmedBookings.length;

      // By type
      const hajjRevenue = confirmedBookings
        .filter((b) => (b.packages as any)?.type === "hajj")
        .reduce((s, b) => s + Number(b.total_price), 0);
      const umrahRevenue = confirmedBookings
        .filter((b) => (b.packages as any)?.type === "umrah")
        .reduce((s, b) => s + Number(b.total_price), 0);

      // ---- INCOME RECEIVED ----
      // Fully paid bookings
      const fullyPaidAmount = confirmedBookings
        .filter((b) => b.payment_status === "paid")
        .reduce((s, b) => s + Number(b.total_price), 0);

      // EMI: advance + paid installments
      const emiPaymentMap = new Map(emiPayments.map((e) => [e.id, e]));
      const paidEmiInstallments = emiInstallments.filter((i) => i.status === "paid");
      const emiAdvances = emiPayments.reduce((s, e) => s + Number(e.advance_amount), 0);
      const emiPaidInstallmentAmount = paidEmiInstallments.reduce((s, i) => s + Number(i.amount), 0);

      // For bookings with EMI, don't double-count with fully paid
      const emiBookingIds = new Set(emiPayments.map((e) => e.booking_id));
      const nonEmiFullyPaid = confirmedBookings
        .filter((b) => b.payment_status === "paid" && !emiBookingIds.has(b.id))
        .reduce((s, b) => s + Number(b.total_price), 0);

      const incomeReceived = nonEmiFullyPaid + emiAdvances + emiPaidInstallmentAmount;

      // ---- CUSTOMER DUE ----
      const customerDue = Math.max(0, totalSales - incomeReceived);

      // ---- OVERDUE ----
      const today = new Date();
      const overdueAmount = emiInstallments
        .filter((i) => i.status === "pending" && i.due_date && new Date(i.due_date) < today)
        .reduce((s, i) => s + Number(i.amount), 0);

      // ---- EXPENSES (from accounting_entries) ----
      const expenseEntries = accountingEntries.filter((e) => 
        e.entry_type === "expense" || e.entry_type === "supplier_payment"
      );
      const totalExpenses = expenseEntries.reduce((s, e) => s + Number(e.amount), 0);

      // Supplier due = estimated costs - paid supplier amounts
      const supplierPayments = accountingEntries
        .filter((e) => e.entry_type === "supplier_payment")
        .reduce((s, e) => s + Number(e.amount), 0);

      // Estimate supplier costs based on supplier_costs table and confirmed bookings
      let supplierCostEstimate = 0;
      confirmedBookings.forEach((b) => {
        const pkgCosts = supplierCosts.filter((sc) => sc.package_id === b.package_id);
        pkgCosts.forEach((sc) => {
          supplierCostEstimate += sc.per_person
            ? Number(sc.amount) * b.passenger_count
            : Number(sc.amount);
        });
      });

      const supplierDue = Math.max(0, supplierCostEstimate - supplierPayments);

      // ---- COMMISSIONS ----
      const totalCommission = agents.reduce((s, a) => s + Number(a.total_commission), 0);
      const pendingCommission = agents.reduce((s, a) => s + Number(a.pending_commission), 0);
      const paidCommission = totalCommission - pendingCommission;

      // ---- DOUBLE-ENTRY TOTALS ----
      const totalDebits = accountingEntries.reduce((s, e) => s + Number(e.amount), 0);
      // Credits equal debits in proper double-entry (same amount recorded on both sides)
      const totalCredits = totalDebits;

      // ---- PROFIT ----
      const netProfit = incomeReceived - totalExpenses - paidCommission;
      const grossProfit = totalSales - supplierCostEstimate;

      // ---- CASH BALANCE ----
      const cashBalance = incomeReceived - totalExpenses - paidCommission;

      // ---- PAYMENT BREAKDOWN ----
      const paidBookings = bookings.filter((b) => b.payment_status === "paid").length;
      const partialBookings = bookings.filter(
        (b) => b.payment_status === "partial" || b.payment_status === "emi_pending"
      ).length;
      const pendingBookings = bookings.filter(
        (b) => b.payment_status === "pending" || b.payment_status === "pending_cash" || b.payment_status === "pending_verification"
      ).length;

      const collectionRate = totalSales > 0 ? Math.round((incomeReceived / totalSales) * 100) : 0;

      setSummary({
        totalSales, totalBookings,
        incomeReceived, customerDue, overdueAmount,
        totalExpenses, supplierDue, supplierCostEstimate,
        totalCommission, pendingCommission,
        netProfit, grossProfit, cashBalance,
        paidBookings, partialBookings, pendingBookings,
        totalDebits, totalCredits,
        hajjRevenue, umrahRevenue, collectionRate,
      });

      // ---- MONTHLY DATA ----
      const monthMap = new Map<string, MonthlyFinancial>();
      confirmedBookings.forEach((b) => {
        const d = new Date(b.created_at);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        const existing = monthMap.get(key) || { month: label, monthKey: key, revenue: 0, received: 0, expenses: 0, bookings: 0 };
        existing.revenue += Number(b.total_price);
        if (b.payment_status === "paid") existing.received += Number(b.total_price);
        existing.bookings += 1;
        monthMap.set(key, existing);
      });

      accountingEntries.forEach((e) => {
        if (e.entry_type === "expense" || e.entry_type === "supplier_payment") {
          const d = new Date(e.entry_date || e.created_at);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
          const existing = monthMap.get(key) || { month: label, monthKey: key, revenue: 0, received: 0, expenses: 0, bookings: 0 };
          existing.expenses += Number(e.amount);
          monthMap.set(key, existing);
        }
      });

      const sorted = Array.from(monthMap.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
      setMonthlyData(sorted);

    } catch (err) {
      console.error("Error fetching financial data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { summary, monthlyData, loading, refresh: fetchAll };
};
