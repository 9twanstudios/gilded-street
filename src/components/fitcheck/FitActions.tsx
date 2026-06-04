import { Button } from "@/components/ui/button";
import { Save, ShoppingBag, Share2, Globe, Lock } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import type { FitItem } from "@/hooks/use-fits";

interface Props {
  items: FitItem[];
  visibility: "private" | "public";
  onVisibility: (v: "private" | "public") => void;
  onSave: () => void;
  saving: boolean;
  shareUrl?: string;
}

export function FitActions({ items, visibility, onVisibility, onSave, saving, shareUrl }: Props) {
  const { addItem, setIsOpen } = useCart();

  const addAll = () => {
    if (items.length === 0) return toast.error("Add some items first");
    items.forEach((it) => {
      addItem({
        id: it.product_id,
        name: it.name,
        price: it.price,
        image: it.image,
        category: it.slot,
        description: "",
        sizes: ["M"],
        inStock: true,
      } as any, "M");
    });
    toast.success(`Added ${items.length} item${items.length > 1 ? "s" : ""} to cart`);
    setIsOpen(true);
  };

  const share = async () => {
    const url = shareUrl || window.location.href;
    const text = "Check out my 91Fitz fit 🔥";
    if (navigator.share) {
      try { await navigator.share({ title: "My 91Fitz Fit", text, url }); return; } catch {}
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied");
  };

  const shareWA = () => {
    const url = shareUrl || window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(`Check my 91Fitz fit 🔥 ${url}`)}`, "_blank");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={() => onVisibility(visibility === "public" ? "private" : "public")}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded border border-border bg-surface text-xs font-display font-bold uppercase tracking-wider hover:border-primary"
        >
          {visibility === "public" ? <Globe className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
          {visibility}
        </button>
      </div>
      <Button onClick={onSave} disabled={saving} className="w-full bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
        <Save className="mr-2 h-4 w-4" /> {saving ? "Saving…" : "Save fit"}
      </Button>
      <Button onClick={addAll} variant="outline" className="w-full border-primary text-primary font-display font-bold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground">
        <ShoppingBag className="mr-2 h-4 w-4" /> Add full outfit
      </Button>
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={share} variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
          <Share2 className="mr-1 h-3.5 w-3.5" /> Share
        </Button>
        <Button onClick={shareWA} variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
          WhatsApp
        </Button>
      </div>
    </div>
  );
}
