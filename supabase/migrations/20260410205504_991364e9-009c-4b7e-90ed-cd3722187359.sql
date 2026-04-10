
-- Community price reports
CREATE TABLE public.community_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name TEXT NOT NULL,
  store TEXT NOT NULL DEFAULT '',
  price NUMERIC NOT NULL,
  upvotes INTEGER NOT NULL DEFAULT 0,
  reported_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.community_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Community prices viewable by everyone" ON public.community_prices FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated can report prices" ON public.community_prices FOR INSERT TO authenticated WITH CHECK (auth.uid() = reported_by);
CREATE POLICY "Reporter can update own prices" ON public.community_prices FOR UPDATE TO authenticated USING (auth.uid() = reported_by);
CREATE POLICY "Reporter can delete own prices" ON public.community_prices FOR DELETE TO authenticated USING (auth.uid() = reported_by);

CREATE TRIGGER update_community_prices_updated_at BEFORE UPDATE ON public.community_prices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Price votes (upvote tracking)
CREATE TABLE public.price_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  price_report_id UUID NOT NULL REFERENCES public.community_prices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (price_report_id, user_id)
);

ALTER TABLE public.price_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Votes viewable by authenticated" ON public.price_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can vote" ON public.price_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own vote" ON public.price_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Function to increment upvotes
CREATE OR REPLACE FUNCTION public.toggle_price_vote(p_report_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  vote_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM price_votes WHERE price_report_id = p_report_id AND user_id = auth.uid()) INTO vote_exists;
  IF vote_exists THEN
    DELETE FROM price_votes WHERE price_report_id = p_report_id AND user_id = auth.uid();
    UPDATE community_prices SET upvotes = upvotes - 1 WHERE id = p_report_id;
    RETURN false;
  ELSE
    INSERT INTO price_votes (price_report_id, user_id) VALUES (p_report_id, auth.uid());
    UPDATE community_prices SET upvotes = upvotes + 1 WHERE id = p_report_id;
    RETURN true;
  END IF;
END;
$$;

-- Shared grocery lists
CREATE TABLE public.shared_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Shopping List',
  owner_id UUID NOT NULL,
  invite_code TEXT NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_lists ENABLE ROW LEVEL SECURITY;

-- List members table
CREATE TABLE public.shared_list_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES public.shared_lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (list_id, user_id)
);

ALTER TABLE public.shared_list_members ENABLE ROW LEVEL SECURITY;

-- Members can view lists they belong to
CREATE POLICY "Members can view shared lists" ON public.shared_lists FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR EXISTS(SELECT 1 FROM shared_list_members WHERE list_id = id AND user_id = auth.uid()));
CREATE POLICY "Authenticated can create lists" ON public.shared_lists FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owner can update lists" ON public.shared_lists FOR UPDATE TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owner can delete lists" ON public.shared_lists FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE POLICY "Members can view memberships" ON public.shared_list_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can join lists" ON public.shared_list_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave lists" ON public.shared_list_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_shared_lists_updated_at BEFORE UPDATE ON public.shared_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Shared list items
CREATE TABLE public.shared_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES public.shared_lists(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'unit',
  checked BOOLEAN NOT NULL DEFAULT false,
  added_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.shared_list_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view list items" ON public.shared_list_items FOR SELECT TO authenticated
  USING (EXISTS(SELECT 1 FROM shared_lists WHERE id = list_id AND (owner_id = auth.uid() OR EXISTS(SELECT 1 FROM shared_list_members WHERE shared_list_members.list_id = shared_list_items.list_id AND user_id = auth.uid()))));
CREATE POLICY "Members can add items" ON public.shared_list_items FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = added_by AND EXISTS(SELECT 1 FROM shared_lists WHERE id = list_id AND (owner_id = auth.uid() OR EXISTS(SELECT 1 FROM shared_list_members WHERE shared_list_members.list_id = shared_list_items.list_id AND user_id = auth.uid()))));
CREATE POLICY "Members can update items" ON public.shared_list_items FOR UPDATE TO authenticated
  USING (EXISTS(SELECT 1 FROM shared_lists WHERE id = list_id AND (owner_id = auth.uid() OR EXISTS(SELECT 1 FROM shared_list_members WHERE shared_list_members.list_id = shared_list_items.list_id AND user_id = auth.uid()))));
CREATE POLICY "Members can delete items" ON public.shared_list_items FOR DELETE TO authenticated
  USING (EXISTS(SELECT 1 FROM shared_lists WHERE id = list_id AND (owner_id = auth.uid() OR EXISTS(SELECT 1 FROM shared_list_members WHERE shared_list_members.list_id = shared_list_items.list_id AND user_id = auth.uid()))));

-- Enable realtime for shared list items
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_list_items;
