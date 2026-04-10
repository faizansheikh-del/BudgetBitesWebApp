import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ShoppingListProvider } from "@/contexts/ShoppingListContext";
import HomePage from "./pages/HomePage";
import ComparePage from "./pages/ComparePage";
import WeeklyDealsPage from "./pages/WeeklyDealsPage";
import MealPlanningPage from "./pages/MealPlanningPage";
import StoresPage from "./pages/StoresPage";
import BudgetPage from "./pages/BudgetPage";
import UserDashboard from "./pages/UserDashboard";
import StoreDashboard from "./pages/StoreDashboard";
import HealthyMeals from "./pages/HealthyMeals";
import StoreDetail from "./pages/StoreDetail";
import ReceiptsPage from "./pages/ReceiptsPage";
import LoyaltyPage from "./pages/LoyaltyPage";
import CommunityPricesPage from "./pages/CommunityPricesPage";
import SharedListsPage from "./pages/SharedListsPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
          <ShoppingListProvider>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/deals" element={<WeeklyDealsPage />} />
              <Route path="/meal-planning" element={<MealPlanningPage />} />
              <Route path="/stores" element={<StoresPage />} />
              <Route path="/store/:slug" element={<StoreDetail />} />
              <Route path="/budget" element={<BudgetPage />} />
              <Route path="/receipts" element={<ReceiptsPage />} />
              <Route path="/loyalty" element={<LoyaltyPage />} />
              <Route path="/community-prices" element={<CommunityPricesPage />} />
              <Route path="/shared-lists" element={<SharedListsPage />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/store-dashboard" element={<StoreDashboard />} />
              <Route path="/healthy-meals" element={<HealthyMeals />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ShoppingListProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
