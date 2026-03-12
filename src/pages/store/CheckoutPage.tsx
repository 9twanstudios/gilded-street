import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Order placed successfully! M-Pesa payment prompt sent.");
    clearCart();
  };

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-heading text-4xl text-foreground mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground">Add some items to proceed to checkout.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="font-heading text-5xl text-gold-gradient mb-8">Checkout</h1>
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-lg border border-border p-6 space-y-4">
            <h2 className="font-display font-bold uppercase tracking-wider text-foreground">Shipping Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">First Name</Label>
                <Input required className="bg-input border-border text-foreground focus:border-primary" />
              </div>
              <div>
                <Label className="text-muted-foreground">Last Name</Label>
                <Input required className="bg-input border-border text-foreground focus:border-primary" />
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <Input type="email" required className="bg-input border-border text-foreground focus:border-primary" />
            </div>
            <div>
              <Label className="text-muted-foreground">Phone (M-Pesa)</Label>
              <Input type="tel" required placeholder="0712345678" className="bg-input border-border text-foreground focus:border-primary" />
            </div>
            <div>
              <Label className="text-muted-foreground">Address</Label>
              <Input required className="bg-input border-border text-foreground focus:border-primary" />
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="font-display font-bold uppercase tracking-wider text-foreground mb-4">Payment</h2>
            <div className="bg-surface rounded-lg p-4 text-center">
              <p className="text-primary font-display font-bold text-lg">M-Pesa</p>
              <p className="text-muted-foreground text-sm mt-1">You will receive a payment prompt on your phone</p>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark shadow-gold hover:shadow-gold-lg transition-all duration-300"
          >
            Pay {formatPrice(total)}
          </Button>
        </form>

        {/* Summary */}
        <div className="bg-card rounded-lg border border-border p-6 h-fit">
          <h2 className="font-display font-bold uppercase tracking-wider text-foreground mb-4">Order Summary</h2>
          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.size}`} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.product.name} × {item.quantity} ({item.size})</span>
                <span className="text-foreground font-medium">{formatPrice(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 flex justify-between">
            <span className="font-display font-bold uppercase tracking-wider text-foreground">Total</span>
            <span className="text-primary font-heading text-2xl">{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
