import { useState, useEffect } from "react";
import { Star, Send, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type Review = {
  id: string;
  user_id: string;
  store_name: string;
  price_accuracy: number;
  freshness: number;
  checkout_speed: number;
  cleanliness: number;
  comment: string;
  created_at: string;
};

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`h-4 w-4 cursor-${readonly ? "default" : "pointer"} transition-colors ${
            i <= (hover || value) ? "fill-warning text-warning" : "text-muted-foreground/30"
          }`}
          onMouseEnter={() => !readonly && setHover(i)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => onChange?.(i)}
        />
      ))}
    </div>
  );
}

export function StoreReviews({ storeName }: { storeName: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ price_accuracy: 3, freshness: 3, checkout_speed: 3, cleanliness: 3, comment: "" });
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("store_reviews")
      .select("*")
      .eq("store_name", storeName)
      .order("created_at", { ascending: false });
    if (data) setReviews(data);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, [storeName]);

  const avgRating = (field: keyof Pick<Review, "price_accuracy" | "freshness" | "checkout_speed" | "cleanliness">) =>
    reviews.length ? (reviews.reduce((s, r) => s + r[field], 0) / reviews.length).toFixed(1) : "–";

  const overallAvg = reviews.length
    ? (reviews.reduce((s, r) => s + (r.price_accuracy + r.freshness + r.checkout_speed + r.cleanliness) / 4, 0) / reviews.length).toFixed(1)
    : "–";

  const handleSubmit = async () => {
    if (!user) { toast({ title: "Please sign in to leave a review" }); return; }
    setSubmitting(true);
    const { error } = await supabase.from("store_reviews").insert({
      user_id: user.id,
      store_name: storeName,
      ...form,
    });
    if (error) {
      toast({ title: "Error submitting review", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review submitted!" });
      setShowForm(false);
      setForm({ price_accuracy: 3, freshness: 3, checkout_speed: 3, cleanliness: 3, comment: "" });
      fetchReviews();
    }
    setSubmitting(false);
  };

  const categories = [
    { key: "price_accuracy" as const, label: "Price Accuracy" },
    { key: "freshness" as const, label: "Freshness" },
    { key: "checkout_speed" as const, label: "Checkout Speed" },
    { key: "cleanliness" as const, label: "Cleanliness" },
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Star className="h-4 w-4 text-warning" /> Customer Reviews
        </h3>
        <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Write Review"}
        </Button>
      </div>

      {/* Averages */}
      {reviews.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-muted/50 rounded-lg p-3 text-center col-span-2">
            <p className="text-2xl font-bold text-foreground">{overallAvg}</p>
            <p className="text-xs text-muted-foreground">{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
          </div>
          {categories.map(c => (
            <div key={c.key} className="bg-muted/50 rounded-lg p-2 text-center">
              <p className="text-sm font-semibold text-foreground">{avgRating(c.key)}</p>
              <p className="text-[10px] text-muted-foreground">{c.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="border border-border rounded-lg p-4 mb-4 space-y-3">
          {categories.map(c => (
            <div key={c.key} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <StarRating value={form[c.key]} onChange={v => setForm(prev => ({ ...prev, [c.key]: v }))} />
            </div>
          ))}
          <Textarea
            placeholder="Share your experience (optional)..."
            value={form.comment}
            onChange={e => setForm(prev => ({ ...prev, comment: e.target.value }))}
            className="text-sm"
            rows={3}
          />
          <Button size="sm" onClick={handleSubmit} disabled={submitting} className="w-full">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Send className="h-4 w-4 mr-1.5" />}
            Submit Review
          </Button>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {reviews.map(r => (
            <div key={r.id} className="border-b border-border pb-3 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-3 w-3 text-muted-foreground" />
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
                <StarRating value={Math.round((r.price_accuracy + r.freshness + r.checkout_speed + r.cleanliness) / 4)} readonly />
              </div>
              {r.comment && <p className="text-sm text-foreground ml-8">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
