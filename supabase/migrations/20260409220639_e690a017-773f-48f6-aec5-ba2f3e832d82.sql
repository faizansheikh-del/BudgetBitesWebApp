
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT '',
  store TEXT NOT NULL DEFAULT '',
  price NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2) NOT NULL,
  distance TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  healthy BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public read access so visitors can browse prices
CREATE POLICY "Products viewable by everyone"
ON public.products
FOR SELECT
USING (true);

-- Authenticated users can manage products
CREATE POLICY "Authenticated can insert products"
ON public.products
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated can update products"
ON public.products
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated can delete products"
ON public.products
FOR DELETE
TO authenticated
USING (true);

-- Auto-update updated_at
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
