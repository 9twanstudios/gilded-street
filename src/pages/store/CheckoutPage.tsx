import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { formatPrice } from "@/hooks/use-products";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from "react-router-dom";
import { WhatsAppButton, buildOrderMessage } from "@/components/store/WhatsAppButton";
import { CheckCircle, CreditCard } from "lucide-react";
import { track } from "@/lib/tracking";
import { readAttribution } from "@/lib/attribution";
import { getProvider } from "@/lib/upal";
import SEO from "@/components/SEO";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [payMethod, setPayMethod] = useState<"pesapal" | "mpesa">("pesapal");
  const [pending, setPending] = useState<{ id: string; total: number; code: string | null; phone: string } | null>(null);
  const [mpesaCode, setMpesaCode] = useState("");
  const [paySubmitted, setPaySubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    if (!user) { toast.error("Please sign in to place an order."); return; }

    setLoading(true);
    try {
      const attribution = readAttribution();
      const phone = formData.get("phone") as string;
      const { data: created, error: fnError } = await supabase.functions.invoke("create-order", {
        body: {
          items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity, size: i.size })),
          phone,
          shipping_address: formData.get("address") as string,
          delivery_notes: formData.get("notes") as string,
          attribution,
        },
      });
      if (fnError) {
        let msg = fnError.message;
        try { msg = (await (fnError as any).context?.json())?.error ?? msg; } catch { /* keep default */ }
        throw new Error(msg);
      }
      if (created?.error) throw new Error(created.error);
      track.checkoutStarted(created.order_id, created.total);

      if (payMethod === "mpesa") {
        clearCart();
        setPending({ id: created.order_id, total: created.total, code: created.order_code ?? null, phone });
        return;
      }
      const provider = getProvider("pesapal");
      const res = await provider.createCheckout({
        orderId: created.order_id,
        amount: created.total,
        callbackUrl: `${window.location.origin}/account?tab=orders`,
        customer: { phone },
      });
      if (res.redirectUrl) window.location.href = res.redirectUrl;
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pending) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("wulfzz-record-payment", {
        body: { order_id: pending.id, method: "mpesa_till", provider_reference: mpesaCode, payer_phone: pending.phone },
      });
      if (error) {
        let msg = error.message;
        try { msg = (await (error as any).context?.json())?.error ?? msg; } catch { /* keep default */ }
        throw new Error(msg);
      }
      if (data?.error) throw new Error(data.error);
      setPaySubmitted(true);
    } catch (err: any) {
      toast.error(err.message || "Could not submit payment");
    } finally {
      setLoading(false);
    }
  };

  if (pending) {
    return (
      <div className="container py-20 max-w-md mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-8 w-8 text-success" />
        </div>
        <h1 className="font-heading text-4xl text-gold-gradient mb-2">Order Placed</h1>
        {pending.code && <p className="text-sm text-muted-foreground mb-1">Order <span className="text-primary font-bold">{pending.code}</span></p>}
        <p className="text-muted-foreground mb-8">Amount due: <span className="text-foreground font-bold">{formatPrice(pending.total)}</span></p>
        {paySubmitted ? (
          <p className="text-foreground mb-8">Payment received — pending confirmation by our dispatch team. We'll update you on WhatsApp.</p>
        ) : pending.code ? (
          <form onSubmit={submitPayment} className="space-y-4 text-left mb-8">
            <Label className="text-muted-foreground">Pay via M-Pesa, then enter the confirmation code</Label>
            <Input value={mpesaCode} onChange={(e) => setMpesaCode(e.target.value.toUpperCase())} placeholder="e.g. QHD8392KLM" maxLength={12} required className="bg-input border-border text-foreground focus:border-primary uppercase" />
            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
              {loading ? "Submitting..." : "Submit M-Pesa Code"}
            </Button>
          </form>
        ) : (
          <p className="text-muted-foreground mb-8">Our team will confirm payment details with you on WhatsApp.</p>
        )}
        <Button asChild variant="outline" className="border-primary text-primary font-display font-bold uppercase tracking-wider">
          <Link to="/account?tab=orders">View My Orders</Link>
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-heading text-4xl text-foreground mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some items to proceed to checkout.</p>
        <Button asChild className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
          <Link to="/shop">Shop Now</Link>
        </Button>
      </div>
    );
  }

  const waMessage = buildOrderMessage(
    items.map((i) => ({ name: i.product.name, size: i.size, quantity: i.quantity, price: i.product.price * i.quantity })),
    total
  );

  return (
    <div className="container py-8">
      <SEO title="Checkout | 91 Fitz" description="Complete your 91 Fitz order." noindex />
      <h1 className="font-heading text-5xl text-gold-gradient mb-8">Checkout</h1>

      {!user && (
        <div className="bg-card border border-primary/30 rounded-lg p-4 mb-6 flex items-center justify-between">
          <p className="text-muted-foreground text-sm">Sign in to place your order</p>
          <Button asChild size="sm" className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
            <Link to="/auth/sign-in">Sign In</Link>
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
                                className={`w-full flex items-center gap-3 p-4 rounded-lg border transition-all border-primary bg-primary/10`}
              >
                <CreditCard className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-display font-bold text-foreground">Pesapal</p>
                  <p className="text-xs text-muted-foreground">M-Pesa, Card, or Bank</p>
                </div>
              </button>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading || !user}
            className="w-full bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark shadow-gold hover:shadow-gold-lg transition-all duration-300"
          >
            {loading ? "Processing..." : `Pay ${formatPrice(total)} via M-Pesa / Pesapal`}
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
