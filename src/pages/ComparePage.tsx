import { useState, useEffect, useMemo } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, ArrowUpDown, Heart, ShoppingCart, Loader2, Check, X, Trash2, Navigation, LayoutGrid, Rows3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useShoppingList } from "@/contexts/ShoppingListContext";
import { useGeolocation, distanceMiles, GeoPosition } from "@/hooks/use-geolocation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Product = {
  id: string;
  name: string;
  brand: string;
  store: string;
  price: number;
  original_price: number;
  distance: string;
  category: string;
  image: string;
  image_url: string;
  tags: string[];
  healthy: boolean;
};

const storeCoords: Record<string, GeoPosition> = {
  "Aldi": { lat: 40.7580, lng: -73.9855 },
  "Trader Joe's": { lat: 40.7505, lng: -73.9934 },
  "Walmart": { lat: 40.7614, lng: -73.9776 },
  "Costco": { lat: 40.7425, lng: -74.0061 },
  "Whole Foods": { lat: 40.7420, lng: -73.9950 },
  "Kroger": { lat: 40.7550, lng: -73.9870 },
  "Target": { lat: 40.7484, lng: -73.9967 },
};

const STORE_COLORS: Record<string, string> = {
  "Aldi": "bg-blue-500",
  "Trader Joe's": "bg-red-500",
  "Walmart": "bg-yellow-500",
  "Costco": "bg-red-600",
  "Whole Foods": "bg-green-600",
  "Kroger": "bg-blue-600",
  "Target": "bg-red-500",
};

