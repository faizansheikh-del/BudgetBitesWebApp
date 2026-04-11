import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Menu, ChevronDown, ShoppingCart, UtensilsCrossed, Wallet, Users, List } from "lucide-react";
import budgetBitesLogo from "@/assets/budget-bites-logo.png";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const topLinks = [
  { label: "Home", path: "/" },
  { label: "Dashboard", path: "/dashboard" },
];

const navGroups = [
  {
    label: "Shopping",
    icon: ShoppingCart,
    links: [
      { label: "Compare Prices", path: "/compare" },
      { label: "Weekly Deals", path: "/deals" },
      { label: "Stores", path: "/stores" },
      { label: "Community Prices", path: "/community-prices" },
    ],
  },
  {
    label: "Planning",
    icon: UtensilsCrossed,
    links: [
      { label: "Meal Planning", path: "/meal-planning" },
      { label: "Shared Lists", path: "/shared-lists" },
    ],
  },
  {
    label: "Finances",
    icon: Wallet,
    links: [
      { label: "Budget Tracker", path: "/budget" },
      { label: "Receipts", path: "/receipts" },
      { label: "Loyalty", path: "/loyalty" },
    ],
  },
];

const allLinks = [
  ...topLinks,
  ...navGroups.flatMap((g) => g.links),
];

export function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const groupIsActive = (links: { path: string }[]) =>
    links.some((l) => isActive(l.path));

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={budgetBitesLogo} alt="Budget Bites" className="h-[5.5rem] w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {topLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive(link.path)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {link.label}
            </Link>
          ))}

          {navGroups.map((group) => (
            <DropdownMenu key={group.label}>
              <DropdownMenuTrigger
                className={cn(
                  "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors outline-none",
                  groupIsActive(group.links)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <group.icon className="h-4 w-4" />
                {group.label}
                <ChevronDown className="h-3 w-3 opacity-60" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[180px]">
                {group.links.map((link) => (
                  <DropdownMenuItem key={link.path} asChild>
                    <Link
                      to={link.path}
                      className={cn(
                        "w-full cursor-pointer",
                        isActive(link.path) && "bg-primary/10 text-primary"
                      )}
                    >
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/signin">Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/signup">Sign Up</Link>
          </Button>
        </div>

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-0">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                  <img src={budgetBitesLogo} alt="Budget Bites" className="h-[5.5rem] w-auto" />
                </Link>
              </div>
              <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
                {topLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive(link.path)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}

                {navGroups.map((group) => (
                  <Collapsible key={group.label} defaultOpen={groupIsActive(group.links)}>
                    <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-semibold text-foreground hover:bg-accent transition-colors">
                      <group.icon className="h-4 w-4" />
                      {group.label}
                      <ChevronDown className="h-3 w-3 ml-auto opacity-60 transition-transform [[data-state=open]>&]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-4 mt-1 space-y-0.5">
                      {group.links.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            isActive(link.path)
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          )}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
              </nav>
              <div className="p-4 border-t border-border space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/signin" onClick={() => setOpen(false)}>Sign In</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link to="/signup" onClick={() => setOpen(false)}>Sign Up</Link>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
