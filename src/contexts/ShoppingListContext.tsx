import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

export type ShoppingItem = {
  id: string;
  name: string;
  brand: string;
  store: string;
  price: number;
  original_price: number;
  image: string;
  image_url: string;
  qty: number;
};

type ShoppingListContextType = {
  items: ShoppingItem[];
  addItem: (item: Omit<ShoppingItem, "qty">) => void;
  removeItem: (id: string) => void;
  clearList: () => void;
  isInList: (id: string) => boolean;
  totalCost: number;
  totalSavings: number;
  addManualItem: (name: string, qty: number, price: number) => void;
};

const ShoppingListContext = createContext<ShoppingListContextType | null>(null);

export function ShoppingListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const { toast } = useToast();

  const addItem = useCallback((item: Omit<ShoppingItem, "qty">) => {
    setItems(prev => {
      if (prev.some(i => i.id === item.id)) return prev;
      return [...prev, { ...item, qty: 1 }];
    });
    toast({ title: "Added to list", description: `${item.name} — $${item.price.toFixed(2)}` });
  }, [toast]);

  const removeItem = useCallback((id: string) => {
    setItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item) toast({ title: "Removed from list", description: item.name });
      return prev.filter(i => i.id !== id);
    });
  }, [toast]);

  const clearList = useCallback(() => {
    setItems([]);
    toast({ title: "List cleared" });
  }, [toast]);

  const isInList = useCallback((id: string) => items.some(i => i.id === id), [items]);

  const addManualItem = useCallback((name: string, qty: number, price: number) => {
    const id = `manual-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setItems(prev => [...prev, { id, name, brand: "", store: "", price, original_price: price, image: "🛒", image_url: "", qty }]);
    toast({ title: "Added to list", description: name });
  }, [toast]);

  const totalCost = items.reduce((s, i) => s + i.price * i.qty, 0);
  const totalSavings = items.reduce((s, i) => s + (i.original_price - i.price) * i.qty, 0);

  return (
    <ShoppingListContext.Provider value={{ items, addItem, removeItem, clearList, isInList, totalCost, totalSavings, addManualItem }}>
      {children}
    </ShoppingListContext.Provider>
  );
}

export function useShoppingList() {
  const ctx = useContext(ShoppingListContext);
  if (!ctx) throw new Error("useShoppingList must be used within ShoppingListProvider");
  return ctx;
}