export default function ComparePage() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("price");
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "compare">("grid");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showListDialog, setShowListDialog] = useState(false);
  const { items: listItems, addItem, removeItem, clearList, isInList, totalCost, totalSavings } = useShoppingList();
  const { position, loading: geoLoading, error: geoError, refresh } = useGeolocation();

  const getStoreDistance = (storeName: string, fallback: string) => {
    if (!position) return fallback;
    const coords = storeCoords[storeName];
    if (!coords) return fallback;
    const d = distanceMiles(position, coords);
    return d < 0.1 ? "Nearby" : `${d.toFixed(1)} mi`;
  };

  const toggleListItem = (product: Product) => {
    if (isInList(product.id)) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("id, name, brand, store, price, original_price, distance, category, image, image_url, tags, healthy")
        .order("price", { ascending: true });

      if (!error && data) {
        setProducts(data.map(p => ({ ...p, price: Number(p.price), original_price: Number(p.original_price) })));
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const filtered = products
    .filter((p) => activeCategory === "All" || p.category === activeCategory)
    .filter((p) => !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "discount") return ((b.original_price - b.price) / b.original_price) - ((a.original_price - a.price) / a.original_price);
      if (position) {
        const aDist = storeCoords[a.store] ? distanceMiles(position, storeCoords[a.store]) : Infinity;
        const bDist = storeCoords[b.store] ? distanceMiles(position, storeCoords[b.store]) : Infinity;
        return aDist - bDist;
      }
      return parseFloat(a.distance) - parseFloat(b.distance);
    });

  // Group products by name for comparison view
  const groupedProducts = useMemo(() => {
    const groups: Record<string, Product[]> = {};
    filtered.forEach((p) => {
      if (!groups[p.name]) groups[p.name] = [];
      groups[p.name].push(p);
    });
    // Sort each group by price
    Object.values(groups).forEach((g) => g.sort((a, b) => a.price - b.price));
    // Sort groups: multi-store first, then by cheapest price
    return Object.entries(groups)
      .sort((a, b) => {
        if (b[1].length !== a[1].length) return b[1].length - a[1].length;
        return a[1][0].price - b[1][0].price;
      });
  }, [filtered]);

  return (
    <PublicLayout>
      <div className="container px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Compare Grocery Prices</h1>
          <p className="text-muted-foreground mt-1">Find the best deals across stores near you</p>
        </div>
        <div className="flex items-center gap-2 mb-8">
          {position ? (
            <Badge variant="secondary" className="flex items-center gap-1.5 py-1.5 px-3">
              <Navigation className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs">GPS Active — live distances</span>
            </Badge>
          ) : (
            <Button variant="outline" size="sm" onClick={refresh} disabled={geoLoading} className="gap-2">
              {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
              {geoLoading ? "Locating…" : "Use My Location"}
            </Button>
          )}
        </div>

        {geoError && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {geoError}
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products, categories..."
              className="pl-10 h-11 rounded-xl"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full md:w-48 h-11 rounded-xl">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price">Lowest Price</SelectItem>
              <SelectItem value="distance">Nearest Store</SelectItem>
              <SelectItem value="discount">Highest Discount</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border border-border rounded-xl overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="rounded-none h-11 px-3"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "compare" ? "default" : "ghost"}
              size="sm"
              className="rounded-none h-11 px-3"
              onClick={() => setViewMode("compare")}
            >
              <Rows3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={cat === activeCategory ? "default" : "outline"}
              size="sm"
              className="rounded-full text-xs"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : viewMode === "compare" ? (
          /* Compare View - grouped by product */
          <div className="space-y-4">
            {groupedProducts.map(([name, variants]) => {
              const cheapest = variants[0];
              const mostExpensive = variants[variants.length - 1];
              const savings = variants.length > 1 ? (mostExpensive.price - cheapest.price).toFixed(2) : null;

              return (
                <div key={name} className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {variants[0].image_url ? (
                        <img src={variants[0].image_url} alt={name} className="h-12 w-12 rounded-lg object-cover shrink-0" />
                      ) : (
                        <span className="text-2xl">{variants[0].image}</span>
                      )}
                      <div>
                        <h3 className="font-semibold text-foreground">{name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {variants[0].category}
                          {variants.length > 1 && (
                            <span> · Available at <span className="font-medium text-foreground">{variants.length} stores</span></span>
                          )}
                        </p>
                      </div>
                    </div>
                    {savings && (
                      <Badge variant="secondary" className="text-xs">
                        Save up to ${savings}
                      </Badge>
                    )}
                  </div>
                  <div className="divide-y divide-border">
                    {variants.map((product, idx) => (
                      <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors group">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${STORE_COLORS[product.store] || "bg-muted-foreground"}`}>
                          {product.store.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">{product.store}</p>
                          <p className="text-xs text-muted-foreground">{product.brand} · <MapPin className="h-3 w-3 inline" /> {getStoreDistance(product.store, product.distance)}</p>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {product.tags.map((tag) => (
                            <Badge key={tag} variant={tag === "Cheapest" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                          {idx === 0 && variants.length > 1 && !product.tags.includes("Cheapest") && (
                            <Badge className="text-[10px] px-1.5 py-0">Best Price</Badge>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-lg font-bold text-primary">${product.price.toFixed(2)}</span>
                          {product.original_price > product.price && (
                            <span className="text-xs line-through text-muted-foreground ml-1.5">${product.original_price.toFixed(2)}</span>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant={isInList(product.id) ? "default" : "outline"}
                          className="text-xs shrink-0"
                          onClick={() => toggleListItem(product)}
                        >
                          {isInList(product.id) ? <Check className="h-3.5 w-3.5" /> : <ShoppingCart className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Grid View */
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <div key={product.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 group">
                <div className="relative h-40 bg-muted overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">{product.image}</div>
                  )}
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 bg-background/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground text-sm">{product.name}</h3>
                  <p className="text-xs text-muted-foreground">{product.brand} · {product.store}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3" />
                    <span className={position ? "font-medium text-foreground" : ""}>{getStoreDistance(product.store, product.distance)}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {product.tags.map((tag) => (
                      <Badge key={tag} variant={tag === "Cheapest" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                        {tag}
                      </Badge>
                    ))}
                    {product.healthy && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
                        Healthy
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                     <div className="flex items-center gap-2">
                       <span className="text-lg font-bold text-primary">${product.price.toFixed(2)}</span>
                       <span className="text-sm line-through text-muted-foreground">${product.original_price.toFixed(2)}</span>
                     </div>
                     <Badge variant="destructive" className="text-xs">
                       -{Math.round(((product.original_price - product.price) / product.original_price) * 100)}%
                     </Badge>
                   </div>

                  <Button
                    size="sm"
                    variant={isInList(product.id) ? "default" : "outline"}
                    className="w-full mt-3 rounded-lg text-xs"
                    onClick={() => toggleListItem(product)}
                  >
                    {isInList(product.id) ? (
                      <><Check className="h-3.5 w-3.5 mr-1.5" />Added</>
                    ) : (
                      <><ShoppingCart className="h-3.5 w-3.5 mr-1.5" />Add to List</>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        {listItems.length > 0 && <div className="h-20" />}
      </div>

      {/* Floating Shopping List Summary Bar */}
      {listItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md shadow-lg">
          <div className="container px-4 md:px-6 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {listItems.length} item{listItems.length !== 1 ? "s" : ""} in list
                </p>
                <p className="text-xs text-muted-foreground">
                  Est. total: <span className="font-medium text-primary">${totalCost.toFixed(2)}</span>
                  {" · "}
                  You save: <span className="font-medium text-green-500">${totalSavings.toFixed(2)}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="text-xs text-muted-foreground" onClick={clearList}>
                Clear
              </Button>
              <Button size="sm" className="text-xs" onClick={() => setShowListDialog(true)}>
                <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                View List
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Shopping List Dialog */}
      <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
        <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Shopping List ({listItems.length} item{listItems.length !== 1 ? "s" : ""})
            </DialogTitle>
          </DialogHeader>
          {listItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Your shopping list is empty.</p>
          ) : (
            <div className="space-y-4">
              <ul className="space-y-2">
                {listItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 bg-muted/50 rounded-lg p-2.5">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="h-12 w-12 rounded-md object-cover shrink-0" />
                    ) : (
                      <span className="text-2xl shrink-0">{item.image}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.store}{item.brand ? ` · ${item.brand}` : ""}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-primary">${item.price.toFixed(2)}</p>
                      {item.original_price > item.price && (
                        <p className="text-[10px] line-through text-muted-foreground">${item.original_price.toFixed(2)}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
              <div className="border-t border-border pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold text-foreground">${totalCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total savings</span>
                  <span className="font-semibold text-green-500">-${totalSavings.toFixed(2)}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => { clearList(); setShowListDialog(false); }}
              >
                Clear All
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
