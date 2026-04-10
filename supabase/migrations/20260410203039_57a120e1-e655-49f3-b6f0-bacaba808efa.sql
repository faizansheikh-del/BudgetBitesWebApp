
-- Weekly Deals table
CREATE TABLE public.weekly_deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  store TEXT NOT NULL DEFAULT '',
  deal_price NUMERIC NOT NULL,
  original_price NUMERIC NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '7 days'),
  badge_type TEXT NOT NULL DEFAULT 'sale',
  image_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.weekly_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deals viewable by everyone" ON public.weekly_deals FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated can insert deals" ON public.weekly_deals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update deals" ON public.weekly_deals FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete deals" ON public.weekly_deals FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_weekly_deals_updated_at BEFORE UPDATE ON public.weekly_deals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Recipes table
CREATE TABLE public.recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  servings INT NOT NULL DEFAULT 4,
  prep_time INT NOT NULL DEFAULT 0,
  cook_time INT NOT NULL DEFAULT 0,
  image_url TEXT DEFAULT '',
  instructions TEXT DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipes viewable by everyone" ON public.recipes FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated can insert recipes" ON public.recipes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Creator can update recipes" ON public.recipes FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Creator can delete recipes" ON public.recipes FOR DELETE TO authenticated USING (auth.uid() = created_by);

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Recipe Ingredients table
CREATE TABLE public.recipe_ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'unit',
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ingredients viewable by everyone" ON public.recipe_ingredients FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated can insert ingredients" ON public.recipe_ingredients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update ingredients" ON public.recipe_ingredients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated can delete ingredients" ON public.recipe_ingredients FOR DELETE TO authenticated USING (true);

-- Price History table
CREATE TABLE public.price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  store TEXT NOT NULL DEFAULT '',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Price history viewable by everyone" ON public.price_history FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated can insert price history" ON public.price_history FOR INSERT TO authenticated WITH CHECK (true);
