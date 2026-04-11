
-- Tighten price_history INSERT (admin-only since this is system data)
DROP POLICY IF EXISTS "Authenticated can insert price history" ON public.price_history;
CREATE POLICY "Admins can insert price history"
ON public.price_history
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));
