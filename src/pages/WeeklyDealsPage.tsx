import { useState, useEffect } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Clock, Flame, Tag, Loader2, ShoppingCart, Check, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useShoppingList } from "@/contexts/ShoppingListContext";

type Deal = {
  id: string;
  product_id: string | null;
  product_name: string;
  store: string;
  deal_price: number;
  original_price: number;
  start_date: string;
  end_date: string;
  badge_type: string;
  image_url: string | null;
};

function getTimeLeft(endDate: string) {
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return { label: "Expired", urgent: true, expired: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 2) return { label: `${days}d left`, urgent: false, expired: false };
  if (days > 0) return { label: `${days}d ${hours}h left`, urgent: true, expired: false };
  return { label: `${hours}h left`, urgent: true, expired: false };
}

// Demo deals for when the database is empty
const demoDeals: Deal[] = [
  { id: "d1", product_id: null, product_name: "Organic Eggs (12pk)", store: "Trader Joe's", deal_price: 3.49, original_price: 4.99, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 2 * 86400000).toISOString(), badge_type: "hot", image_url: null },
  { id: "d2", product_id: null, product_name: "Whole Wheat Bread", store: "Aldi", deal_price: 1.89, original_price: 2.49, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 5 * 86400000).toISOString(), badge_type: "sale", image_url: null },
  { id: "d3", product_id: null, product_name: "Chicken Breast (1lb)", store: "Costco", deal_price: 3.29, original_price: 5.49, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 1 * 86400000).toISOString(), badge_type: "flash", image_url: null },
  { id: "d4", product_id: null, product_name: "Organic Milk (1gal)", store: "Walmart", deal_price: 4.29, original_price: 5.79, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 6 * 86400000).toISOString(), badge_type: "sale", image_url: null },
  { id: "d5", product_id: null, product_name: "Avocados (4ct)", store: "Aldi", deal_price: 2.99, original_price: 4.49, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 3 * 86400000).toISOString(), badge_type: "hot", image_url: null },
  { id: "d6", product_id: null, product_name: "Greek Yogurt (32oz)", store: "Kroger", deal_price: 3.99, original_price: 5.99, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 0.5 * 86400000).toISOString(), badge_type: "flash", image_url: null },
  { id: "d7", product_id: null, product_name: "Brown Rice (2lb)", store: "Walmart", deal_price: 2.49, original_price: 3.79, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 4 * 86400000).toISOString(), badge_type: "sale", image_url: null },
  { id: "d8", product_id: null, product_name: "Salmon Fillet (1lb)", store: "Whole Foods", deal_price: 8.99, original_price: 12.99, start_date: new Date().toISOString(), end_date: new Date(Date.now() + 1.5 * 86400000).toISOString(), badge_type: "hot", image_url: null },
];

const badgeConfig: Record<string, { icon: typeof Flame; label: string; className: string }> = {
  hot: { icon: Flame, label: "Hot Deal", className: "bg-destructive text-destructive-foreground" },
  flash: { icon: Zap, label: "Flash Sale", className: "bg-warning text-warning-foreground" },
  sale: { icon: Tag, label: "On Sale", className: "bg-primary text-primary-foreground" },
};

export default function WeeklyDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [storeFilter, setStoreFilter] = useState("all");
  const { addItem, isInList, removeItem } = useShoppingList();

  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("weekly_deals")
        .select("*")
        .gte("end_date", new Date().toISOString().split("T")[0])
        .order("end_date", { ascending: true });

      if (!error && data && data.length > 0) {
        setDeals(data.map(d => ({ ...d, deal_price: Number(d.deal_price), original_price: Number(d.original_price) })));
      } else {
        setDeals(demoDeals);
      }
      setLoading(false);
    };
    fetchDeals();
  }, []);

  const stores = ["all", ...Array.from(new Set(deals.map(d => d.store)))];

  const filtered = deals
    .filter(d => storeFilter === "all" || d.store === storeFilter)
    .filter(d => !query || d.product_name.toLowerCase().includes(query.toLowerCase()) || d.store.toLowerCase().includes(query.toLowerCase()));

  const toggleItem = (deal: Deal) => {
    if (isInList(deal.id)) {
      removeItem(deal.id);
    } else {
      addItem({
        id: deal.id,
        name: deal.product_name,
        brand: "",
        store: deal.store,
        price: deal.deal_price,
        original_price: deal.original_price,
        image: "🏷️",
        image_url: deal.image_url || "",
      });
    }
  };

  // Group by store
  const grouped = filtered.reduce<Record<string, Deal[]>>((acc, deal) => {
    (acc[deal.store] = acc[deal.store] || []).push(deal);
    return acc;
  }, {});

  return (
    <PublicLayout>
      <div className="container px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Weekly Deals</h1>
          <p className="text-muted-foreground mt-1">This week's best deals organized by store — grab them before they're gone!</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search deals..." className="pl-10 h-11 rounded-xl" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
          <Select value={storeFilter} onValueChange={setStoreFilter}>
            <SelectTrigger className="w-full md:w-48 h-11 rounded-xl">
              <SelectValue placeholder="All Stores" />
            </SelectTrigger>
            <SelectContent>
              {stores.map(s => (
                <SelectItem key={s} value={s}>{s === "all" ? "All Stores" : s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([store, storeDeals]) => (
              <section key={store}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-semibold text-foreground">{store}</h2>
                  <Badge variant="secondary" className="text-xs">{storeDeals.length} deal{storeDeals.length !== 1 ? "s" : ""}</Badge>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {storeDeals.map(deal => {
                    const time = getTimeLeft(deal.end_date);
                    const badge = badgeConfig[deal.badge_type] || badgeConfig.sale;
                    const BadgeIcon = badge.icon;
                    const discount = Math.round(((deal.original_price - deal.deal_price) / deal.original_price) * 100);

                    return (
                      <div key={deal.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 group">
                        <div className="relative h-32 bg-muted flex items-center justify-center">
                          {deal.image_url ? (
                            <img src={deal.image_url} alt={deal.product_name} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <span className="text-4xl">🏷️</span>
                          )}
                          <div className={`absolute top-2 left-2 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.className}`}>
                            <BadgeIcon className="h-3 w-3" />
                            {badge.label}
                          </div>
                          {time.urgent && !time.expired && (
                            <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground animate-pulse">
                              <Clock className="h-3 w-3" />
                              Ending Soon
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-sm text-foreground">{deal.product_name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{deal.store}</p>

                          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span className={time.urgent ? "text-destructive font-medium" : ""}>{time.label}</span>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-primary">${deal.deal_price.toFixed(2)}</span>
                              <span className="text-sm line-through text-muted-foreground">${deal.original_price.toFixed(2)}</span>
                            </div>
                            <Badge variant="destructive" className="text-xs">-{discount}%</Badge>
                          </div>

                          <Button
                            size="sm"
                            variant={isInList(deal.id) ? "default" : "outline"}
                            className="w-full mt-3 rounded-lg text-xs"
                            onClick={() => toggleItem(deal)}
                          >
                            {isInList(deal.id) ? (
                              <><Check className="h-3.5 w-3.5 mr-1.5" />Added</>
                            ) : (
                              <><ShoppingCart className="h-3.5 w-3.5 mr-1.5" />Add to List</>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
