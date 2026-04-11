
-- Tighten recipes INSERT
DROP POLICY IF EXISTS "Authenticated can insert recipes" ON public.recipes;
CREATE POLICY "Authenticated can insert own recipes"
ON public.recipes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);
