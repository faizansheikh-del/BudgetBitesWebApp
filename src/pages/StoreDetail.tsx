import { useParams, Link } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, Star, Truck, ShoppingBag, CheckCircle2, ArrowLeft,
  Clock, Phone, DollarSign, TrendingDown, Heart
} from "lucide-react";
import { StoreReviews } from "@/components/StoreReviews";

const storesData: Record<string, {
  name: string; type: string; distance: string; rating: number;
  cartPrice: number; savings: number; items: number;
  popular: string[]; tags: string[]; delivery: boolean; pickup: boolean;
  address: string; hours: string; phone: string;
  products: { name: string; price: number; category: string; discount?: number; badge?: string }[];
  deals: { name: string; original: number; sale: number; ends: string }[];
}> = {
  aldi: {
    name: "Aldi", type: "Discount Grocery", distance: "1.2 mi", rating: 4.3,
    cartPrice: 67.42, savings: 23.50, items: 42,
    popular: ["Eggs", "Milk", "Bread", "Chicken"],
    tags: ["Cheapest Overall", "Budget-Friendly"],
    delivery: false, pickup: true,
    address: "123 Main St, Springfield, IL 62704",
    hours: "9:00 AM – 8:00 PM",
    phone: "(217) 555-0142",
    products: [
      { name: "Large Eggs (12ct)", price: 2.49, category: "Dairy & Eggs", discount: 15, badge: "Cheapest" },
      { name: "Whole Milk (1 gal)", price: 3.29, category: "Dairy & Eggs" },
      { name: "White Bread", price: 1.09, category: "Bakery", badge: "Budget Hero" },
      { name: "Chicken Breast (1 lb)", price: 3.49, category: "Meat", discount: 20 },
      { name: "Bananas (1 lb)", price: 0.49, category: "Produce", badge: "Cheapest" },
      { name: "Cheddar Cheese (8oz)", price: 2.19, category: "Dairy & Eggs" },
      { name: "Pasta (16oz)", price: 0.95, category: "Pantry" },
      { name: "Tomato Sauce (24oz)", price: 1.29, category: "Pantry" },
    ],
    deals: [
      { name: "Organic Eggs (12ct)", original: 4.29, sale: 2.99, ends: "2 days" },
      { name: "Ground Beef (1 lb)", original: 5.49, sale: 3.99, ends: "3 days" },
      { name: "Avocados (bag of 4)", original: 3.99, sale: 2.49, ends: "1 day" },
    ],
  },
  "trader-joes": {
    name: "Trader Joe's", type: "Specialty Grocery", distance: "0.8 mi", rating: 4.7,
    cartPrice: 72.85, savings: 18.20, items: 38,
    popular: ["Organic Produce", "Snacks", "Frozen Meals"],
    tags: ["Best Quality", "Healthy Options"],
    delivery: false, pickup: false,
    address: "456 Oak Ave, Springfield, IL 62704",
    hours: "8:00 AM – 9:00 PM",
    phone: "(217) 555-0198",
    products: [
      { name: "Organic Eggs (12ct)", price: 3.99, category: "Dairy & Eggs", badge: "Organic" },
      { name: "Almond Milk (64oz)", price: 2.99, category: "Dairy & Eggs" },
      { name: "Sourdough Bread", price: 3.49, category: "Bakery" },
      { name: "Free Range Chicken (1 lb)", price: 5.49, category: "Meat" },
      { name: "Baby Spinach (6oz)", price: 2.49, category: "Produce" },
      { name: "Greek Yogurt (32oz)", price: 4.49, category: "Dairy & Eggs", discount: 10 },
      { name: "Everything Bagel Seasoning", price: 1.99, category: "Pantry", badge: "Popular" },
      { name: "Cauliflower Gnocchi", price: 2.69, category: "Frozen", badge: "Fan Favorite" },
    ],
    deals: [
      { name: "Organic Strawberries", original: 4.99, sale: 3.49, ends: "3 days" },
      { name: "Frozen Orange Chicken", original: 4.99, sale: 3.99, ends: "5 days" },
    ],
  },
  walmart: {
    name: "Walmart", type: "Supermarket", distance: "0.5 mi", rating: 3.9,
    cartPrice: 75.10, savings: 15.80, items: 56,
    popular: ["Dairy", "Meat", "Pantry Staples"],
    tags: ["Nearest", "Wide Selection"],
    delivery: true, pickup: true,
    address: "789 Commerce Dr, Springfield, IL 62704",
    hours: "6:00 AM – 11:00 PM",
    phone: "(217) 555-0267",
    products: [
      { name: "Great Value Eggs (12ct)", price: 2.68, category: "Dairy & Eggs" },
      { name: "Great Value Milk (1 gal)", price: 3.36, category: "Dairy & Eggs" },
      { name: "Wonder Bread", price: 2.48, category: "Bakery" },
      { name: "Boneless Chicken Breast (1 lb)", price: 3.92, category: "Meat" },
      { name: "Bananas (1 lb)", price: 0.58, category: "Produce" },
      { name: "Ground Turkey (1 lb)", price: 4.28, category: "Meat", discount: 12 },
      { name: "Rice (5 lb)", price: 3.98, category: "Pantry" },
      { name: "Peanut Butter (16oz)", price: 2.18, category: "Pantry" },
    ],
    deals: [
      { name: "Whole Chicken", original: 7.98, sale: 5.48, ends: "4 days" },
      { name: "Strawberries (1 lb)", original: 3.98, sale: 2.50, ends: "2 days" },
      { name: "Canned Tuna (5pk)", original: 5.48, sale: 3.98, ends: "6 days" },
    ],
  },
  costco: {
    name: "Costco", type: "Wholesale", distance: "2.1 mi", rating: 4.5,
    cartPrice: 82.30, savings: 12.60, items: 28,
    popular: ["Bulk Items", "Rotisserie Chicken", "Produce"],
    tags: ["Best for Bulk"],
    delivery: true, pickup: true,
    address: "1010 Warehouse Blvd, Springfield, IL 62704",
    hours: "10:00 AM – 8:30 PM",
    phone: "(217) 555-0345",
    products: [
      { name: "Kirkland Eggs (24ct)", price: 4.99, category: "Dairy & Eggs", badge: "Best Value" },
      { name: "Organic Milk (2 gal)", price: 7.49, category: "Dairy & Eggs" },
      { name: "Rotisserie Chicken", price: 4.99, category: "Meat", badge: "Fan Favorite" },
      { name: "Bananas (3 lb)", price: 1.49, category: "Produce" },
      { name: "Kirkland Olive Oil (2L)", price: 12.99, category: "Pantry" },
      { name: "Mixed Berries (4 lb)", price: 9.99, category: "Produce", discount: 15 },
    ],
    deals: [
      { name: "Salmon Fillets (3 lb)", original: 24.99, sale: 18.99, ends: "5 days" },
      { name: "Almond Butter (26oz)", original: 8.99, sale: 6.49, ends: "3 days" },
    ],
  },
  "whole-foods": {
    name: "Whole Foods", type: "Organic Grocery", distance: "1.8 mi", rating: 4.4,
    cartPrice: 95.60, savings: 8.40, items: 35,
    popular: ["Organic Produce", "Supplements", "Deli"],
    tags: ["Best Healthy Option", "Premium"],
    delivery: true, pickup: true,
    address: "555 Green Way, Springfield, IL 62704",
    hours: "8:00 AM – 10:00 PM",
    phone: "(217) 555-0421",
    products: [
      { name: "Organic Pasture-Raised Eggs", price: 5.99, category: "Dairy & Eggs", badge: "Organic" },
      { name: "365 Organic Whole Milk", price: 4.99, category: "Dairy & Eggs" },
      { name: "Organic Sourdough", price: 4.49, category: "Bakery" },
      { name: "Grass-Fed Ground Beef (1 lb)", price: 7.99, category: "Meat" },
      { name: "Organic Baby Kale (5oz)", price: 3.49, category: "Produce" },
      { name: "Kombucha (16oz)", price: 3.29, category: "Beverages", badge: "Popular" },
    ],
    deals: [
      { name: "Organic Avocados (4ct)", original: 5.99, sale: 3.99, ends: "2 days" },
      { name: "365 Greek Yogurt (32oz)", original: 5.49, sale: 3.99, ends: "4 days" },
    ],
  },
  kroger: {
    name: "Kroger", type: "Supermarket", distance: "0.9 mi", rating: 4.1,
    cartPrice: 71.25, savings: 19.75, items: 48,
    popular: ["Dairy", "Baked Goods", "Beverages"],
    tags: ["Best for Savings"],
    delivery: true, pickup: true,
    address: "222 Market St, Springfield, IL 62704",
    hours: "7:00 AM – 10:00 PM",
    phone: "(217) 555-0189",
    products: [
      { name: "Kroger Eggs (12ct)", price: 2.59, category: "Dairy & Eggs", discount: 10 },
      { name: "Kroger Milk (1 gal)", price: 3.19, category: "Dairy & Eggs" },
      { name: "Kroger White Bread", price: 1.49, category: "Bakery" },
      { name: "Chicken Thighs (1 lb)", price: 2.99, category: "Meat", badge: "Great Deal" },
      { name: "Broccoli Crown", price: 1.69, category: "Produce" },
      { name: "Kroger Butter (1 lb)", price: 3.49, category: "Dairy & Eggs" },
      { name: "Canned Beans (15oz)", price: 0.89, category: "Pantry" },
      { name: "Orange Juice (64oz)", price: 3.29, category: "Beverages" },
    ],
    deals: [
      { name: "Family Pack Chicken Breast", original: 11.99, sale: 7.99, ends: "3 days" },
      { name: "Kroger Ice Cream (48oz)", original: 4.99, sale: 2.99, ends: "5 days" },
      { name: "Bag Salad Mix", original: 3.49, sale: 1.99, ends: "2 days" },
    ],
  },
};

