import { useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingDown, TrendingUp, Lightbulb, PiggyBank, ShoppingCart, Target } from "lucide-react";

const weeklyData = [
  { week: "Week 1", spent: 68, budget: 87.5 },
  { week: "Week 2", spent: 73, budget: 87.5 },
  { week: "Week 3", spent: 82, budget: 87.5 },
  { week: "Week 4", spent: 55, budget: 87.5 },
];

const categories = [
  { name: "Dairy & Eggs", spent: 42, pct: 22, color: "bg-primary" },
  { name: "Meat & Poultry", spent: 58, pct: 30, color: "bg-info" },
  { name: "Produce", spent: 35, pct: 18, color: "bg-success" },
  { name: "Pantry", spent: 28, pct: 15, color: "bg-warning" },
  { name: "Bakery", spent: 15, pct: 8, color: "bg-destructive" },
  { name: "Other", spent: 14, pct: 7, color: "bg-muted-foreground" },
];

const insights = [
  { icon: TrendingDown, text: "You are on track this month — $72 under budget!", color: "text-primary" },
  { icon: PiggyBank, text: "You can save $18 by switching stores for dairy products", color: "text-info" },
  { icon: ShoppingCart, text: "Your biggest spending category is Meat & Poultry", color: "text-warning" },
  { icon: Lightbulb, text: "Try buying chicken at Costco — save 40% vs. your current store", color: "text-primary" },
];

export default function BudgetPage() {
  const [monthlyBudget] = useState(350);
  const totalSpent = 278;
  const remaining = monthlyBudget - totalSpent;
  const pct = Math.round((totalSpent / monthlyBudget) * 100);

  return (
    <PublicLayout>
      <div className="container px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Budget Tracker</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage your grocery spending</p>
        </div>

        {/* Top summary cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Monthly Budget", value: `$${monthlyBudget}`, icon: Target, change: "" },
            { label: "Total Spent", value: `$${totalSpent}`, icon: ShoppingCart, change: "-12% vs last month" },
            { label: "Remaining", value: `$${remaining}`, icon: DollarSign, change: "On track" },
            { label: "Avg. Weekly", value: `$${Math.round(totalSpent / 4)}`, icon: TrendingDown, change: "-8% vs avg" },
          ].map((card) => (
            <div key={card.label} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <card.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              {card.change && <p className="text-xs text-primary mt-1">{card.change}</p>}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Budget Progress */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Spending Progress</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">${totalSpent} of ${monthlyBudget}</span>
                <span className="text-sm font-medium text-foreground">{pct}%</span>
              </div>
              <Progress value={pct} className="h-3 rounded-full" />
              <p className="text-xs text-primary mt-2 font-medium">
                {remaining > 0 ? `$${remaining} remaining — you're doing great!` : "Budget exceeded"}
              </p>
            </div>

            {/* Weekly breakdown */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Weekly Breakdown</h3>
              <div className="space-y-4">
                {weeklyData.map((w) => (
                  <div key={w.week}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{w.week}</span>
                      <span className="font-medium text-foreground">${w.spent}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${w.spent > w.budget ? "bg-destructive" : "bg-primary"}`}
                        style={{ width: `${Math.min((w.spent / w.budget) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category breakdown */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Spending by Category</h3>
              <div className="space-y-3">
                {categories.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${cat.color}`} />
                    <span className="text-sm text-foreground flex-1">{cat.name}</span>
                    <span className="text-sm text-muted-foreground">${cat.spent}</span>
                    <span className="text-xs text-muted-foreground w-10 text-right">{cat.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Smart Insights</h3>
              <div className="space-y-3">
                {insights.map((tip, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                    <tip.icon className={`h-5 w-5 shrink-0 mt-0.5 ${tip.color}`} />
                    <p className="text-sm text-foreground">{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
              <h3 className="font-semibold text-foreground mb-2">💡 Savings Tip</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Switch to Aldi for your weekly essentials and save an estimated $23.50 per week.
              </p>
              <Button size="sm" className="rounded-lg w-full">Compare Stores</Button>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
