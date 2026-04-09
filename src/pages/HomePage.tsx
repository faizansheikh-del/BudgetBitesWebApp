import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  Search, MapPin, TrendingDown, ShieldCheck, Clock, Heart,
  ArrowRight, Star, Zap, DollarSign, ShoppingCart, BarChart3, Leaf, Store
} from "lucide-react";
import groceryHeroBg from "@/assets/grocery-hero-bg.jpg";

const deals = [
  { name: "Organic Eggs (12pk)", store: "Trader Joe's", price: "$3.49", originalPrice: "$4.99", discount: "30%", distance: "0.8 mi" },
  { name: "Whole Wheat Bread", store: "Aldi", price: "$1.89", originalPrice: "$2.49", discount: "24%", distance: "1.2 mi" },
  { name: "Chicken Breast (1lb)", store: "Costco", price: "$3.29", originalPrice: "$5.49", discount: "40%", distance: "2.1 mi" },
  { name: "Organic Milk (1gal)", store: "Walmart", price: "$4.29", originalPrice: "$5.79", discount: "26%", distance: "0.5 mi" },
];

const steps = [
  { icon: Search, title: "Search Items", desc: "Search for any grocery item you need" },
  { icon: BarChart3, title: "Compare Prices", desc: "See prices across all nearby stores instantly" },
  { icon: ShoppingCart, title: "Shop & Save", desc: "Pick the best deal and start saving" },
];

const benefits = [
  { icon: TrendingDown, title: "Compare Prices Instantly", desc: "Real-time price comparison across all your local grocery stores" },
  { icon: DollarSign, title: "Track Grocery Spending", desc: "Set budgets and monitor your spending with smart insights" },
  { icon: Heart, title: "Discover Healthy Options", desc: "Find affordable, nutritious alternatives for every item" },
  { icon: Clock, title: "Save Time & Money", desc: "Stop driving between stores — find the best deals in one place" },
];

export default function HomePage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={groceryHeroBg} alt="Fresh groceries" width={1920} height={1080} className="w-full h-full object-cover saturate-[1.3] brightness-90" />
          <div className="absolute inset-0 bg-black/50 dark:bg-black/60" />
        </div>
        <div className="container px-4 md:px-6 py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary font-medium">
              <Zap className="h-3.5 w-3.5" />
              Smart Grocery Shopping
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground text-balance">
              Save More on Groceries,{" "}
              <span className="text-primary">Eat Better</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Compare grocery prices across nearby stores, discover cheaper and healthier alternatives, and stay within your budget — all in one place.
            </p>

            {/* Search Bar */}
            <div className="flex gap-2 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search milk, eggs, rice, bread..."
                  className="pl-10 h-12 rounded-xl text-base"
                />
              </div>
              <Button size="lg" className="h-12 rounded-xl px-6" asChild>
                <Link to="/compare">Search</Link>
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button variant="default" size="lg" className="rounded-xl" asChild>
                <Link to="/compare">
                  Find Cheapest Groceries
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-xl" asChild>
                <Link to="/signup">Start Saving</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Cheapest Nearby Store */}
      <section className="border-t border-border bg-muted/30">
        <div className="container px-4 md:px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Cheapest Nearby Stores</h2>
            <p className="text-muted-foreground mt-2">Based on your location, here are the most affordable options</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { name: "Aldi", distance: "1.2 mi", savings: "$23.50/week", tag: "Cheapest", color: "bg-primary" },
              { name: "Trader Joe's", distance: "0.8 mi", savings: "$18.20/week", tag: "Best Quality", color: "bg-info" },
              { name: "Walmart", distance: "0.5 mi", savings: "$15.80/week", tag: "Nearest", color: "bg-warning" },
            ].map((store) => (
              <div key={store.name} className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Store className="h-5 w-5 text-primary" />
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full text-primary-foreground ${store.color}`}>
                    {store.tag}
                  </span>
                </div>
                <h3 className="font-semibold text-lg text-foreground">{store.name}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {store.distance}
                </div>
                <p className="text-primary font-semibold mt-3">Save {store.savings}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Today's Best Deals */}
      <section className="container px-4 md:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">Today's Best Deals</h2>
            <p className="text-muted-foreground mt-1">Fresh savings updated daily</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/compare">View All</Link>
          </Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {deals.map((deal) => (
            <div key={deal.name} className="bg-card rounded-xl border border-border p-5 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                  -{deal.discount}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />{deal.distance}
                </span>
              </div>
              <h3 className="font-semibold text-foreground">{deal.name}</h3>
              <p className="text-sm text-muted-foreground">{deal.store}</p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-lg font-bold text-primary">{deal.price}</span>
                <span className="text-sm line-through text-muted-foreground">{deal.originalPrice}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border bg-muted/30">
        <div className="container px-4 md:px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">How It Works</h2>
            <p className="text-muted-foreground mt-2">Three simple steps to start saving</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-xs font-medium text-primary mb-2">Step {i + 1}</div>
                <h3 className="font-semibold text-lg text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container px-4 md:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Why Choose Budget Bites</h2>
          <p className="text-muted-foreground mt-2">Everything you need to shop smarter</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <b.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{b.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="container px-4 md:px-6 py-20">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Ready to Start Saving?</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of smart shoppers who save an average of $150/month on groceries.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" className="rounded-xl" asChild>
                <Link to="/signup">Create Free Account <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-xl" asChild>
                <Link to="/compare">Browse Deals</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
