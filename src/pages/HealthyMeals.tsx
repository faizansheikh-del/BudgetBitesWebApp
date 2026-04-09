import { PublicLayout } from "@/components/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  Search, Clock, DollarSign, Heart, Flame, Leaf, Star,
  ChefHat, Users, Filter, ArrowRight, Sparkles
} from "lucide-react";
import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

type Meal = {
  name: string;
  image: string;
  cost: number;
  servings: number;
  time: string;
  calories: number;
  protein: string;
  tags: string[];
  category: string;
  rating: number;
  description: string;
};

const meals: Meal[] = [
  {
    name: "Black Bean & Rice Bowl",
    image: "🍚",
    cost: 2.15,
    servings: 4,
    time: "25 min",
    calories: 380,
    protein: "14g",
    tags: ["Budget Hero", "High Fiber"],
    category: "Lunch",
    rating: 4.7,
    description: "A hearty, protein-packed bowl with seasoned black beans, cilantro lime rice, and fresh toppings.",
  },
  {
    name: "Veggie Stir Fry",
    image: "🥦",
    cost: 3.20,
    servings: 3,
    time: "20 min",
    calories: 290,
    protein: "10g",
    tags: ["Quick", "Low Calorie"],
    category: "Dinner",
    rating: 4.5,
    description: "Colorful mixed vegetables tossed in a savory soy-ginger sauce, served over steamed rice.",
  },
  {
    name: "Overnight Oats",
    image: "🥣",
    cost: 1.10,
    servings: 1,
    time: "5 min prep",
    calories: 340,
    protein: "12g",
    tags: ["Budget Hero", "Meal Prep"],
    category: "Breakfast",
    rating: 4.8,
    description: "Creamy oats soaked overnight with chia seeds, banana, and a drizzle of honey.",
  },
  {
    name: "Lentil Soup",
    image: "🍲",
    cost: 1.85,
    servings: 6,
    time: "35 min",
    calories: 260,
    protein: "18g",
    tags: ["High Protein", "Freezer Friendly"],
    category: "Dinner",
    rating: 4.9,
    description: "A warming, spiced red lentil soup packed with carrots, celery, and tomatoes.",
  },
  {
    name: "Egg & Spinach Wrap",
    image: "🌯",
    cost: 1.50,
    servings: 1,
    time: "10 min",
    calories: 310,
    protein: "20g",
    tags: ["Quick", "High Protein"],
    category: "Breakfast",
    rating: 4.4,
    description: "Scrambled eggs with fresh spinach, feta cheese, and salsa wrapped in a whole wheat tortilla.",
  },
  {
    name: "Chicken & Veggie Sheet Pan",
    image: "🍗",
    cost: 3.75,
    servings: 4,
    time: "40 min",
    calories: 420,
    protein: "32g",
    tags: ["High Protein", "Meal Prep"],
    category: "Dinner",
    rating: 4.6,
    description: "Seasoned chicken thighs roasted with sweet potatoes, broccoli, and bell peppers.",
  },
  {
    name: "Banana Peanut Butter Smoothie",
    image: "🍌",
    cost: 1.25,
    servings: 1,
    time: "5 min",
    calories: 350,
    protein: "15g",
    tags: ["Quick", "Budget Hero"],
    category: "Breakfast",
    rating: 4.7,
    description: "A creamy, filling smoothie with banana, peanut butter, oats, and milk.",
  },
  {
    name: "Pasta Primavera",
    image: "🍝",
    cost: 2.80,
    servings: 4,
    time: "25 min",
    calories: 360,
    protein: "12g",
    tags: ["Family Friendly", "Vegetarian"],
    category: "Lunch",
    rating: 4.3,
    description: "Whole wheat pasta with seasonal vegetables in a light garlic olive oil sauce.",
  },
  {
    name: "Tuna Salad Lettuce Wraps",
    image: "🥬",
    cost: 2.40,
    servings: 2,
    time: "10 min",
    calories: 220,
    protein: "24g",
    tags: ["Low Calorie", "High Protein"],
    category: "Lunch",
    rating: 4.5,
    description: "Light tuna salad with Greek yogurt, celery, and lemon served in crisp butter lettuce cups.",
  },
];

const categories = ["All", "Breakfast", "Lunch", "Dinner"];

const weeklyPlan = [
  { day: "Monday", meal: "Overnight Oats + Lentil Soup", cost: 2.95 },
  { day: "Tuesday", meal: "Egg Wrap + Veggie Stir Fry", cost: 4.70 },
  { day: "Wednesday", meal: "Smoothie + Black Bean Bowl", cost: 3.40 },
  { day: "Thursday", meal: "Overnight Oats + Pasta Primavera", cost: 3.90 },
  { day: "Friday", meal: "Egg Wrap + Chicken Sheet Pan", cost: 5.25 },
  { day: "Saturday", meal: "Smoothie + Tuna Wraps", cost: 3.65 },
  { day: "Sunday", meal: "Overnight Oats + Lentil Soup", cost: 2.95 },
];

const weeklyTotal = weeklyPlan.reduce((s, d) => s + d.cost, 0);

