-- Create tracking status enum with the order flow
CREATE TYPE public.tracking_status AS ENUM (
  'order_submitted',
  'documents_received',
  'under_review',
  'approved',
  'processing',
  'completed'
);

-- Add tracking_status column to bookings
ALTER TABLE public.bookings 
ADD COLUMN tracking_status public.tracking_status NOT NULL DEFAULT 'order_submitted';

-- Add admin_notes for remarks when updating status
ALTER TABLE public.bookings 
ADD COLUMN admin_notes text;

-- Create booking status history table for audit trail
CREATE TABLE public.booking_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  previous_status public.tracking_status,
  new_status public.tracking_status NOT NULL,
  notes text,
  changed_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on status history
ALTER TABLE public.booking_status_history ENABLE ROW LEVEL SECURITY;

-- Policies for status history
CREATE POLICY "Users can view their own booking history"
ON public.booking_status_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings 
    WHERE bookings.id = booking_status_history.booking_id 
    AND bookings.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all booking history"
ON public.booking_status_history
FOR SELECT
USING (is_admin());

CREATE POLICY "Admins can insert status history"
ON public.booking_status_history
FOR INSERT
WITH CHECK (is_admin());

-- Enable realtime for bookings to push status updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;