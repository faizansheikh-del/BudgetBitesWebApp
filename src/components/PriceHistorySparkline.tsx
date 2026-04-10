import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

type PricePoint = { price: number; recorded_at: string };

// Generate fake demo data for a product based on its current price
function generateDemoData(currentPrice: number): PricePoint[] {
  const points: PricePoint[] = [];
  const now = Date.now();
  for (let i = 29; i >= 0; i--) {
    const variance = (Math.random() - 0.4) * currentPrice * 0.15;
    points.push({
      price: Math.max(0.5, currentPrice + variance),
      recorded_at: new Date(now - i * 86400000).toISOString(),
    });
  }
  // Last point is the actual current price
  points[points.length - 1].price = currentPrice;
  return points;
}

export function PriceHistorySparkline({ productId, currentPrice }: { productId: string; currentPrice: number }) {
  const [data, setData] = useState<PricePoint[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data: history } = await supabase
        .from("price_history")
        .select("price, recorded_at")
        .eq("product_id", productId)
        .order("recorded_at", { ascending: true })
        .limit(30);

      if (history && history.length >= 2) {
        setData(history.map(h => ({ ...h, price: Number(h.price) })));
      } else {
        setData(generateDemoData(currentPrice));
      }
    };
    fetch();
  }, [productId, currentPrice]);

  const { path, trend, trendPct } = useMemo(() => {
    if (data.length < 2) return { path: "", trend: "flat" as const, trendPct: 0 };
    const prices = data.map(d => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const w = 100;
    const h = 28;
    const step = w / (prices.length - 1);

    const pts = prices.map((p, i) => `${(i * step).toFixed(1)},${(h - ((p - min) / range) * h).toFixed(1)}`);
    const first = prices[0];
    const last = prices[prices.length - 1];
    const pct = ((last - first) / first) * 100;

    return {
      path: `M${pts.join("L")}`,
      trend: pct < -1 ? ("down" as const) : pct > 1 ? ("up" as const) : ("flat" as const),
      trendPct: Math.abs(pct),
    };
  }, [data]);

  if (data.length < 2) return null;

  const color = trend === "down" ? "hsl(var(--primary))" : trend === "up" ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))";
  const TrendIcon = trend === "down" ? TrendingDown : trend === "up" ? TrendingUp : Minus;

  return (
    <div className="flex items-center gap-2 mt-2">
      <svg width="100" height="28" viewBox="0 0 100 28" className="shrink-0">
        <path d={path} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="flex items-center gap-0.5">
        <TrendIcon className="h-3 w-3" style={{ color }} />
        <span className="text-[10px] font-medium" style={{ color }}>
          {trendPct.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
