import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    if (!supabaseKey) {
      throw new Error("Supabase key not found");
    }
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch user's expenses for current month
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthStr = monthStart.toISOString().slice(0, 10);

    const { data: budget } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", user.id)
      .eq("month", monthStr)
      .maybeSingle();

    if (!budget) {
      return new Response(JSON.stringify({ insights: "No budget set for this month. Set a budget first to get personalized insights!" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: expenses } = await supabase
      .from("budget_expenses")
      .select("*")
      .eq("budget_id", budget.id);

    const totalSpent = (expenses || []).reduce((s: number, e: any) => s + Number(e.amount), 0);
    const categories: Record<string, number> = {};
    (expenses || []).forEach((e: any) => {
      categories[e.category] = (categories[e.category] || 0) + Number(e.amount);
    });

    const catSummary = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .map(([name, amt]) => `${name}: $${amt.toFixed(2)}`)
      .join(", ");

    const prompt = `You are a helpful grocery budget advisor. Analyze this spending data and provide 3-5 short, actionable insights.

Budget: $${budget.amount}/month
Spent so far: $${totalSpent.toFixed(2)}
Remaining: $${(Number(budget.amount) - totalSpent).toFixed(2)}
Days left in month: ${Math.max(1, Math.ceil((new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getTime() - Date.now()) / 86400000))}
Category breakdown: ${catSummary || "No expenses yet"}
Number of expenses: ${(expenses || []).length}

Provide insights in a friendly, encouraging tone. Include specific dollar amounts and percentages. Format each insight as a bullet point starting with an emoji.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a grocery budget advisor. Be concise, specific, and encouraging." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const insights = aiData.choices?.[0]?.message?.content || "Unable to generate insights at this time.";

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("budget-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