export default function HealthyMeals() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const { toast } = useToast();

  const filtered = meals.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "All" || m.category === activeCategory;
    return matchSearch && matchCat;
  });

  const handleAddToList = (meal: Meal) => {
    if (shoppingList.includes(meal.name)) {
      setShoppingList((prev) => prev.filter((n) => n !== meal.name));
      toast({ title: "Removed from list", description: `${meal.name} removed from your meal list.` });
    } else {
      setShoppingList((prev) => [...prev, meal.name]);
      toast({ title: "Added to list!", description: `${meal.name} added to your meal list.` });
    }
  };

  return (
    <PublicLayout>
      <div className="container px-4 md:px-6 py-8 md:py-12">
        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="secondary" className="mb-3">
            <Leaf className="h-3 w-3 mr-1" /> Eat Well, Spend Less
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Healthy Meals on a Budget
          </h1>
          <p className="text-muted-foreground text-lg">
            Delicious, nutritious recipes that cost less than $4 per serving. Eating healthy doesn't have to be expensive.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {[
            { icon: DollarSign, label: "Avg. Cost/Serving", value: "$2.22" },
            { icon: Flame, label: "Avg. Calories", value: "326 kcal" },
            { icon: Clock, label: "Avg. Prep Time", value: "~20 min" },
            { icon: Heart, label: "Recipes", value: `${meals.length}+` },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <s.icon className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search meals..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className="rounded-full"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Meal Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {filtered.map((meal) => (
            <div
              key={meal.name}
              className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all group"
            >
              <div className="bg-muted/50 h-40 flex items-center justify-center text-6xl">
                {meal.image}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {meal.name}
                  </h3>
                  <div className="flex items-center gap-0.5 text-xs text-muted-foreground shrink-0 ml-2">
                    <Star className="h-3 w-3 fill-warning text-warning" />
                    {meal.rating}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{meal.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {meal.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="grid grid-cols-4 gap-2 text-center border-t border-border pt-3">
                  <div>
                    <p className="text-sm font-bold text-primary">${meal.cost.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">/serving</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{meal.calories}</p>
                    <p className="text-[10px] text-muted-foreground">kcal</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{meal.protein}</p>
                    <p className="text-[10px] text-muted-foreground">protein</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{meal.time}</p>
                    <p className="text-[10px] text-muted-foreground">time</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setSelectedMeal(meal)}
                  >
                    View Recipe
                  </Button>
                  <Button
                    size="sm"
                    variant={shoppingList.includes(meal.name) ? "secondary" : "outline"}
                    className="flex-1 text-xs"
                    onClick={() => handleAddToList(meal)}
                  >
                    <Heart className={`h-3.5 w-3.5 mr-1 ${shoppingList.includes(meal.name) ? "fill-primary text-primary" : ""}`} />
                    {shoppingList.includes(meal.name) ? "Saved" : "Save Meal"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Meal Plan */}
        <div className="bg-card border border-border rounded-xl p-6 md:p-8 mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Sample Weekly Meal Plan</h2>
              <p className="text-sm text-muted-foreground">
                Eat healthy all week for just ${weeklyTotal.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {weeklyPlan.map((day) => (
              <div
                key={day.day}
                className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-foreground w-24">{day.day}</span>
                  <span className="text-sm text-muted-foreground">{day.meal}</span>
                </div>
                <span className="text-sm font-bold text-primary">${day.cost.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-border px-4">
              <span className="font-semibold text-foreground">Weekly Total</span>
              <span className="text-lg font-bold text-primary">${weeklyTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-5 text-center">Smart Shopping Tips</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: "🛒",
                title: "Buy in Bulk",
                desc: "Rice, beans, and oats are significantly cheaper when bought in larger quantities.",
              },
              {
                icon: "🥶",
                title: "Use Frozen Veggies",
                desc: "Frozen vegetables are just as nutritious and last much longer than fresh.",
              },
              {
                icon: "📋",
                title: "Plan Your Meals",
                desc: "A weekly meal plan reduces food waste and impulse purchases by up to 30%.",
              },
              {
                icon: "🏷️",
                title: "Go Store Brand",
                desc: "Store-brand products are typically 20-40% cheaper with the same quality.",
              },
              {
                icon: "🌱",
                title: "Eat More Plants",
                desc: "Plant-based proteins like lentils and beans cost a fraction of meat.",
              },
              {
                icon: "📅",
                title: "Shop Seasonally",
                desc: "Seasonal produce is fresher, tastier, and can be up to 50% cheaper.",
              },
            ].map((tip) => (
              <div key={tip.title} className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-shadow">
                <span className="text-2xl mb-2 block">{tip.icon}</span>
                <h3 className="font-semibold text-foreground mb-1">{tip.title}</h3>
                <p className="text-sm text-muted-foreground">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-primary/5 border border-primary/20 rounded-2xl p-8 md:p-12">
          <ChefHat className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Ready to Save on Groceries?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Compare prices at nearby stores and find the best deals on ingredients for these meals.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link to="/compare">
                Compare Prices <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/budget">Track Your Budget</Link>
            </Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
