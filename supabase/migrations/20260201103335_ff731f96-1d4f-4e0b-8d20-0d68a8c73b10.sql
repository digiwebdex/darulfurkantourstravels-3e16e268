-- Allow anyone to insert documents for bookings they have access to (by booking_id)
-- This is needed for guest users who just completed a booking
CREATE POLICY "Anyone can upload documents for their booking"
ON public.booking_documents
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.bookings b 
    WHERE b.id = booking_id
  )
);

-- Allow anyone to view documents for a booking if they know the booking ID
CREATE POLICY "Anyone can view documents by booking"
ON public.booking_documents
FOR SELECT
USING (true);

-- Allow anyone to delete documents (needed for guests)
CREATE POLICY "Anyone can delete documents for their booking"
ON public.booking_documents
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.bookings b 
    WHERE b.id = booking_id
  )
);

-- Storage: Allow anyone to upload to booking-documents bucket
CREATE POLICY "Anyone can upload booking documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'booking-documents');

-- Storage: Allow anyone to view booking documents
CREATE POLICY "Anyone can view booking documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'booking-documents');

-- Storage: Allow anyone to delete booking documents  
CREATE POLICY "Anyone can delete booking documents"
ON storage.objects
FOR DELETE
USING (bucket_id = 'booking-documents');