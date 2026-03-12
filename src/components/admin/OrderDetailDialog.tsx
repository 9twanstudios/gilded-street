import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { formatPrice } from "@/hooks/use-products";

interface OrderItem {
  id: string;
  product_id: string | null;
  quantity: number;
  size: string | null;
  price_at_time: number;
  products?: { name: string; image: string } | null;
}

interface Order {
  id: string;
  total: number;
  status: string;
  phone: string | null;
  shipping_address: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

interface OrderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

export function OrderDetailDialog({ open, onOpenChange, order }: OrderDetailDialogProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl text-primary">
            Order #{order.id.slice(0, 8)}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Placed on {new Date(order.created_at).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {order.phone && (
            <div>
              <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">Phone</span>
              <p className="text-sm text-foreground">{order.phone}</p>
            </div>
          )}
          {order.shipping_address && (
            <div>
              <span className="text-xs font-display uppercase tracking-wider text-muted-foreground">Address</span>
              <p className="text-sm text-foreground">{order.shipping_address}</p>
            </div>
          )}

          <div>
            <span className="text-xs font-display uppercase tracking-wider text-muted-foreground mb-2 block">Items</span>
            <div className="space-y-2">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-background rounded-lg p-3 border border-border/50">
                  <div className="flex items-center gap-3">
                    {item.products?.image && (
                      <img src={item.products.image} alt="" className="w-10 h-10 rounded object-cover" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {item.products?.name || "Unknown product"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.size && `Size: ${item.size} · `}Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-display font-bold text-primary">
                    {formatPrice(item.price_at_time)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-border">
            <span className="text-sm font-display uppercase tracking-wider text-muted-foreground">Total</span>
            <span className="text-lg font-heading text-primary">{formatPrice(order.total)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
