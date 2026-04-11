
-- 1. Fix broken shared_lists SELECT policy (self-referential join bug)
DROP POLICY IF EXISTS "Members can view shared lists" ON public.shared_lists;
CREATE POLICY "Members can view shared lists"
ON public.shared_lists
FOR SELECT
TO authenticated
USING (
  (owner_id = auth.uid()) OR
  (EXISTS (
    SELECT 1 FROM shared_list_members
    WHERE shared_list_members.list_id = shared_lists.id
      AND shared_list_members.user_id = auth.uid()
  ))
);

-- 2. Tighten products write policies (admin-only)
DROP POLICY IF EXISTS "Authenticated can update products" ON public.products;
CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated can delete products" ON public.products;
CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated can insert products" ON public.products;
CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3. Tighten weekly_deals write policies (admin-only)
DROP POLICY IF EXISTS "Authenticated can update deals" ON public.weekly_deals;
CREATE POLICY "Admins can update deals"
ON public.weekly_deals
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated can delete deals" ON public.weekly_deals;
CREATE POLICY "Admins can delete deals"
ON public.weekly_deals
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Authenticated can insert deals" ON public.weekly_deals;
CREATE POLICY "Admins can insert deals"
ON public.weekly_deals
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Tighten recipe_ingredients write policies (creator or admin)
DROP POLICY IF EXISTS "Authenticated can update ingredients" ON public.recipe_ingredients;
CREATE POLICY "Creator or admin can update ingredients"
ON public.recipe_ingredients
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = recipe_ingredients.recipe_id
      AND (recipes.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

DROP POLICY IF EXISTS "Authenticated can delete ingredients" ON public.recipe_ingredients;
CREATE POLICY "Creator or admin can delete ingredients"
ON public.recipe_ingredients
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = recipe_ingredients.recipe_id
      AND (recipes.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

DROP POLICY IF EXISTS "Authenticated can insert ingredients" ON public.recipe_ingredients;
CREATE POLICY "Creator or admin can insert ingredients"
ON public.recipe_ingredients
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM recipes
    WHERE recipes.id = recipe_ingredients.recipe_id
      AND (recipes.created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  )
);

-- 5. Tighten recipes DELETE (add admin check alongside creator)
DROP POLICY IF EXISTS "Creator can delete recipes" ON public.recipes;
CREATE POLICY "Creator or admin can delete recipes"
ON public.recipes
FOR DELETE
TO authenticated
USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));

-- 6. Restrict store_reviews SELECT from public to authenticated
DROP POLICY IF EXISTS "Reviews viewable by everyone" ON public.store_reviews;
CREATE POLICY "Reviews viewable by authenticated"
ON public.store_reviews
FOR SELECT
TO authenticated
USING (true);

-- 7. Fix shared_list_members SELECT (scope to own lists)
DROP POLICY IF EXISTS "Members can view memberships" ON public.shared_list_members;
CREATE POLICY "Members can view relevant memberships"
ON public.shared_list_members
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM shared_lists
    WHERE shared_lists.id = shared_list_members.list_id
      AND (shared_lists.owner_id = auth.uid() OR EXISTS (
        SELECT 1 FROM shared_list_members slm
        WHERE slm.list_id = shared_list_members.list_id
          AND slm.user_id = auth.uid()
      ))
  )
);
