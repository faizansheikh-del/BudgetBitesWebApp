import { useState, useEffect, useMemo } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus, Trash2, ShoppingCart, Clock, Users, ChefHat, Loader2, Check, Utensils } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useShoppingList } from "@/contexts/ShoppingListContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type Recipe = {
  id: string;
  name: string;
  description: string;
  servings: number;
  prep_time: number;
  cook_time: number;
  image_url: string;
  instructions: string;
  tags: string[];
  ingredients: Ingredient[];
};

type Ingredient = {
  id: string;
  recipe_id: string;
  product_name: string;
  quantity: number;
  unit: string;
  product_id: string | null;
};

const demoRecipes: Recipe[] = [
  {
    id: "r1", name: "Budget Chicken Stir-Fry", description: "Quick, healthy, and budget-friendly weeknight dinner",
    servings: 4, prep_time: 10, cook_time: 15, image_url: "", instructions: "1. Slice chicken and vegetables.\n2. Stir-fry chicken until golden.\n3. Add vegetables and sauce.\n4. Serve over rice.",
    tags: ["Budget", "Quick", "Healthy"],
    ingredients: [
      { id: "i1", recipe_id: "r1", product_name: "Chicken Breast (1lb)", quantity: 1, unit: "lb", product_id: null },
      { id: "i2", recipe_id: "r1", product_name: "Brown Rice (2lb)", quantity: 0.5, unit: "lb", product_id: null },
      { id: "i3", recipe_id: "r1", product_name: "Broccoli", quantity: 1, unit: "head", product_id: null },
      { id: "i4", recipe_id: "r1", product_name: "Soy Sauce", quantity: 2, unit: "tbsp", product_id: null },
    ],
  },
  {
    id: "r2", name: "One-Pot Pasta Primavera", description: "Everything cooks in one pot — minimal cleanup!",
    servings: 6, prep_time: 5, cook_time: 20, image_url: "", instructions: "1. Boil pasta with vegetables.\n2. Drain, add sauce and cheese.\n3. Season and serve.",
    tags: ["Easy", "Vegetarian", "One-Pot"],
    ingredients: [
      { id: "i5", recipe_id: "r2", product_name: "Penne Pasta", quantity: 1, unit: "lb", product_id: null },
      { id: "i6", recipe_id: "r2", product_name: "Canned Tomatoes 28oz", quantity: 1, unit: "can", product_id: null },
      { id: "i7", recipe_id: "r2", product_name: "Zucchini", quantity: 2, unit: "whole", product_id: null },
      { id: "i8", recipe_id: "r2", product_name: "Parmesan Cheese", quantity: 0.25, unit: "cup", product_id: null },
    ],
  },
  {
    id: "r3", name: "Black Bean Tacos", description: "Meatless Monday staple that's packed with protein",
    servings: 4, prep_time: 10, cook_time: 10, image_url: "", instructions: "1. Warm beans with spices.\n2. Warm tortillas.\n3. Assemble with toppings.",
    tags: ["Budget", "Vegetarian", "Quick"],
    ingredients: [
      { id: "i9", recipe_id: "r3", product_name: "Corn Tortilla Chips", quantity: 1, unit: "pack", product_id: null },
      { id: "i10", recipe_id: "r3", product_name: "Black Beans (canned)", quantity: 2, unit: "can", product_id: null },
      { id: "i11", recipe_id: "r3", product_name: "Avocados (4ct)", quantity: 1, unit: "pack", product_id: null },
      { id: "i12", recipe_id: "r3", product_name: "Lime", quantity: 2, unit: "whole", product_id: null },
    ],
  },
  {
    id: "r4", name: "Sheet Pan Salmon & Veggies", description: "Healthy omega-3 rich dinner with zero effort",
    servings: 2, prep_time: 10, cook_time: 25, image_url: "", instructions: "1. Season salmon and vegetables.\n2. Arrange on sheet pan.\n3. Bake at 400°F for 25 mins.",
    tags: ["Healthy", "Easy", "High-Protein"],
    ingredients: [
      { id: "i13", recipe_id: "r4", product_name: "Salmon Fillet (1lb)", quantity: 1, unit: "lb", product_id: null },
      { id: "i14", recipe_id: "r4", product_name: "Sweet Potatoes", quantity: 2, unit: "whole", product_id: null },
      { id: "i15", recipe_id: "r4", product_name: "Green Beans", quantity: 0.5, unit: "lb", product_id: null },
    ],
  },
];