export default function StoreDetail() {
  const { slug } = useParams<{ slug: string }>();
  const store = slug ? storesData[slug] : null;

  if (!store) {
    return (
      <PublicLayout>
        <div className="container px-4 md:px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Store Not Found</h1>
          <p className="text-muted-foreground mb-6">We couldn't find the store you're looking for.</p>
          <Button asChild>
            <Link to="/stores">Back to Stores</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const categories = [...new Set(store.products.map((p) => p.category))];

  return (
    <PublicLayout>
      <div className="container px-4 md:px-6 py-8">
        {/* Back */}
        <Link to="/stores" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Stores
        </Link>

        {/* Header */}
        <div className="bg-card border border-border rounded-xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <ShoppingBag className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{store.name}</h1>
                <p className="text-muted-foreground">{store.type}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {store.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg px-3 py-1.5">
              <Star className="h-4 w-4 fill-warning text-warning" />
              <span className="font-semibold text-foreground">{store.rating}</span>
              <span className="text-sm text-muted-foreground">/5</span>
            </div>
          </div>

          {/* Info Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span>{store.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span>{store.hours}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 shrink-0" />
              <span>{store.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {store.delivery && <span className="flex items-center gap-1"><Truck className="h-4 w-4" />Delivery</span>}
              {store.pickup && <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4" />Pickup</span>}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: DollarSign, label: "Cart Total", value: `$${store.cartPrice.toFixed(2)}` },
            { icon: TrendingDown, label: "Weekly Savings", value: `$${store.savings.toFixed(2)}` },
            { icon: ShoppingBag, label: "Products", value: `${store.items}+` },
            { icon: MapPin, label: "Distance", value: store.distance },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <stat.icon className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Products */}
          <div className="lg:col-span-2 space-y-6">
            {categories.map((cat) => (
              <div key={cat} className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-4">{cat}</h3>
                <div className="space-y-2">
                  {store.products
                    .filter((p) => p.category === cat)
                    .map((product) => (
                      <div key={product.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span className="text-sm text-foreground">{product.name}</span>
                          {product.badge && (
                            <Badge variant="secondary" className="text-[10px]">{product.badge}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {product.discount && (
                            <span className="text-xs text-destructive font-medium">-{product.discount}%</span>
                          )}
                          <span className="text-sm font-semibold text-foreground">${product.price.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar – Deals */}
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-primary" /> Current Deals
              </h3>
              <div className="space-y-3">
                {store.deals.map((deal) => (
                  <div key={deal.name} className="bg-primary/5 rounded-lg p-3">
                    <p className="text-sm font-medium text-foreground">{deal.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground line-through">${deal.original.toFixed(2)}</span>
                      <span className="text-sm font-bold text-primary">${deal.sale.toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Ends in {deal.ends}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Heart className="h-4 w-4" /> Popular Items
              </h3>
              <div className="flex flex-wrap gap-2">
                {store.popular.map((item) => (
                  <span key={item} className="text-xs bg-accent rounded-full px-3 py-1.5 text-accent-foreground">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <Button className="w-full rounded-lg" size="lg" asChild>
              <Link to="/compare">Compare Prices</Link>
            </Button>

            {/* Store Reviews */}
            <StoreReviews storeName={store.name} />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
