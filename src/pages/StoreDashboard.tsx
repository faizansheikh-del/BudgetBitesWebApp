import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Package, Tag, TrendingUp, Eye, Plus, Edit2, Trash2, Upload, BarChart3
} from "lucide-react";

const overviewCards = [
  { label: "Total Products", value: "124", icon: Package, change: "+8 this week" },
  { label: "Active Discounts", value: "18", icon: Tag, change: "3 expiring soon" },
  { label: "Price Updates", value: "42", icon: TrendingUp, change: "This month" },
  { label: "Customer Views", value: "3,847", icon: Eye, change: "+12% vs last week" },
];

const products = [
  { id: 1, name: "Organic Free-Range Eggs 12pk", category: "Dairy & Eggs", price: 4.99, status: "Active", updated: "2h ago" },
  { id: 2, name: "Whole Wheat Bread Loaf", category: "Bakery", price: 2.49, status: "Active", updated: "1d ago" },
  { id: 3, name: "Chicken Breast Boneless 1lb", category: "Meat", price: 5.49, status: "On Sale", updated: "3h ago" },
  { id: 4, name: "Organic Whole Milk 1gal", category: "Dairy & Eggs", price: 5.79, status: "Active", updated: "5h ago" },
  { id: 5, name: "Baby Spinach 5oz", category: "Produce", price: 3.99, status: "Low Stock", updated: "12h ago" },
  { id: 6, name: "Greek Yogurt 32oz", category: "Dairy & Eggs", price: 5.99, status: "Active", updated: "2d ago" },
  { id: 7, name: "Basmati Rice 5lb Bag", category: "Grains", price: 8.99, status: "On Sale", updated: "6h ago" },
  { id: 8, name: "Peanut Butter Natural 16oz", category: "Pantry", price: 3.29, status: "Active", updated: "1d ago" },
];

export default function StoreDashboard() {
  return (
    <PublicLayout>
      <div className="container px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Store Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage your products, pricing, and promotions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-lg">
              <Upload className="h-4 w-4 mr-1.5" />Upload Sale
            </Button>
            <Button size="sm" className="rounded-lg">
              <Plus className="h-4 w-4 mr-1.5" />Add Product
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {overviewCards.map((card) => (
            <div key={card.label} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <card.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.change}</p>
            </div>
          ))}
        </div>

        {/* Insights */}
        <div className="bg-primary/5 rounded-xl border border-primary/20 p-6 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Business Insights</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="text-sm">
              <p className="text-muted-foreground">Most Viewed Product</p>
              <p className="font-medium text-foreground">Organic Free-Range Eggs</p>
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground">Best Selling Category</p>
              <p className="font-medium text-foreground">Dairy & Eggs</p>
            </div>
            <div className="text-sm">
              <p className="text-muted-foreground">Revenue Trend</p>
              <p className="font-medium text-primary">+15% this month</p>
            </div>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h3 className="font-semibold text-foreground">Product Listings</h3>
            <Input placeholder="Search products..." className="max-w-xs h-9 rounded-lg text-sm" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left font-medium text-muted-foreground p-4">Product</th>
                  <th className="text-left font-medium text-muted-foreground p-4">Category</th>
                  <th className="text-left font-medium text-muted-foreground p-4">Price</th>
                  <th className="text-left font-medium text-muted-foreground p-4">Status</th>
                  <th className="text-left font-medium text-muted-foreground p-4">Updated</th>
                  <th className="text-right font-medium text-muted-foreground p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-medium text-foreground">{p.name}</td>
                    <td className="p-4 text-muted-foreground">{p.category}</td>
                    <td className="p-4 font-medium text-foreground">${p.price.toFixed(2)}</td>
                    <td className="p-4">
                      <Badge
                        variant={p.status === "Active" ? "secondary" : p.status === "On Sale" ? "default" : "outline"}
                        className="text-xs"
                      >
                        {p.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{p.updated}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
