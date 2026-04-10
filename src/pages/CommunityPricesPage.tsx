import { useState, useEffect } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ThumbsUp, Plus, MapPin, Clock, TrendingUp, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const STORES = ["Aldi", "Lidl", "Walmart", "Costco", "Kroger", "Target", "Whole Foods", "Trader Joe's", "Other"];

export default function CommunityPricesPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [votes, setVotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStore, setFilterStore] = useState("all");

  // Form
  const [productName, setProductName] = useState("");
  const [store, setStore] = useState("");
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadReports();
  }, [user]);

  async function loadReports() {
    setLoading(true);
    const { data } = await supabase
      .from("community_prices")
      .select("*")
      .order("created_at", { ascending: false });
    setReports(data || []);

    if (user) {
      const { data: v } = await supabase
        .from("price_votes")
        .select("price_report_id")
        .eq("user_id", user.id);
      setVotes(new Set((v || []).map((x: any) => x.price_report_id)));
    }
    setLoading(false);
  }

  async function submitReport() {
    if (!user) return;
    const amt = parseFloat(price);
    if (!productName.trim() || !store || isNaN(amt) || amt <= 0) {
      toast.error("Please fill in all fields");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("community_prices")
      .insert({ product_name: productName.trim(), store, price: amt, reported_by: user.id })
      .select()
      .single();
    setSaving(false);
    if (error) { toast.error("Failed to submit"); return; }
    if (data) setReports((prev) => [data, ...prev]);
    setProductName(""); setStore(""); setPrice("");
    setOpen(false);
    toast.success("Price report submitted!");
  }

  async function toggleVote(reportId: string) {
    if (!user) { toast.error("Sign in to vote"); return; }
    const { data: voted } = await supabase.rpc("toggle_price_vote", { p_report_id: reportId });
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId ? { ...r, upvotes: r.upvotes + (voted ? 1 : -1) } : r
      )
    );
    setVotes((prev) => {
      const next = new Set(prev);
      voted ? next.add(reportId) : next.delete(reportId);
      return next;
    });
  }

  const filtered = reports.filter((r) => {
    const matchSearch = !search || r.product_name.toLowerCase().includes(search.toLowerCase());
    const matchStore = filterStore === "all" || r.store === filterStore;
    return matchSearch && matchStore;
  });

  const uniqueStores = [...new Set(reports.map((r) => r.store))];

  if (!user) {
    return (
      <PublicLayout>
        <div className="container px-4 md:px-6 py-16 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Community Price Reports</h1>
          <p className="text-muted-foreground mb-6">Sign in to submit and vote on prices.</p>
          <Button asChild><Link to="/signin">Sign In</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Community Price Reports</h1>
            <p className="text-muted-foreground mt-1">Crowdsourced prices — verified by upvotes</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" />Report Price</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Report a Price</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div><Label>Product Name</Label><Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Organic Milk 1 Gallon" /></div>
                <div>
                  <Label>Store</Label>
                  <Select value={store} onValueChange={setStore}>
                    <SelectTrigger><SelectValue placeholder="Select store" /></SelectTrigger>
                    <SelectContent>{STORES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Price ($)</Label><Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" /></div>
                <Button className="w-full" onClick={submitReport} disabled={saving}>{saving ? "Submitting..." : "Submit Report"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Reports", value: reports.length, icon: TrendingUp },
            { label: "Unique Stores", value: uniqueStores.length, icon: MapPin },
            { label: "Contributors", value: new Set(reports.map((r) => r.reported_by)).size, icon: Users },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <s.icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
          <Select value={filterStore} onValueChange={setFilterStore}>
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              {uniqueStores.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Reports grid */}
        {loading ? (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <p className="text-muted-foreground">No price reports yet. Be the first to submit one!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <div key={r.id} className="bg-card rounded-xl border border-border p-5 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{r.product_name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                      <MapPin className="h-3 w-3" />
                      {r.store}
                    </div>
                  </div>
                  <span className="text-xl font-bold text-primary">${Number(r.price).toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(r.created_at).toLocaleDateString()}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn("gap-1", votes.has(r.id) && "text-primary")}
                    onClick={() => toggleVote(r.id)}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {r.upvotes}
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
