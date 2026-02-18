
-- =====================================================
-- SECURITY FIX: Remove overly permissive public SELECT policies
-- =====================================================

-- 1. BOOKINGS: Remove public SELECT (owner policy already exists)
DROP POLICY IF EXISTS "Anyone can view bookings by id" ON public.bookings;

-- 2. BOOKING DOCUMENTS: Remove public SELECT (owner + admin policies exist)
DROP POLICY IF EXISTS "Anyone can view documents by booking" ON public.booking_documents;

-- 3. EMI PAYMENTS: Remove public SELECT (owner + admin policies exist)
DROP POLICY IF EXISTS "Anyone can view EMI payments by booking id" ON public.emi_payments;

-- 4. EMI INSTALLMENTS: Remove public SELECT, add restricted policy
DROP POLICY IF EXISTS "Anyone can view EMI installments by payment id" ON public.emi_installments;

CREATE POLICY "Owner and admin can view EMI installments"
ON public.emi_installments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.emi_payments ep
    JOIN public.bookings b ON b.id = ep.booking_id
    WHERE ep.id = emi_installments.emi_payment_id
    AND (b.user_id = auth.uid() OR public.is_admin() OR public.is_staff(auth.uid()))
  )
);

-- 5. TRANSACTIONS: Remove public SELECT (owner + admin policies exist)
DROP POLICY IF EXISTS "Anyone can view transactions by booking id" ON public.transactions;

-- 6. HOTEL DESTINATIONS: Fix overly permissive ALL policy
DROP POLICY IF EXISTS "Authenticated users can manage destinations" ON public.hotel_destinations;

CREATE POLICY "Public can view hotel destinations"
ON public.hotel_destinations FOR SELECT
USING (true);

CREATE POLICY "Admins can manage hotel destinations"
ON public.hotel_destinations FOR ALL
USING (public.is_admin() OR public.is_staff(auth.uid()))
WITH CHECK (public.is_admin() OR public.is_staff(auth.uid()));

-- 7. HOTEL BOOKING REQUESTS: Fix user_id IS NULL allowing public reads
DROP POLICY IF EXISTS "Users can view their own requests" ON public.hotel_booking_requests;

CREATE POLICY "Users can view their own hotel requests"
ON public.hotel_booking_requests FOR SELECT
USING (
  auth.uid() = user_id
  OR public.is_admin()
  OR public.is_staff(auth.uid())
);

-- 8. DARUL FURKAN CONTENT: Restrict update/insert to admin only
DROP POLICY IF EXISTS "Authenticated users can insert darul furkan content" ON public.darul_furkan_content;
DROP POLICY IF EXISTS "Authenticated users can update darul furkan content" ON public.darul_furkan_content;

CREATE POLICY "Admins can insert darul furkan content"
ON public.darul_furkan_content FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update darul furkan content"
ON public.darul_furkan_content FOR UPDATE
USING (public.is_admin());

-- 9. OFFER POPUP SETTINGS: Restrict manage to admin only
DROP POLICY IF EXISTS "Authenticated users can manage popup settings" ON public.offer_popup_settings;

CREATE POLICY "Admins can manage popup settings"
ON public.offer_popup_settings FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());
