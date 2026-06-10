import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

export default function CartPage() {
  const { items, total, removeItem, updateQuantity } = useCart();

  return (
    <div className="container py-8 max-w-3xl">
      <Helmet>
        <title>Cart — 91 Fitz</title>
      </Helmet>

      <h1 className="font-heading text-5xl text-gold-gradient mb-8">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-6">Your cart is empty</p>
          <Button asChild className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-8">
            {items.map((item, i) => (
              <motion.div
                key={`${item.product.id}-${item.size}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-4 bg-card border border-border rounded-lg p-4"
              >
                <img src={item.product.image} alt={item.product.name} className="w-20 h-20 rounded object-cover bg-surface" />
                <div className="flex-1 min-w-0">
                  <Link to={`/products/${item.product.id}`} className="font-display font-bold text-foreground hover:text-primary transition-colors text-sm truncate block">
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">Size: {item.size}</p>
                  <p className="text-primary font-heading text-lg mt-1">{formatPrice(item.product.price * item.quantity)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeItem(item.product.id, item.size)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2 bg-surface rounded">
                    <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)} className="p-1.5 text-muted-foreground hover:text-foreground">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-display font-bold text-foreground w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)} className="p-1.5 text-muted-foreground hover:text-foreground">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <span className="font-display font-bold uppercase tracking-wider text-foreground">Subtotal</span>
              <span className="text-primary font-heading text-3xl">{formatPrice(total)}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="flex-1 bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark shadow-gold">
                <Link to="/checkout">Proceed to Checkout</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 border-border text-muted-foreground font-display font-bold uppercase tracking-wider hover:border-primary hover:text-primary">
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
