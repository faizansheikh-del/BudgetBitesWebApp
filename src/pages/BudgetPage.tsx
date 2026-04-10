import { useState, useEffect, useMemo } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DollarSign, TrendingDown, ShoppingCart, Target, Plus, Trash2, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const CATEGORIES = ["Dairy & Eggs", "Meat & Poultry", "Produce", "Pantry", "Bakery", "Beverages", "Snacks", "Other"];
const CATEGORY_COLORS = [
  "bg-primary", "bg-blue-500", "bg-green-500", "bg-yellow-500",
  "bg-red-500", "bg-purple-500", "bg-orange-500", "bg-muted-foreground",
];

function getMonthStart(d: Date = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function getWeekOfMonth(dateStr: string) {
  const d = new Date(dateStr);
  return Math.ceil(d.getDate() / 7);
}

export default function BudgetPage() {
  const { user } = useAuth();
  const [budget, setBudget] = useState<{ id: string; amount: number } | null>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [budgetAmount, setBudgetAmount] = useState("350");
  const [editingBudget, setEditingBudget] = useState(false);

  // Expense form
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expDesc, setExpDesc] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expCategory, setExpCategory] = useState("Other");
  const [expDate, setExpDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const monthStart = getMonthStart();

  // Fetch budget + expenses
  useEffect(() => {
    if (!user) { setLoading(false); return; }
    async function load() {
      setLoading(true);
      const { data: b } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user!.id)
        .eq("month", monthStart)
        .maybeSingle();

      if (b) {
        setBudget({ id: b.id, amount: Number(b.amount) });
        setBudgetAmount(String(b.amount));
        const { data: exps } = await supabase
          .from("budget_expenses")
          .select("*")
          .eq("budget_id", b.id)
          .order("expense_date", { ascending: false });
        setExpenses(exps || []);
      } else {
        setBudget(null);
        setExpenses([]);
      }
      setLoading(false);
    }
    load();
  }, [user, monthStart]);

  // Create or update budget
  async function saveBudget() {
    if (!user) return;
    const amt = parseFloat(budgetAmount);
    if (isNaN(amt) || amt <= 0) { toast.error("Enter a valid budget"); return; }

    if (budget) {
      await supabase.from("budgets").update({ amount: amt }).eq("id", budget.id);
      setBudget({ ...budget, amount: amt });
    } else {
      const { data, error } = await supabase
        .from("budgets")
        .insert({ user_id: user.id, month: monthStart, amount: amt })
        .select()
        .single();
      if (data) setBudget({ id: data.id, amount: Number(data.amount) });
      if (error) { toast.error("Failed to create budget"); return; }
    }
    setEditingBudget(false);
    toast.success("Budget saved");
  }

  // Add expense
  async function addExpense() {
    if (!user || !budget) return;
    const amt = parseFloat(expAmount);
    if (!expDesc.trim() || isNaN(amt) || amt <= 0) { toast.error("Fill in all fields"); return; }
    setSaving(true);
    const { data, error } = await supabase
      .from("budget_expenses")
      .insert({ user_id: user.id, budget_id: budget.id, description: expDesc.trim(), amount: amt, category: expCategory, expense_date: expDate })
      .select()
      .single();
    setSaving(false);
    if (error) { toast.error("Failed to add expense"); return; }
    if (data) setExpenses((prev) => [data, ...prev]);
    setExpDesc(""); setExpAmount(""); setExpCategory("Other"); setExpDate(new Date().toISOString().slice(0, 10));
    setExpenseOpen(false);
    toast.success("Expense added");
  }

  // Delete expense
  async function deleteExpense(id: string) {
    await supabase.from("budget_expenses").delete().eq("id", id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    toast.success("Expense deleted");
  }

  // Derived stats
  const totalSpent = useMemo(() => expenses.reduce((s, e) => s + Number(e.amount), 0), [expenses]);
  const monthlyBudget = budget?.amount ?? parseFloat(budgetAmount) || 350;
  const remaining = monthlyBudget - totalSpent;
  const pct = monthlyBudget > 0 ? Math.min(Math.round((totalSpent / monthlyBudget) * 100), 100) : 0;

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => { map[e.category] = (map[e.category] || 0) + Number(e.amount); });
    return Object.entries(map)
      .map(([name, spent]) => ({ name, spent, pct: totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0 }))
      .sort((a, b) => b.spent - a.spent);
  }, [expenses, totalSpent]);

  const weeklyBreakdown = useMemo(() => {
    const weeks: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0 };
    expenses.forEach((e) => { const w = Math.min(getWeekOfMonth(e.expense_date), 4); weeks[w] += Number(e.amount); });
    const weeklyBudget = monthlyBudget / 4;
    return [1, 2, 3, 4].map((w) => ({ week: `Week ${w}`, spent: weeks[w], budget: weeklyBudget }));
  }, [expenses, monthlyBudget]);

  if (!user) {
    return (
      <PublicLayout>
        <div className="container px-4 md:px-6 py-16 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Budget Tracker</h1>
          <p className="text-muted-foreground mb-6">Sign in to start tracking your grocery budget.</p>
          <Button asChild><Link to="/signin">Sign In</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="container px-4 md:px-6 py-16 text-center">
          <p className="text-muted-foreground">Loading budget...</p>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Budget Tracker</h1>
            <p className="text-muted-foreground mt-1">
              {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex gap-2">
            {budget && (
              <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Expense</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
                  <div className="space-y-4 pt-2">
                    <div><Label>Description</Label><Input value={expDesc} onChange={(e) => setExpDesc(e.target.value)} placeholder="e.g. Chicken breast" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label>Amount ($)</Label><Input type="number" step="0.01" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} placeholder="0.00" /></div>
                      <div><Label>Date</Label><Input type="date" value={expDate} onChange={(e) => setExpDate(e.target.value)} /></div>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={expCategory} onValueChange={setExpCategory}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full" onClick={addExpense} disabled={saving}>{saving ? "Saving..." : "Add Expense"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Budget setup */}
        {(!budget || editingBudget) && (
          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <h3 className="font-semibold text-foreground mb-3">{budget ? "Edit Monthly Budget" : "Set Your Monthly Budget"}</h3>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Label>Budget Amount ($)</Label>
                <Input type="number" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} placeholder="350" />
              </div>
              <Button onClick={saveBudget}>Save</Button>
              {editingBudget && <Button variant="ghost" onClick={() => setEditingBudget(false)}>Cancel</Button>}
            </div>
          </div>
        )}

        {budget && (
          <>
            {/* Top summary cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Monthly Budget", value: `$${monthlyBudget.toFixed(0)}`, icon: Target, action: () => setEditingBudget(true) },
                { label: "Total Spent", value: `$${totalSpent.toFixed(2)}`, icon: ShoppingCart },
                { label: "Remaining", value: `$${remaining.toFixed(2)}`, icon: DollarSign },
                { label: "Avg. Weekly", value: `$${(totalSpent / 4).toFixed(2)}`, icon: TrendingDown },
              ].map((card) => (
                <div key={card.label} className="bg-card rounded-xl border border-border p-5 cursor-pointer hover:border-primary/30 transition-colors" onClick={card.action}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">{card.label}</span>
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <card.icon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{card.value}</p>
                  {card.action && <p className="text-xs text-primary mt-1 flex items-center gap-1"><Pencil className="h-3 w-3" />Edit</p>}
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Spending Progress */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Spending Progress</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">${totalSpent.toFixed(2)} of ${monthlyBudget.toFixed(0)}</span>
                    <span className="text-sm font-medium text-foreground">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-3 rounded-full" />
                  <p className={`text-xs mt-2 font-medium ${remaining > 0 ? "text-primary" : "text-destructive"}`}>
                    {remaining > 0 ? `$${remaining.toFixed(2)} remaining` : `$${Math.abs(remaining).toFixed(2)} over budget!`}
                  </p>
                </div>

                {/* Weekly breakdown */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Weekly Breakdown</h3>
                  <div className="space-y-4">
                    {weeklyBreakdown.map((w) => (
                      <div key={w.week}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{w.week}</span>
                          <span className="font-medium text-foreground">${w.spent.toFixed(2)}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${w.spent > w.budget ? "bg-destructive" : "bg-primary"}`}
                            style={{ width: `${w.budget > 0 ? Math.min((w.spent / w.budget) * 100, 100) : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category breakdown */}
                {categoryBreakdown.length > 0 && (
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-semibold text-foreground mb-4">Spending by Category</h3>
                    <div className="space-y-3">
                      {categoryBreakdown.map((cat, i) => (
                        <div key={cat.name} className="flex items-center gap-3">
                          <div className={`h-3 w-3 rounded-full ${CATEGORY_COLORS[CATEGORIES.indexOf(cat.name)] || CATEGORY_COLORS[7]}`} />
                          <span className="text-sm text-foreground flex-1">{cat.name}</span>
                          <span className="text-sm text-muted-foreground">${cat.spent.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground w-10 text-right">{cat.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recent expenses */}
              <div className="space-y-6">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Recent Expenses</h3>
                  {expenses.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No expenses yet. Add your first one!</p>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {expenses.map((e) => (
                        <div key={e.id} className="flex items-center gap-2 p-2.5 bg-muted/50 rounded-lg group">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{e.description}</p>
                            <p className="text-xs text-muted-foreground">{e.category} · {new Date(e.expense_date).toLocaleDateString()}</p>
                          </div>
                          <span className="text-sm font-semibold text-foreground">${Number(e.amount).toFixed(2)}</span>
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteExpense(e.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </PublicLayout>
  );
}
