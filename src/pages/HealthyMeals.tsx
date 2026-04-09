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
  ingredients: string[];
  instructions: string[];
};

const meals: Meal[] = [
  {
    name: "Black Bean & Rice Bowl",
    image: "🍚",
    cost: 4.50,
    servings: 4,
    time: "25 min",
    calories: 380,
    protein: "14g",
    tags: ["Budget Hero", "High Fiber"],
    category: "Lunch",
    rating: 4.7,
    description: "A hearty, protein-packed bowl with seasoned black beans, cilantro lime rice, and fresh toppings.",
    ingredients: ["1 can black beans (drained & rinsed)", "1½ cups long-grain rice", "1 lime (juiced)", "¼ cup fresh cilantro (chopped)", "1 tsp cumin", "½ tsp garlic powder", "Salt & pepper to taste", "Optional: diced avocado, salsa, sour cream"],
    instructions: ["Cook rice according to package directions. Fluff and stir in lime juice and cilantro.", "In a saucepan, heat black beans with cumin, garlic powder, salt, and pepper over medium heat for 5 minutes.", "Divide cilantro-lime rice into bowls and top with seasoned black beans.", "Add optional toppings like avocado, salsa, or sour cream and serve."],
  },
  {
    name: "Veggie Stir Fry",
    image: "🥦",
    cost: 5.75,
    servings: 3,
    time: "20 min",
    calories: 290,
    protein: "10g",
    tags: ["Quick", "Low Calorie"],
    category: "Dinner",
    rating: 4.5,
    description: "Colorful mixed vegetables tossed in a savory soy-ginger sauce, served over steamed rice.",
    ingredients: ["2 cups broccoli florets", "1 red bell pepper (sliced)", "1 carrot (julienned)", "1 cup snap peas", "2 tbsp soy sauce", "1 tbsp sesame oil", "1 tsp fresh ginger (grated)", "2 cloves garlic (minced)", "1 tbsp cornstarch + 2 tbsp water", "Cooked rice for serving"],
    instructions: ["Heat sesame oil in a large skillet or wok over high heat.", "Add garlic and ginger, stir for 30 seconds until fragrant.", "Add broccoli and carrots, stir fry for 3 minutes. Then add bell pepper and snap peas for 2 more minutes.", "Mix soy sauce with cornstarch slurry and pour over vegetables. Toss until sauce thickens.", "Serve immediately over steamed rice."],
  },
  {
    name: "Overnight Oats",
    image: "🥣",
    cost: 2.75,
    servings: 1,
    time: "5 min prep",
    calories: 340,
    protein: "12g",
    tags: ["Budget Hero", "Meal Prep"],
    category: "Breakfast",
    rating: 4.8,
    description: "Creamy oats soaked overnight with chia seeds, banana, and a drizzle of honey.",
    ingredients: ["½ cup rolled oats", "½ cup milk (any kind)", "¼ cup Greek yogurt", "1 tbsp chia seeds", "1 tbsp honey or maple syrup", "½ banana (sliced)", "Pinch of cinnamon"],
    instructions: ["In a jar or container, combine oats, milk, yogurt, chia seeds, and honey. Stir well.", "Top with banana slices and a pinch of cinnamon.", "Cover and refrigerate overnight (or at least 4 hours).", "In the morning, stir and enjoy cold — or microwave for 2 minutes if you prefer it warm."],
  },
  {
    name: "Lentil Soup",
    image: "🍲",
    cost: 4.25,
    servings: 6,
    time: "35 min",
    calories: 260,
    protein: "18g",
    tags: ["High Protein", "Freezer Friendly"],
    category: "Dinner",
    rating: 4.9,
    description: "A warming, spiced red lentil soup packed with carrots, celery, and tomatoes.",
    ingredients: ["1½ cups red lentils (rinsed)", "1 can diced tomatoes (14 oz)", "2 carrots (diced)", "2 celery stalks (diced)", "1 onion (diced)", "3 cloves garlic (minced)", "1 tsp cumin", "½ tsp turmeric", "4 cups vegetable broth", "1 tbsp olive oil", "Salt, pepper, and lemon juice to taste"],
    instructions: ["Heat olive oil in a large pot over medium heat. Sauté onion, carrots, and celery for 5 minutes until softened.", "Add garlic, cumin, and turmeric. Stir for 1 minute.", "Add lentils, diced tomatoes, and broth. Bring to a boil, then reduce heat and simmer for 20–25 minutes until lentils are tender.", "Season with salt, pepper, and a squeeze of lemon. Blend partially for a creamier texture if desired."],
  },
  {
    name: "Egg & Spinach Wrap",
    image: "🌯",
    cost: 3.50,
    servings: 1,
    time: "10 min",
    calories: 310,
    protein: "20g",
    tags: ["Quick", "High Protein"],
    category: "Breakfast",
    rating: 4.4,
    description: "Scrambled eggs with fresh spinach, feta cheese, and salsa wrapped in a whole wheat tortilla.",
    ingredients: ["2 large eggs", "1 cup fresh spinach", "2 tbsp crumbled feta cheese", "1 whole wheat tortilla", "2 tbsp salsa", "Salt & pepper to taste", "Cooking spray or 1 tsp butter"],
    instructions: ["Whisk eggs with salt and pepper in a bowl.", "Heat a non-stick pan over medium heat with cooking spray or butter.", "Add spinach and cook for 1 minute until wilted. Pour in eggs and scramble until just set.", "Warm the tortilla in the microwave for 15 seconds.", "Fill tortilla with scrambled eggs, spinach, feta, and salsa. Fold and serve."],
  },
  {
    name: "Chicken & Veggie Sheet Pan",
    image: "🍗",
    cost: 6.50,
    servings: 4,
    time: "40 min",
    calories: 420,
    protein: "32g",
    tags: ["High Protein", "Meal Prep"],
    category: "Dinner",
    rating: 4.6,
    description: "Seasoned chicken thighs roasted with sweet potatoes, broccoli, and bell peppers.",
    ingredients: ["1.5 lbs chicken thighs (boneless, skinless)", "2 sweet potatoes (cubed)", "2 cups broccoli florets", "1 red bell pepper (chunked)", "2 tbsp olive oil", "1 tsp paprika", "1 tsp garlic powder", "½ tsp onion powder", "Salt & pepper to taste"],
    instructions: ["Preheat oven to 425°F (220°C). Line a large baking sheet with parchment paper.", "Toss sweet potatoes with 1 tbsp olive oil, salt, and pepper. Spread on the sheet and roast for 10 minutes.", "Season chicken with paprika, garlic powder, onion powder, salt, and pepper.", "Add chicken, broccoli, and bell pepper to the sheet. Drizzle with remaining olive oil.", "Roast for 20–25 minutes until chicken is cooked through (165°F internal) and vegetables are tender."],
  },
  {
    name: "Banana Peanut Butter Smoothie",
    image: "🍌",
    cost: 3.25,
    servings: 1,
    time: "5 min",
    calories: 350,
    protein: "15g",
    tags: ["Quick", "Budget Hero"],
    category: "Breakfast",
    rating: 4.7,
    description: "A creamy, filling smoothie with banana, peanut butter, oats, and milk.",
    ingredients: ["1 ripe banana (frozen works best)", "2 tbsp peanut butter", "¼ cup rolled oats", "1 cup milk (any kind)", "1 tbsp honey (optional)", "½ tsp cinnamon", "3–4 ice cubes"],
    instructions: ["Add all ingredients to a blender.", "Blend on high for 60 seconds until smooth and creamy.", "Pour into a glass and enjoy immediately. Add more milk if you prefer a thinner consistency."],
  },
  {
    name: "Pasta Primavera",
    image: "🍝",
    cost: 5.25,
    servings: 4,
    time: "25 min",
    calories: 360,
    protein: "12g",
    tags: ["Family Friendly", "Vegetarian"],
    category: "Lunch",
    rating: 4.3,
    description: "Whole wheat pasta with seasonal vegetables in a light garlic olive oil sauce.",
    ingredients: ["8 oz whole wheat penne or rotini", "1 zucchini (diced)", "1 yellow squash (diced)", "1 cup cherry tomatoes (halved)", "½ cup frozen peas", "3 cloves garlic (minced)", "2 tbsp olive oil", "¼ cup Parmesan cheese (grated)", "Fresh basil leaves", "Salt, pepper, and red pepper flakes to taste"],
    instructions: ["Cook pasta according to package directions. Reserve ½ cup pasta water before draining.", "Heat olive oil in a large skillet over medium-high heat. Add zucchini and squash, cook for 4 minutes.", "Add garlic, cherry tomatoes, and peas. Cook 2 more minutes.", "Toss in cooked pasta with a splash of reserved pasta water. Season with salt, pepper, and red pepper flakes.", "Top with Parmesan and fresh basil. Serve warm."],
  },
  {
    name: "Tuna Salad Lettuce Wraps",
    image: "🥬",
    cost: 4.75,
    servings: 2,
    time: "10 min",
    calories: 220,
    protein: "24g",
    tags: ["Low Calorie", "High Protein"],
    category: "Lunch",
    rating: 4.5,
    description: "Light tuna salad with Greek yogurt, celery, and lemon served in crisp butter lettuce cups.",
    ingredients: ["2 cans tuna (drained)", "3 tbsp Greek yogurt", "1 celery stalk (finely diced)", "1 tbsp lemon juice", "1 tsp Dijon mustard", "Salt & pepper to taste", "6–8 butter lettuce leaves", "Optional: diced red onion, capers"],
    instructions: ["In a bowl, combine tuna, Greek yogurt, celery, lemon juice, and Dijon mustard. Mix well.", "Season with salt and pepper to taste. Add optional red onion or capers if desired.", "Wash and pat dry butter lettuce leaves.", "Spoon tuna mixture into each lettuce cup and serve immediately."],
  },
];

