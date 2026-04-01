import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CartItem, Product } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (product: Product, size: string) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  // Sync cart to DB when user is logged in
  const syncToDb = useCallback(async (updatedItems: CartItem[]) => {
    if (!user) return;
    // Clear existing cart items and re-insert
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    if (updatedItems.length > 0) {
      await supabase.from("cart_items").insert(
        updatedItems.map((item) => ({
          user_id: user.id,
          product_id: item.product.id,
          size: item.size,
          quantity: item.quantity,
        }))
      );
    }
  }, [user]);

  // Load cart from DB on login
  useEffect(() => {
    if (!user) return;
    const loadCart = async () => {
      const { data: dbItems } = await supabase
        .from("cart_items")
        .select("*, products(*)")
        .eq("user_id", user.id);

      if (dbItems && dbItems.length > 0) {
        const loaded: CartItem[] = dbItems
          .filter((item: any) => item.products)
          .map((item: any) => ({
            product: {
              id: item.products.id,
              name: item.products.name,
              price: item.products.price,
              originalPrice: item.products.original_price ?? undefined,
              image: item.products.image,
              category: item.products.category,
              badge: item.products.badge as any,
              description: item.products.description ?? "",
              sizes: item.products.sizes,
              inStock: item.products.in_stock,
            },
            quantity: item.quantity,
            size: item.size || "",
          }));

        setItems((prev) => {
          // Merge: DB items + any local items not in DB
          const merged = [...loaded];
          prev.forEach((localItem) => {
            if (!merged.find((m) => m.product.id === localItem.product.id && m.size === localItem.size)) {
              merged.push(localItem);
            }
          });
          // Sync merged back to DB
          syncToDb(merged);
          return merged;
        });
      } else if (items.length > 0) {
        // Push local cart to DB
        syncToDb(items);
      }
    };
    loadCart();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const addItem = useCallback((product: Product, size: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && i.size === size);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((i) =>
          i.product.id === product.id && i.size === size
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        updated = [...prev, { product, quantity: 1, size }];
      }
      syncToDb(updated);
      return updated;
    });
    setIsOpen(true);
  }, [syncToDb]);

  const removeItem = useCallback((productId: string, size: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => !(i.product.id === productId && i.size === size));
      syncToDb(updated);
      return updated;
    });
  }, [syncToDb]);

  const updateQuantity = useCallback((productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, size);
      return;
    }
    setItems((prev) => {
      const updated = prev.map((i) =>
        i.product.id === productId && i.size === size ? { ...i, quantity } : i
      );
      syncToDb(updated);
      return updated;
    });
  }, [removeItem, syncToDb]);

  const clearCart = useCallback(() => {
    setItems([]);
    syncToDb([]);
  }, [syncToDb]);

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, isOpen, setIsOpen, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
