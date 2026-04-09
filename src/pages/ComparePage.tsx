import { useState, useEffect } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, ArrowUpDown, Heart, ShoppingCart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

export default function ComparePage() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("price");
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
      return parseFloat(a.distance) - parseFloat(b.distance);
    });

  return (
    <PublicLayout>
      <div className="container px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Compare Grocery Prices</h1>
          <p className="text-muted-foreground mt-1">Find the best deals across stores near you</p>
        </div>

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
        ) : (
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
                    <MapPin className="h-3 w-3" />{product.distance}
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

                  <Button size="sm" variant="outline" className="w-full mt-3 rounded-lg text-xs">
                    <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                    Add to List
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
