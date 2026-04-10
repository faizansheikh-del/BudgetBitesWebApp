import { useState, useEffect, useCallback } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Share2, Trash2, Copy, Users, ShoppingCart, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function SharedListsPage() {
  const { user } = useAuth();
  const [lists, setLists] = useState<any[]>([]);
  const [activeList, setActiveList] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create list
  const [createOpen, setCreateOpen] = useState(false);
  const [listName, setListName] = useState("");

  // Join list
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  // Add item
  const [itemName, setItemName] = useState("");
  const [itemQty, setItemQty] = useState("1");
  const [itemUnit, setItemUnit] = useState("unit");

  useEffect(() => {
    if (user) loadLists();
    else setLoading(false);
  }, [user]);

  async function loadLists() {
    setLoading(true);
    const { data } = await supabase.from("shared_lists").select("*").order("created_at", { ascending: false });
    setLists(data || []);
    setLoading(false);
  }

  async function openList(list: any) {
    setActiveList(list);
    const { data } = await supabase
      .from("shared_list_items")
      .select("*")
      .eq("list_id", list.id)
      .order("created_at", { ascending: true });
    setItems(data || []);

    // Subscribe to realtime
    const channel = supabase
      .channel(`list-${list.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "shared_list_items", filter: `list_id=eq.${list.id}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setItems((prev) => [...prev, payload.new]);
          } else if (payload.eventType === "UPDATE") {
            setItems((prev) => prev.map((i) => i.id === payload.new.id ? payload.new : i));
          } else if (payload.eventType === "DELETE") {
            setItems((prev) => prev.filter((i) => i.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }

  async function createList() {
    if (!user || !listName.trim()) return;
    const { data, error } = await supabase
      .from("shared_lists")
      .insert({ name: listName.trim(), owner_id: user.id })
      .select()
      .single();
    if (error) { toast.error("Failed to create list"); return; }
    // Also add self as member
    if (data) {
      await supabase.from("shared_list_members").insert({ list_id: data.id, user_id: user.id });
      setLists((prev) => [data, ...prev]);
    }
    setListName("");
    setCreateOpen(false);
    toast.success("List created!");
  }

  async function joinList() {
    if (!user || !joinCode.trim()) return;
    // Find list by invite code
    const { data: list } = await supabase
      .from("shared_lists")
      .select("*")
      .eq("invite_code", joinCode.trim())
      .maybeSingle();
    if (!list) { toast.error("Invalid invite code"); return; }
    const { error } = await supabase.from("shared_list_members").insert({ list_id: list.id, user_id: user.id });
    if (error?.code === "23505") { toast.info("Already a member"); return; }
    if (error) { toast.error("Failed to join"); return; }
    setLists((prev) => [list, ...prev]);
    setJoinCode("");
    setJoinOpen(false);
    toast.success(`Joined "${list.name}"!`);
  }

  async function addItem() {
    if (!user || !activeList || !itemName.trim()) return;
    const qty = parseFloat(itemQty) || 1;
    await supabase.from("shared_list_items").insert({
      list_id: activeList.id,
      product_name: itemName.trim(),
      quantity: qty,
      unit: itemUnit,
      added_by: user.id,
    });
    setItemName("");
    setItemQty("1");
    setItemUnit("unit");
  }

  async function toggleItem(item: any) {
    await supabase.from("shared_list_items").update({ checked: !item.checked }).eq("id", item.id);
  }

  async function deleteItem(id: string) {
    await supabase.from("shared_list_items").delete().eq("id", id);
  }

  async function deleteList(id: string) {
    await supabase.from("shared_lists").delete().eq("id", id);
    setLists((prev) => prev.filter((l) => l.id !== id));
    if (activeList?.id === id) setActiveList(null);
    toast.success("List deleted");
  }

  function copyInviteCode(code: string) {
    navigator.clipboard.writeText(code);
    toast.success("Invite code copied!");
  }

  if (!user) {
    return (
      <PublicLayout>
        <div className="container px-4 md:px-6 py-16 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Shared Grocery Lists</h1>
          <p className="text-muted-foreground mb-6">Sign in to create and share grocery lists.</p>
          <Button asChild><Link to="/signin">Sign In</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  // Active list view
  if (activeList) {
    const checkedCount = items.filter((i) => i.checked).length;
    return (
      <PublicLayout>
        <div className="container px-4 md:px-6 py-8 max-w-2xl">
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => setActiveList(null)}>
            <ArrowLeft className="h-4 w-4 mr-1" />Back to Lists
          </Button>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{activeList.name}</h1>
              <p className="text-sm text-muted-foreground">{checkedCount}/{items.length} items checked</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => copyInviteCode(activeList.invite_code)}>
              <Copy className="h-4 w-4 mr-1" />Code: {activeList.invite_code}
            </Button>
          </div>

          {/* Add item */}
          <div className="flex gap-2 mb-6">
            <Input placeholder="Add item..." value={itemName} onChange={(e) => setItemName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addItem()} className="flex-1" />
            <Input type="number" value={itemQty} onChange={(e) => setItemQty(e.target.value)} className="w-16" />
            <Input value={itemUnit} onChange={(e) => setItemUnit(e.target.value)} className="w-20" placeholder="unit" />
            <Button onClick={addItem}><Plus className="h-4 w-4" /></Button>
          </div>

          {/* Items */}
          <div className="space-y-2">
            {items.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No items yet. Add the first one!</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border group">
                  <Checkbox checked={item.checked} onCheckedChange={() => toggleItem(item)} />
                  <span className={`flex-1 text-sm ${item.checked ? "line-through text-muted-foreground" : "text-foreground"}`}>
                    {item.product_name}
                  </span>
                  <span className="text-xs text-muted-foreground">{item.quantity} {item.unit}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100"
                    onClick={() => deleteItem(item.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </PublicLayout>
    );
  }

  // Lists overview
  return (
    <PublicLayout>
      <div className="container px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Shared Grocery Lists</h1>
            <p className="text-muted-foreground mt-1">Collaborate in real-time with family & roommates</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
              <DialogTrigger asChild><Button variant="outline" size="sm"><Share2 className="h-4 w-4 mr-1" />Join List</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Join a Shared List</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div><Label>Invite Code</Label><Input value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder="e.g. a1b2c3d4" /></div>
                  <Button className="w-full" onClick={joinList}>Join List</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />New List</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Shared List</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div><Label>List Name</Label><Input value={listName} onChange={(e) => setListName(e.target.value)} placeholder="e.g. Weekly Groceries" /></div>
                  <Button className="w-full" onClick={createList}>Create List</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        ) : lists.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No shared lists yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Create a new list or join one with an invite code.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lists.map((list) => (
              <div key={list.id} className="bg-card rounded-xl border border-border p-5 cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => openList(list)}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-foreground">{list.name}</h3>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); deleteList(list.id); }}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />Code: {list.invite_code}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Created {new Date(list.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
