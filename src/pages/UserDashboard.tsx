import { useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { useShoppingList } from "@/contexts/ShoppingListContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  Search, ShoppingCart, BarChart3, Store, Bell, Heart,
  TrendingDown, ArrowRight, Zap, Plus, MapPin, Star, Clock, X, Trash2
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";

const recentSearches = ["Organic Eggs", "Whole Milk", "Chicken Breast", "Avocado"];

const alternatives = [
  { current: "Horizon Milk ($5.79)", alt: "Store Brand Milk ($3.49)", save: "$2.30" },
  { current: "Dave's Bread ($3.99)", alt: "Aldi Bread ($1.89)", save: "$2.10" },
  { current: "Perdue Chicken ($5.49)", alt: "Costco Chicken ($3.29)", save: "$2.20" },
];

const notifications = [
  { text: "Eggs dropped 30% at Trader Joe's", time: "2h ago", type: "deal" },
  { text: "Your budget is 79% used this month", time: "5h ago", type: "budget" },
  { text: "New store added: Sprouts Farmers Market", time: "1d ago", type: "info" },
];

export default function UserDashboard() {
  const { items: savedList, removeItem, addManualItem, totalCost } = useShoppingList();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newQty, setNewQty] = useState("1");
  const [newPrice, setNewPrice] = useState("");

  const totalList = totalCost;

  const handleAddItem = () => {
    const name = newName.trim();
    const qty = parseInt(newQty) || 1;
    const price = parseFloat(newPrice);
    if (!name || isNaN(price) || price <= 0) return;
    addManualItem(name, qty, price);
    setNewName("");
    setNewQty("1");
    setNewPrice("");
    setDialogOpen(false);
  };

  const handleRemoveItem = (index: number) => {
    const item = savedList[index];
    if (item) removeItem(item.id);
  };

  return (
    <PublicLayout>
      <div className="container px-4 md:px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Welcome back, Sarah 👋</h1>
          <p className="text-muted-foreground mt-1">Here's your grocery savings overview</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { icon: Search, label: "Search Groceries", path: "/compare" },
            { icon: Store, label: "Compare Stores", path: "/stores" },
            { icon: BarChart3, label: "Track Budget", path: "/budget" },
            { icon: ShoppingCart, label: "Shopping List", path: "#" },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.path}
              className="bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all text-center"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <action.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{action.label}</span>
            </Link>
          ))}
        </div>

        {/* Budget Summary */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card rounded-xl border border-border p-5">
            <p className="text-sm text-muted-foreground">Monthly Budget</p>
            <p className="text-2xl font-bold text-foreground mt-1">$350.00</p>
            <p className="text-xs text-primary mt-1">On track</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <p className="text-sm text-muted-foreground">Spent This Month</p>
            <p className="text-2xl font-bold text-foreground mt-1">$278.00</p>
            <p className="text-xs text-primary mt-1">-12% vs. last month</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-5">
            <p className="text-sm text-muted-foreground">Total Saved</p>
            <p className="text-2xl font-bold text-primary mt-1">$147.30</p>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shopping List */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Shopping List</h3>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="rounded-lg text-xs">
                      <Plus className="h-3.5 w-3.5 mr-1" />Add Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add Item to Shopping List</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div>
                        <label className="text-sm font-medium text-foreground">Item Name</label>
                        <Input
                          placeholder="e.g. Organic Bananas"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-medium text-foreground">Quantity</label>
                          <Input
                            type="number"
                            min="1"
                            value={newQty}
                            onChange={(e) => setNewQty(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground">Price ($)</label>
                          <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="0.00"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <Button onClick={handleAddItem} className="w-full">
                        Add to List
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-2">
                {savedList.map((item, index) => (
                  <div key={`${item.name}-${index}`} className="flex items-center justify-between py-2 border-b border-border last:border-0 group">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-sm text-foreground">{item.name}</span>
                      {item.qty > 1 && <Badge variant="secondary" className="text-xs">x{item.qty}</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">${(item.price * item.qty).toFixed(2)}</span>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
                <span className="text-sm font-medium text-foreground">Estimated Total</span>
                <span className="text-lg font-bold text-primary">${totalList.toFixed(2)}</span>
              </div>
            </div>

            {/* Cheaper Alternatives */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">💡 Cheaper Alternatives</h3>
              <div className="space-y-3">
                {alternatives.map((alt, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                    <div className="text-sm">
                      <p className="text-muted-foreground line-through">{alt.current}</p>
                      <p className="text-foreground font-medium">{alt.alt}</p>
                    </div>
                    <Badge className="bg-primary text-primary-foreground">Save {alt.save}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Deals */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Today's Best Deals</h3>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/compare">View All</Link>
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { name: "Organic Eggs", store: "Trader Joe's", price: "$3.49", save: "30%", emoji: "🥚" },
                  { name: "Chicken Breast", store: "Costco", price: "$3.29", save: "40%", emoji: "🍗" },
                  { name: "Greek Yogurt", store: "Kroger", price: "$4.49", save: "25%", emoji: "🥣" },
                  { name: "Baby Spinach", store: "Whole Foods", price: "$2.99", save: "25%", emoji: "🥬" },
                ].map((deal) => (
                  <div key={deal.name} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <span className="text-2xl">{deal.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{deal.name}</p>
                      <p className="text-xs text-muted-foreground">{deal.store}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{deal.price}</p>
                      <p className="text-xs text-destructive">-{deal.save}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Bell className="h-4 w-4" /> Notifications
              </h3>
              <div className="space-y-3">
                {notifications.map((n, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${n.type === "deal" ? "bg-primary" : n.type === "budget" ? "bg-warning" : "bg-info"}`} />
                    <div>
                      <p className="text-foreground">{n.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Searches */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((s) => (
                  <Link key={s} to="/compare" className="text-xs bg-muted rounded-full px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    {s}
                  </Link>
                ))}
              </div>
            </div>

            {/* Favorite Stores */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Heart className="h-4 w-4" /> Favorite Stores
              </h3>
              <div className="space-y-3">
                {[
                  { name: "Aldi", distance: "1.2 mi", rating: 4.3 },
                  { name: "Trader Joe's", distance: "0.8 mi", rating: 4.7 },
                  { name: "Costco", distance: "2.1 mi", rating: 4.5 },
                ].map((store) => (
                  <div key={store.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-primary" />
                      <span className="text-sm text-foreground">{store.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-0.5"><Star className="h-3 w-3 fill-warning text-warning" />{store.rating}</span>
                      <span>{store.distance}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