const categories = ["All", "Breakfast", "Lunch", "Dinner"];

const weeklyPlan = [
  {
    day: "Monday",
    breakfast: { name: "Overnight Oats", emoji: "🥣", cost: 2.75 },
    lunch: { name: "Black Bean & Rice Bowl", emoji: "🍚", cost: 4.50 },
    dinner: { name: "Lentil Soup", emoji: "🍲", cost: 4.25 },
    snack: { name: "Banana", emoji: "🍌", cost: 0.75 },
  },
  {
    day: "Tuesday",
    breakfast: { name: "Egg & Spinach Wrap", emoji: "🌯", cost: 3.50 },
    lunch: { name: "Tuna Salad Wraps", emoji: "🥬", cost: 4.75 },
    dinner: { name: "Veggie Stir Fry", emoji: "🥦", cost: 5.75 },
    snack: { name: "Apple + PB", emoji: "🍎", cost: 1.25 },
  },
  {
    day: "Wednesday",
    breakfast: { name: "PB Banana Smoothie", emoji: "🍌", cost: 3.25 },
    lunch: { name: "Pasta Primavera", emoji: "🍝", cost: 5.25 },
    dinner: { name: "Lentil Soup", emoji: "🍲", cost: 4.25 },
    snack: { name: "Yogurt", emoji: "🥣", cost: 1.50 },
  },
  {
    day: "Thursday",
    breakfast: { name: "Overnight Oats", emoji: "🥣", cost: 2.75 },
    lunch: { name: "Black Bean & Rice Bowl", emoji: "🍚", cost: 4.50 },
    dinner: { name: "Chicken Sheet Pan", emoji: "🍗", cost: 6.50 },
    snack: { name: "Carrots + Hummus", emoji: "🥕", cost: 1.50 },
  },
  {
    day: "Friday",
    breakfast: { name: "Egg & Spinach Wrap", emoji: "🌯", cost: 3.50 },
    lunch: { name: "Tuna Salad Wraps", emoji: "🥬", cost: 4.75 },
    dinner: { name: "Veggie Stir Fry", emoji: "🥦", cost: 5.75 },
    snack: { name: "Trail Mix", emoji: "🥜", cost: 1.25 },
  },
  {
    day: "Saturday",
    breakfast: { name: "PB Banana Smoothie", emoji: "🍌", cost: 3.25 },
    lunch: { name: "Pasta Primavera", emoji: "🍝", cost: 5.25 },
    dinner: { name: "Chicken Sheet Pan", emoji: "🍗", cost: 6.50 },
    snack: { name: "Banana", emoji: "🍌", cost: 0.75 },
  },
  {
    day: "Sunday",
    breakfast: { name: "Overnight Oats", emoji: "🥣", cost: 2.75 },
    lunch: { name: "Black Bean & Rice Bowl", emoji: "🍚", cost: 4.50 },
    dinner: { name: "Lentil Soup", emoji: "🍲", cost: 4.25 },
    snack: { name: "Apple + PB", emoji: "🍎", cost: 1.25 },
  },
];

