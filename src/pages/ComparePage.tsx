import { useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, SlidersHorizontal, ArrowUpDown, Heart, ShoppingCart } from "lucide-react";

const mockProducts = [
  { id: 1, name: "Organic Free-Range Eggs", brand: "Happy Hen", store: "Trader Joe's", price: 3.49, originalPrice: 4.99, distance: "0.8 mi", category: "Dairy & Eggs", image: "🥚", tags: ["Cheapest", "Organic"], healthy: true },
  { id: 2, name: "Whole Wheat Bread", brand: "Dave's Killer", store: "Aldi", price: 1.89, originalPrice: 2.49, distance: "1.2 mi", category: "Bakery", image: "🍞", tags: ["Best Value"], healthy: true },
  { id: 3, name: "Chicken Breast Boneless", brand: "Perdue", store: "Costco", price: 3.29, originalPrice: 5.49, distance: "2.1 mi", category: "Meat", image: "🍗", tags: ["Cheapest"], healthy: true },
  { id: 4, name: "Organic Whole Milk", brand: "Horizon", store: "Walmart", price: 4.29, originalPrice: 5.79, distance: "0.5 mi", category: "Dairy & Eggs", image: "🥛", tags: ["Popular"], healthy: true },
  { id: 5, name: "Basmati Rice 5lb", brand: "Royal", store: "Target", price: 6.99, originalPrice: 8.99, distance: "1.5 mi", category: "Grains", image: "🍚", tags: ["Best Value"], healthy: false },
  { id: 6, name: "Baby Spinach 5oz", brand: "Earthbound Farm", store: "Whole Foods", price: 2.99, originalPrice: 3.99, distance: "1.8 mi", category: "Produce", image: "🥬", tags: ["Organic", "Cheapest"], healthy: true },
  { id: 7, name: "Greek Yogurt 32oz", brand: "Chobani", store: "Kroger", price: 4.49, originalPrice: 5.99, distance: "0.9 mi", category: "Dairy & Eggs", image: "🥣", tags: ["Popular"], healthy: true },
  { id: 8, name: "Peanut Butter 16oz", brand: "Jif", store: "Aldi", price: 2.49, originalPrice: 3.29, distance: "1.2 mi", category: "Pantry", image: "🥜", tags: ["Budget-Friendly"], healthy: false },
  { id: 9, name: "Organic Bananas 1lb", brand: "Dole", store: "Trader Joe's", price: 0.79, originalPrice: 1.19, distance: "0.8 mi", category: "Produce", image: "🍌", tags: ["Cheapest", "Organic"], healthy: true },
  { id: 10, name: "Avocados (3-pack)", brand: "Fresh", store: "Aldi", price: 2.99, originalPrice: 4.49, distance: "1.2 mi", category: "Produce", image: "🥑", tags: ["Best Value"], healthy: true },
  { id: 11, name: "Roma Tomatoes 1lb", brand: "Local Farm", store: "Kroger", price: 1.49, originalPrice: 2.29, distance: "0.9 mi", category: "Produce", image: "🍅", tags: ["Budget-Friendly"], healthy: true },
  { id: 12, name: "Sweet Potatoes 3lb", brand: "Organic Harvest", store: "Whole Foods", price: 3.49, originalPrice: 4.99, distance: "1.8 mi", category: "Produce", image: "🍠", tags: ["Organic"], healthy: true },
  { id: 13, name: "Broccoli Crowns 1lb", brand: "Green Giant", store: "Walmart", price: 1.29, originalPrice: 1.99, distance: "0.5 mi", category: "Produce", image: "🥦", tags: ["Cheapest"], healthy: true },
  { id: 14, name: "Ground Turkey 1lb", brand: "Butterball", store: "Target", price: 4.99, originalPrice: 6.49, distance: "1.5 mi", category: "Meat", image: "🥩", tags: ["Popular"], healthy: true },
  { id: 15, name: "Salmon Fillet 1lb", brand: "Wild Caught", store: "Costco", price: 7.99, originalPrice: 10.99, distance: "2.1 mi", category: "Meat", image: "🐟", tags: ["Best Value", "Organic"], healthy: true },
  { id: 16, name: "Sourdough Loaf", brand: "La Brea", store: "Whole Foods", price: 3.99, originalPrice: 5.49, distance: "1.8 mi", category: "Bakery", image: "🥖", tags: ["Popular"], healthy: false },
  { id: 17, name: "Olive Oil Extra Virgin 16oz", brand: "Bertolli", store: "Walmart", price: 5.49, originalPrice: 7.99, distance: "0.5 mi", category: "Pantry", image: "🫒", tags: ["Best Value"], healthy: true },
  { id: 18, name: "Canned Black Beans 15oz", brand: "Goya", store: "Aldi", price: 0.89, originalPrice: 1.29, distance: "1.2 mi", category: "Pantry", image: "🫘", tags: ["Cheapest", "Budget-Friendly"], healthy: true },
  { id: 19, name: "Quinoa 1lb", brand: "Bob's Red Mill", store: "Target", price: 4.49, originalPrice: 5.99, distance: "1.5 mi", category: "Grains", image: "🌾", tags: ["Organic"], healthy: true },
  { id: 20, name: "Bell Peppers (3-pack)", brand: "Fresh", store: "Kroger", price: 2.49, originalPrice: 3.79, distance: "0.9 mi", category: "Produce", image: "🫑", tags: ["Popular"], healthy: true },
];

export default function ComparePage() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("price");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(mockProducts.map(p => p.category)))];

  const filtered = mockProducts
    .filter((p) => activeCategory === "All" || p.category === activeCategory)
    .filter((p) => !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "price") return a.price - b.price;
      if (sortBy === "discount") return ((b.originalPrice - b.price) / b.originalPrice) - ((a.originalPrice - a.price) / a.originalPrice);
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
          {["All", "Produce", "Dairy & Eggs", "Meat", "Bakery", "Pantry", "Grains"].map((cat) => (
            <Button key={cat} variant={cat === "All" ? "default" : "outline"} size="sm" className="rounded-full text-xs">
              {cat}
            </Button>
          ))}
        </div>

        {/* Results */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <div key={product.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 group">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{product.image}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
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
                    <span className="text-sm line-through text-muted-foreground">${product.originalPrice.toFixed(2)}</span>
                  </div>
                  <Badge variant="destructive" className="text-xs">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
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
      </div>
    </PublicLayout>
  );
}
