import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function BudgetInsights() {
  const [insights, setInsights] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchInsights() {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("budget-insights");
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      setInsights(data.insights);
    } catch (e: any) {
      toast.error(e.message || "Failed to get insights");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-primary/5 rounded-xl border border-primary/20 p-6">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">AI Budget Insights</h3>
      </div>
      {insights ? (
        <div className="text-sm text-foreground whitespace-pre-line leading-relaxed mb-3">
          {insights}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground mb-4">
          Get AI-powered analysis of your spending habits with personalized tips to save more.
        </p>
      )}
      <Button size="sm" className="w-full" onClick={fetchInsights} disabled={loading}>
        {loading ? <><Loader2 className="h-4 w-4 mr-1 animate-spin" />Analyzing...</> : insights ? "Refresh Insights" : "Generate Insights"}
      </Button>
    </div>
  );
}
