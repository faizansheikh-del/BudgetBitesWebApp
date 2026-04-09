import { useMemo } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { MapPin, Star, Truck, ShoppingBag, Heart, CheckCircle2, Navigation, Loader2 } from "lucide-react";
import { useGeolocation, distanceMiles, GeoPosition } from "@/hooks/use-geolocation";

type Store = {
  name: string;
  type: string;
  coords: GeoPosition;
  fallbackDistance: string;
  rating: number;
  cartPrice: number;
  savings: number;
  items: number;
  popular: string[];
  tags: string[];
  delivery: boolean;
  pickup: boolean;
  highlight: boolean;
};

const stores: Store[] = [
  {
    name: "Aldi", type: "Discount Grocery", coords: { lat: 40.7580, lng: -73.9855 }, fallbackDistance: "1.2 mi", rating: 4.3,
    cartPrice: 67.42, savings: 23.50, items: 42,
    popular: ["Eggs", "Milk", "Bread", "Chicken"],
    tags: ["Cheapest Overall", "Budget-Friendly"],
    delivery: false, pickup: true, highlight: true,
  },
  {
    name: "Trader Joe's", type: "Specialty Grocery", coords: { lat: 40.7505, lng: -73.9934 }, fallbackDistance: "0.8 mi", rating: 4.7,
    cartPrice: 72.85, savings: 18.20, items: 38,
    popular: ["Organic Produce", "Snacks", "Frozen Meals"],
    tags: ["Best Quality", "Healthy Options"],
    delivery: false, pickup: false, highlight: false,
  },
  {
    name: "Walmart", type: "Supermarket", coords: { lat: 40.7614, lng: -73.9776 }, fallbackDistance: "0.5 mi", rating: 3.9,
    cartPrice: 75.10, savings: 15.80, items: 56,
    popular: ["Dairy", "Meat", "Pantry Staples"],
    tags: ["Nearest", "Wide Selection"],
    delivery: true, pickup: true, highlight: false,
  },
  {
    name: "Costco", type: "Wholesale", coords: { lat: 40.7425, lng: -74.0061 }, fallbackDistance: "2.1 mi", rating: 4.5,
    cartPrice: 82.30, savings: 12.60, items: 28,
    popular: ["Bulk Items", "Rotisserie Chicken", "Produce"],
    tags: ["Best for Bulk"],
    delivery: true, pickup: true, highlight: false,
  },
  {
    name: "Whole Foods", type: "Organic Grocery", coords: { lat: 40.7420, lng: -73.9950 }, fallbackDistance: "1.8 mi", rating: 4.4,
    cartPrice: 95.60, savings: 8.40, items: 35,
    popular: ["Organic Produce", "Supplements", "Deli"],
    tags: ["Best Healthy Option", "Premium"],
    delivery: true, pickup: true, highlight: false,
  },
  {
    name: "Kroger", type: "Supermarket", coords: { lat: 40.7550, lng: -73.9870 }, fallbackDistance: "0.9 mi", rating: 4.1,
    cartPrice: 71.25, savings: 19.75, items: 48,
    popular: ["Dairy", "Baked Goods", "Beverages"],
    tags: ["Best for Savings"],
    delivery: true, pickup: true, highlight: false,
  },
];

export default function StoresPage() {
  const { position, loading: geoLoading, error: geoError, refresh } = useGeolocation();

  const sortedStores = useMemo(() => {
    if (!position) return stores;
    return [...stores].sort(
      (a, b) => distanceMiles(position, a.coords) - distanceMiles(position, b.coords)
    );
  }, [position]);

  const getDistance = (store: Store) => {
    if (!position) return store.fallbackDistance;
    const d = distanceMiles(position, store.coords);
    return d < 0.1 ? "Nearby" : `${d.toFixed(1)} mi`;
  };

  return (
    <PublicLayout>
      <div className="container px-4 md:px-6 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Store Comparison</h1>
            <p className="text-muted-foreground mt-1">Compare stores side by side to find the best value</p>
          </div>
          <div className="flex items-center gap-2">
            {position ? (
              <Badge variant="secondary" className="flex items-center gap-1.5 py-1.5 px-3">
                <Navigation className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs">GPS Active — sorted by distance</span>
              </Badge>
            ) : (
              <Button variant="outline" size="sm" onClick={refresh} disabled={geoLoading} className="gap-2">
                {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                {geoLoading ? "Locating…" : "Use My Location"}
              </Button>
            )}
          </div>
        </div>

        {geoError && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            {geoError}
          </div>
        )}

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {sortedStores.map((store) => (
            <div
              key={store.name}
              className={`bg-card rounded-xl border overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                store.highlight ? "border-primary ring-1 ring-primary/20" : "border-border"
              }`}
            >
              {store.highlight && (
                <div className="bg-primary text-primary-foreground text-xs font-medium text-center py-1.5">
                  ⭐ Best Overall Value
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{store.name}</h3>
                        <p className="text-xs text-muted-foreground">{store.type}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    {store.rating}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className={position ? "font-medium text-foreground" : ""}>{getDistance(store)}</span>
                  </span>
                  <span>{store.items} items</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {store.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>

                <div className="bg-muted/50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-muted-foreground">Cart Total</span>
                    <span className="text-xl font-bold text-foreground">${store.cartPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Est. Savings</span>
                    <span className="text-sm font-semibold text-primary">Save ${store.savings.toFixed(2)}/week</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Popular Items</p>
                  <div className="flex flex-wrap gap-1">
                    {store.popular.map((item) => (
                      <span key={item} className="text-xs bg-accent rounded-md px-2 py-0.5 text-accent-foreground">{item}</span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 text-xs text-muted-foreground">
                  {store.delivery && (
                    <span className="flex items-center gap-1"><Truck className="h-3 w-3" />Delivery</span>
                  )}
                  {store.pickup && (
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Pickup</span>
                  )}
                </div>

                <Button variant={store.highlight ? "default" : "outline"} className="w-full mt-4 rounded-lg" size="sm" asChild>
                  <Link to={`/store/${store.name.toLowerCase().replace(/\s+/g, "-").replace(/'/g, "")}`}>
                    View Store Details
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
