
-- Store Reviews
CREATE TABLE public.store_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  store_name TEXT NOT NULL,
  price_accuracy INT NOT NULL DEFAULT 3 CHECK (price_accuracy BETWEEN 1 AND 5),
  freshness INT NOT NULL DEFAULT 3 CHECK (freshness BETWEEN 1 AND 5),
  checkout_speed INT NOT NULL DEFAULT 3 CHECK (checkout_speed BETWEEN 1 AND 5),
  cleanliness INT NOT NULL DEFAULT 3 CHECK (cleanliness BETWEEN 1 AND 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.store_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews viewable by everyone" ON public.store_reviews FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated can insert reviews" ON public.store_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.store_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.store_reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_store_reviews_updated_at BEFORE UPDATE ON public.store_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Receipts
CREATE TABLE public.receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  store TEXT NOT NULL DEFAULT '',
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own receipts" ON public.receipts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own receipts" ON public.receipts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own receipts" ON public.receipts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own receipts" ON public.receipts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON public.receipts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Receipt Items
CREATE TABLE public.receipt_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_id UUID NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own receipt items" ON public.receipt_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.receipts WHERE receipts.id = receipt_items.receipt_id AND receipts.user_id = auth.uid()));
CREATE POLICY "Users can insert own receipt items" ON public.receipt_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.receipts WHERE receipts.id = receipt_items.receipt_id AND receipts.user_id = auth.uid()));
CREATE POLICY "Users can update own receipt items" ON public.receipt_items FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.receipts WHERE receipts.id = receipt_items.receipt_id AND receipts.user_id = auth.uid()));
CREATE POLICY "Users can delete own receipt items" ON public.receipt_items FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.receipts WHERE receipts.id = receipt_items.receipt_id AND receipts.user_id = auth.uid()));

-- Loyalty Programs
CREATE TABLE public.loyalty_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  store_name TEXT NOT NULL,
  program_name TEXT NOT NULL DEFAULT '',
  current_points NUMERIC NOT NULL DEFAULT 0,
  reward_threshold NUMERIC NOT NULL DEFAULT 100,
  reward_description TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own loyalty programs" ON public.loyalty_programs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own loyalty programs" ON public.loyalty_programs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own loyalty programs" ON public.loyalty_programs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own loyalty programs" ON public.loyalty_programs FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_loyalty_programs_updated_at BEFORE UPDATE ON public.loyalty_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
