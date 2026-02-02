-- Add SELECT policy for admins to view all payment methods (including disabled ones)
CREATE POLICY "Admins can view all payment methods"
ON public.payment_methods
FOR SELECT
USING (is_admin() = true);

-- Also allow staff members to view all payment methods
CREATE POLICY "Staff can view all payment methods"
ON public.payment_methods
FOR SELECT
USING (is_staff(auth.uid()) = true);