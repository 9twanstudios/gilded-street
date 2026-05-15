import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useWallet, formatKES } from "@/hooks/use-wallet";
import { formatPrice } from "@/hooks/use-products";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from "react-router-dom";
import { WhatsAppButton, buildOrderMessage } from "@/components/store/WhatsAppButton";
import { CheckCircle, Wallet, CreditCard } from "lucide-react";
import { track } from "@/lib/tracking";
import { readAttribution } from "@/lib/attribution";
import { getProvider } from "@/lib/upal";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { data: wallet } = useWallet();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [payMethod, setPayMethod] = useState<"pesapal" | "wallet">("pesapal");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    if (!user) { toast.error("Please sign in to place an order."); return; }

    setLoading(true);
    try {
      // Create order with captured attribution (utm/ref/qr) + surfaced SEO fields
      const attribution = readAttribution();
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total,
          shipping_address: formData.get("address") as string,
          phone: formData.get("phone") as string,
          status: "pending",
          attribution: attribution as any,
          traffic_source: attribution.traffic_source ?? "direct",
          seo_landing_page: attribution.landing ?? null,
          search_query: attribution.search_query ?? null,
        } as any)
        .select()
        .single();
      if (orderError) throw orderError;

      track.checkoutStarted(order.id, total);

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        size: item.size,
        price_at_time: item.product.price,
      }));
      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      if (payMethod === "wallet") {
        // Pay with wallet via edge function
        const { data, error } = await supabase.functions.invoke("wallet-pay", {
          body: { order_id: order.id },
        });
        if (error) throw new Error(error.message || "Wallet payment failed");
        if (data?.error) throw new Error(data.error);
        toast.success("Payment successful!");
        track.purchaseCompleted(order.id, total, items.length);
        setOrderPlaced(true);
        clearCart();
      } else {
        // Pay via UPAL provider (Pesapal today)
        const provider = getProvider("pesapal");
        const res = await provider.createCheckout({
          orderId: order.id,
          amount: total,
          callbackUrl: `${window.location.origin}/profile`,
          customer: { phone: formData.get("phone") as string },
        });
        if (res.redirectUrl) window.location.href = res.redirectUrl;
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="container py-20 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-green-600/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h1 className="font-heading text-4xl text-gold-gradient mb-4">Order Confirmed!</h1>
        <p className="text-muted-foreground mb-8">Your order has been placed and payment received.</p>
        <div className="flex flex-col gap-3">
          <Button asChild className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
            <Link to="/products">Continue Shopping</Link>
          </Button>
          <Button asChild variant="outline" className="border-primary text-primary font-display font-bold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground">
            <Link to="/profile">View My Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-heading text-4xl text-foreground mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some items to proceed to checkout.</p>
        <Button asChild className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
          <Link to="/products">Shop Now</Link>
        </Button>
      </div>
    );
  }

  const waMessage = buildOrderMessage(
    items.map((i) => ({ name: i.product.name, size: i.size, quantity: i.quantity, price: i.product.price * i.quantity })),
    total
  );
  const canPayWallet = wallet && wallet.balance >= total;

  return (
    <div className="container py-8">
      <h1 className="font-heading text-5xl text-gold-gradient mb-8">Checkout</h1>

      {!user && (
        <div className="bg-card border border-primary/30 rounded-lg p-4 mb-6 flex items-center justify-between">
          <p className="text-muted-foreground text-sm">Sign in to place your order</p>
          <Button asChild size="sm" className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-card rounded-lg border border-border p-6 space-y-4">
            <h2 className="font-display font-bold uppercase tracking-wider text-foreground">Shipping Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">First Name</Label>
                <Input name="firstName" required className="bg-input border-border text-foreground focus:border-primary" />
              </div>
              <div>
                <Label className="text-muted-foreground">Last Name</Label>
                <Input name="lastName" required className="bg-input border-border text-foreground focus:border-primary" />
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Phone</Label>
              <Input name="phone" type="tel" required placeholder="0712345678" className="bg-input border-border text-foreground focus:border-primary" />
            </div>
            <div>
              <Label className="text-muted-foreground">Address</Label>
              <Input name="address" required className="bg-input border-border text-foreground focus:border-primary" />
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="font-display font-bold uppercase tracking-wider text-foreground mb-4">Payment Method</h2>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setPayMethod("pesapal")}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all ${payMethod === "pesapal" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
              >
                <CreditCard className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-display font-bold text-foreground">Pesapal</p>
                  <p className="text-xs text-muted-foreground">M-Pesa, Card, or Bank</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPayMethod("wallet")}
                disabled={!canPayWallet}
                className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all ${payMethod === "wallet" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"} ${!canPayWallet ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Wallet className="h-5 w-5 text-primary" />
                <div className="text-left flex-1">
                  <p className="text-sm font-display font-bold text-foreground">Wallet Balance</p>
                  <p className="text-xs text-muted-foreground">{wallet ? formatKES(wallet.balance) : "Sign in to use"}</p>
                </div>
                {wallet && !canPayWallet && <span className="text-xs text-destructive">Insufficient</span>}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading || !user}
            className="w-full bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark shadow-gold hover:shadow-gold-lg transition-all duration-300"
          >
            {loading ? "Processing..." : payMethod === "wallet" ? `Pay ${formatPrice(total)} from Wallet` : `Pay ${formatPrice(total)} via Pesapal`}
          </Button>

          <div className="text-center text-xs text-muted-foreground uppercase tracking-wider font-display">or</div>

          <WhatsAppButton message={waMessage} label="Complete via WhatsApp" size="lg" className="w-full" />
        </form>

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