const weeklyTotal = weeklyPlan.reduce(
  (s, d) => s + d.breakfast.cost + d.lunch.cost + d.dinner.cost + d.snack.cost, 0
);

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
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[100px_1fr_1fr_1fr_1fr_80px] gap-2 px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Day</span>
            <span>🌅 Breakfast</span>
            <span>☀️ Lunch</span>
            <span>🌙 Dinner</span>
            <span>🍎 Snack</span>
            <span className="text-right">Total</span>
          </div>

          <div className="space-y-1">
            {weeklyPlan.map((day) => {
              const dayTotal = day.breakfast.cost + day.lunch.cost + day.dinner.cost + day.snack.cost;
              return (
                <div key={day.day} className="rounded-lg hover:bg-muted/50 transition-colors">
                  {/* Desktop */}
                  <div className="hidden md:grid grid-cols-[100px_1fr_1fr_1fr_1fr_80px] gap-2 items-center px-4 py-3">
                    <span className="text-sm font-semibold text-foreground">{day.day}</span>
                    <span className="text-sm text-muted-foreground">{day.breakfast.emoji} {day.breakfast.name}</span>
                    <span className="text-sm text-muted-foreground">{day.lunch.emoji} {day.lunch.name}</span>
                    <span className="text-sm text-muted-foreground">{day.dinner.emoji} {day.dinner.name}</span>
                    <span className="text-sm text-muted-foreground">{day.snack.emoji} {day.snack.name}</span>
                    <span className="text-sm font-bold text-primary text-right">${dayTotal.toFixed(2)}</span>
                  </div>
                  {/* Mobile */}
                  <div className="md:hidden px-4 py-3 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-foreground">{day.day}</span>
                      <span className="text-sm font-bold text-primary">${dayTotal.toFixed(2)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                      <span>🌅 {day.breakfast.name}</span>
                      <span>☀️ {day.lunch.name}</span>
                      <span>🌙 {day.dinner.name}</span>
                      <span>🍎 {day.snack.name}</span>
                    </div>
                  </div>
                </div>
              );
            })}
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

      {/* Recipe Detail Dialog */}
      <Dialog open={!!selectedMeal} onOpenChange={(open) => !open && setSelectedMeal(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedMeal && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="text-3xl">{selectedMeal.image}</span>
                  {selectedMeal.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <p className="text-sm text-muted-foreground">{selectedMeal.description}</p>

                <div className="grid grid-cols-4 gap-3 text-center bg-muted/50 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-bold text-primary">${selectedMeal.cost.toFixed(2)}</p>
                    <p className="text-[10px] text-muted-foreground">/serving</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{selectedMeal.calories}</p>
                    <p className="text-[10px] text-muted-foreground">kcal</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{selectedMeal.protein}</p>
                    <p className="text-[10px] text-muted-foreground">protein</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{selectedMeal.time}</p>
                    <p className="text-[10px] text-muted-foreground">time</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">🧾 Ingredients</h3>
                  <ul className="space-y-1">
                    {selectedMeal.ingredients.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">👩‍🍳 Instructions</h3>
                  <ol className="space-y-2">
                    {selectedMeal.instructions.map((step, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-1">Serves {selectedMeal.servings} · {selectedMeal.category}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMeal.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0.5">{tag}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" onClick={() => handleAddToList(selectedMeal)}>
                    <Heart className={`h-4 w-4 mr-1 ${shoppingList.includes(selectedMeal.name) ? "fill-primary-foreground" : ""}`} />
                    {shoppingList.includes(selectedMeal.name) ? "Saved" : "Save Meal"}
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to="/compare">Find Ingredients</Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
