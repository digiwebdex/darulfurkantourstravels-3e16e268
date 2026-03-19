
-- Create accounting_entries table for double-entry bookkeeping
CREATE TABLE public.accounting_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_type TEXT NOT NULL CHECK (entry_type IN ('income', 'expense', 'supplier_payment', 'commission', 'refund', 'adjustment')),
  description TEXT NOT NULL,
  debit_account TEXT NOT NULL,
  credit_account TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  reference_number TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.accounting_entries ENABLE ROW LEVEL SECURITY;

-- Only admins can manage accounting entries
CREATE POLICY "Admins can manage accounting entries"
ON public.accounting_entries FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Staff can view accounting entries
CREATE POLICY "Staff can view accounting entries"
ON public.accounting_entries FOR SELECT
USING (public.is_staff(auth.uid()));

-- Add updated_at trigger
CREATE TRIGGER update_accounting_entries_updated_at
  BEFORE UPDATE ON public.accounting_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create supplier_costs table
CREATE TABLE public.supplier_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_name TEXT NOT NULL,
  cost_type TEXT NOT NULL CHECK (cost_type IN ('hotel', 'flight', 'transport', 'visa', 'food', 'guide', 'other')),
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  per_person BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.supplier_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage supplier costs"
ON public.supplier_costs FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Staff can view supplier costs"
ON public.supplier_costs FOR SELECT
USING (public.is_staff(auth.uid()));

CREATE TRIGGER update_supplier_costs_updated_at
  BEFORE UPDATE ON public.supplier_costs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