export default function MealPlanningPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set());
  const [activeTag, setActiveTag] = useState("All");
  const { addManualItem } = useShoppingList();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      const { data: recipeData } = await supabase.from("recipes").select("*");
      if (recipeData && recipeData.length > 0) {
        const { data: ingredientData } = await supabase.from("recipe_ingredients").select("*");
        const mapped = recipeData.map(r => ({
          ...r,
          ingredients: (ingredientData || []).filter(i => i.recipe_id === r.id),
        }));
        setRecipes(mapped);
      } else {
        setRecipes(demoRecipes);
      }
      setLoading(false);
    };
    fetchRecipes();
  }, []);

  const allTags = ["All", ...Array.from(new Set(recipes.flatMap(r => r.tags)))];

  const filtered = recipes
    .filter(r => activeTag === "All" || r.tags.includes(activeTag))
    .filter(r => !query || r.name.toLowerCase().includes(query.toLowerCase()) || r.description.toLowerCase().includes(query.toLowerCase()));

  const toggleRecipe = (id: string) => {
    setSelectedRecipes(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedRecipesList = recipes.filter(r => selectedRecipes.has(r.id));

  // Deduplicate ingredients across selected recipes
  const combinedIngredients = useMemo(() => {
    const map = new Map<string, { name: string; quantity: number; unit: string }>();
    selectedRecipesList.forEach(r => {
      r.ingredients.forEach(ing => {
        const key = `${ing.product_name}-${ing.unit}`;
        const existing = map.get(key);
        if (existing) {
          existing.quantity += ing.quantity;
        } else {
          map.set(key, { name: ing.product_name, quantity: ing.quantity, unit: ing.unit });
        }
      });
    });
    return Array.from(map.values());
  }, [selectedRecipesList]);

  const generateShoppingList = () => {
    combinedIngredients.forEach(ing => {
      addManualItem(`${ing.name} (${ing.quantity} ${ing.unit})`, 1, 0);
    });
    toast({ title: "Shopping list generated!", description: `${combinedIngredients.length} items added from ${selectedRecipes.size} recipes` });
  };

  return (
    <PublicLayout>
      <div className="container px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Meal Planning</h1>
          <p className="text-muted-foreground mt-1">Pick recipes for the week and auto-generate your shopping list</p>
        </div>

        {/* Selected recipes summary */}
        {selectedRecipes.size > 0 && (
          <Card className="mb-8 border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-foreground">
                    {selectedRecipes.size} recipe{selectedRecipes.size !== 1 ? "s" : ""} selected
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {combinedIngredients.length} unique ingredients needed
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedRecipes(new Set())}>
                    Clear Selection
                  </Button>
                  <Button size="sm" onClick={generateShoppingList}>
                    <ShoppingCart className="h-4 w-4 mr-1.5" />
                    Generate Shopping List
                  </Button>
                </div>
              </div>
              {combinedIngredients.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {combinedIngredients.map(ing => (
                    <Badge key={`${ing.name}-${ing.unit}`} variant="secondary" className="text-xs">
                      {ing.quantity} {ing.unit} {ing.name}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Search & Tags */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search recipes..." className="pl-10 h-11 rounded-xl" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {allTags.map(tag => (
            <Button key={tag} variant={tag === activeTag ? "default" : "outline"} size="sm" className="rounded-full text-xs" onClick={() => setActiveTag(tag)}>
              {tag}
            </Button>
          ))}
        </div>

        {/* Recipe Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(recipe => {
              const isSelected = selectedRecipes.has(recipe.id);
              return (
                <div
                  key={recipe.id}
                  className={`bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer ${isSelected ? "border-primary ring-1 ring-primary/30" : "border-border"}`}
                  onClick={() => toggleRecipe(recipe.id)}
                >
                  <div className="relative h-36 bg-muted flex items-center justify-center">
                    {recipe.image_url ? (
                      <img src={recipe.image_url} alt={recipe.name} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <ChefHat className="h-12 w-12 text-muted-foreground/40" />
                    )}
                    {isSelected && (
                      <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm text-foreground">{recipe.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{recipe.description}</p>

                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {recipe.prep_time + recipe.cook_time}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {recipe.servings} servings
                      </span>
                      <span className="flex items-center gap-1">
                        <Utensils className="h-3 w-3" />
                        {recipe.ingredients.length} items
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {recipe.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
