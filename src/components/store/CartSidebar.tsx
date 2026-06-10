import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";

export function CartSidebar() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, total, itemCount } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card border-l border-border flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-2xl text-foreground">Cart ({itemCount})</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-primary transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.product.id}-${item.size}`} className="flex gap-4 bg-surface rounded-lg p-3">
                    <img src={item.product.image} alt={item.product.name} loading="lazy" className="w-20 h-20 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-display font-bold text-foreground truncate">{item.product.name}</h4>
                      <p className="text-xs text-muted-foreground">Size: {item.size}</p>
                      <p className="text-primary font-display font-bold text-sm mt-1">{formatPrice(item.product.price)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)} className="h-6 w-6 rounded bg-muted flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)} className="h-6 w-6 rounded bg-muted flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.product.id, item.size)} className="text-muted-foreground hover:text-destructive transition-colors self-start">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-border space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-display uppercase tracking-wider text-sm">Total</span>
                  <span className="text-primary font-heading text-3xl">{formatPrice(total)}</span>
                </div>
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark transition-all duration-300 shadow-gold hover:shadow-gold-lg"
                  onClick={() => setIsOpen(false)}
                >
                  <Link to="/checkout">Checkout</Link>
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
