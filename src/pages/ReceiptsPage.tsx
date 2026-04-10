import { useState, useEffect } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, Plus, Trash2, Loader2, DollarSign, Calendar, ShoppingBag, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type ReceiptType = {
  id: string;
  store: string;
  purchase_date: string;
  total: number;
  notes: string;
  items: ReceiptItem[];
};

type ReceiptItem = {
  id: string;
  receipt_id: string;
  product_name: string;
  price: number;
  quantity: number;
};

const stores = ["Aldi", "Trader Joe's", "Walmart", "Costco", "Whole Foods", "Kroger", "Other"];

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Form state
  const [store, setStore] = useState("Aldi");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = useState<{ name: string; price: string; quantity: string }[]>([
    { name: "", price: "", quantity: "1" },
  ]);

  const fetchReceipts = async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data: receiptData } = await supabase
      .from("receipts")
      .select("*")
      .eq("user_id", user.id)
      .order("purchase_date", { ascending: false });

    if (receiptData && receiptData.length > 0) {
      const { data: itemData } = await supabase
        .from("receipt_items")
        .select("*")
        .in("receipt_id", receiptData.map(r => r.id));

      setReceipts(receiptData.map(r => ({
        ...r,
        total: Number(r.total),
        items: (itemData || []).filter(i => i.receipt_id === r.id).map(i => ({ ...i, price: Number(i.price) })),
      })));
    } else {
      setReceipts([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchReceipts(); }, [user]);

  const addItemRow = () => setItems(prev => [...prev, { name: "", price: "", quantity: "1" }]);
  const removeItemRow = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: string, value: string) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const total = items.reduce((s, i) => s + (parseFloat(i.price) || 0) * (parseInt(i.quantity) || 1), 0);

  const handleSubmit = async () => {
    if (!user) { toast({ title: "Please sign in to log receipts" }); return; }
    const validItems = items.filter(i => i.name.trim() && parseFloat(i.price) > 0);
    if (validItems.length === 0) { toast({ title: "Add at least one item" }); return; }

    setSubmitting(true);
    const { data: receipt, error } = await supabase.from("receipts").insert({
      user_id: user.id,
      store,
      purchase_date: purchaseDate,
      total,
    }).select().single();

    if (error || !receipt) {
      toast({ title: "Error saving receipt", description: error?.message, variant: "destructive" });
      setSubmitting(false);
      return;
    }

    await supabase.from("receipt_items").insert(
      validItems.map(i => ({
        receipt_id: receipt.id,
        product_name: i.name.trim(),
        price: parseFloat(i.price),
        quantity: parseInt(i.quantity) || 1,
      }))
    );

    toast({ title: "Receipt saved!", description: `${validItems.length} items logged` });
    setShowForm(false);
    setItems([{ name: "", price: "", quantity: "1" }]);
    fetchReceipts();
    setSubmitting(false);
  };

  const deleteReceipt = async (id: string) => {
    await supabase.from("receipts").delete().eq("id", id);
    toast({ title: "Receipt deleted" });
    fetchReceipts();
  };

  const totalSpent = receipts.reduce((s, r) => s + r.total, 0);
  const avgPerTrip = receipts.length ? totalSpent / receipts.length : 0;

  return (
    <PublicLayout>
      <div className="container px-4 md:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Receipt Scanner</h1>
            <p className="text-muted-foreground mt-1">Log your purchases and build a personal price database</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1.5" />
            {showForm ? "Cancel" : "Log Receipt"}
          </Button>
        </div>

        {!user && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">Sign in to start logging your receipts and tracking spending.</p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {receipts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Receipt, label: "Total Receipts", value: receipts.length.toString() },
              { icon: DollarSign, label: "Total Spent", value: `$${totalSpent.toFixed(2)}` },
              { icon: ShoppingBag, label: "Avg per Trip", value: `$${avgPerTrip.toFixed(2)}` },
              { icon: Package, label: "Items Logged", value: receipts.reduce((s, r) => s + r.items.length, 0).toString() },
            ].map(stat => (
              <Card key={stat.label}>
                <CardContent className="p-4 text-center">
                  <stat.icon className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* New Receipt Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Log a New Receipt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm">Store</Label>
                  <Select value={store} onValueChange={setStore}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {stores.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Purchase Date</Label>
                  <Input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} className="mt-1" />
                </div>
              </div>

              <div>
                <Label className="text-sm mb-2 block">Items</Label>
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input placeholder="Item name" value={item.name} onChange={e => updateItem(idx, "name", e.target.value)} className="flex-1" />
                      <Input placeholder="Price" type="number" step="0.01" value={item.price} onChange={e => updateItem(idx, "price", e.target.value)} className="w-24" />
                      <Input placeholder="Qty" type="number" value={item.quantity} onChange={e => updateItem(idx, "quantity", e.target.value)} className="w-16" />
                      {items.length > 1 && (
                        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => removeItemRow(idx)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-2" onClick={addItemRow}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Item
                </Button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-sm text-muted-foreground">Estimated Total</span>
                <span className="text-lg font-bold text-primary">${total.toFixed(2)}</span>
              </div>

              <Button onClick={handleSubmit} disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Receipt className="h-4 w-4 mr-1.5" />}
                Save Receipt
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Receipt List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : receipts.length === 0 ? (
          <div className="text-center py-16">
            <Receipt className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No receipts logged yet. Start by clicking "Log Receipt" above.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {receipts.map(receipt => (
              <Card key={receipt.id} className="hover:shadow-lg transition-all hover:-translate-y-0.5">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{receipt.store}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(receipt.purchase_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">${receipt.total.toFixed(2)}</p>
                      <Badge variant="secondary" className="text-[10px]">{receipt.items.length} items</Badge>
                    </div>
                  </div>

                  <div className="space-y-1 mb-3">
                    {receipt.items.slice(0, 4).map(item => (
                      <div key={item.id} className="flex justify-between text-xs">
                        <span className="text-muted-foreground truncate flex-1">{item.product_name}</span>
                        <span className="text-foreground font-medium ml-2">
                          ${item.price.toFixed(2)}{item.quantity > 1 ? ` ×${item.quantity}` : ""}
                        </span>
                      </div>
                    ))}
                    {receipt.items.length > 4 && (
                      <p className="text-[10px] text-muted-foreground">+{receipt.items.length - 4} more items</p>
                    )}
                  </div>

                  <Button variant="ghost" size="sm" className="w-full text-xs text-destructive hover:text-destructive" onClick={() => deleteReceipt(receipt.id)}>
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
