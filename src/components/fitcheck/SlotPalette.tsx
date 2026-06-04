import { useState, useMemo } from "react";
import { useProducts, formatPrice } from "@/hooks/use-products";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const SLOTS = ["top", "bottom", "outerwear", "shoes", "hat", "accessory", "fullbody"] as const;
export type Slot = typeof SLOTS[number];

const Z_BY_SLOT: Record<Slot, number> = {
  hat: 50, accessory: 40, outerwear: 30, top: 20, fullbody: 15, bottom: 10, shoes: 5,
};

interface Props {
  onPick: (item: { product: any; slot: Slot; z: number }) => void;
}

export function SlotPalette({ onPick }: Props) {
  const { data: products = [], isLoading } = useProducts();
  const [slot, setSlot] = useState<Slot>("top");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return products.filter((p: any) => {
      const matchSlot = (p.fit_slot && p.fit_slot === slot) ||
        (!p.fit_slot && inferSlot(p.category) === slot);
      const matchQ = !q || p.name.toLowerCase().includes(q.toLowerCase());
      return matchSlot && matchQ;
    });
  }, [products, slot, q]);

  return (
    <div className="bg-card border border-border rounded-lg flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="flex flex-wrap gap-1 mb-2">
          {SLOTS.map((s) => (
            <button
              key={s}
              onClick={() => setSlot(s)}
              className={`px-2.5 py-1 rounded text-[10px] font-display font-bold uppercase tracking-wider transition-all ${
                slot === s ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="pl-7 h-8 text-xs" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-2">
        {isLoading && <p className="col-span-2 text-xs text-muted-foreground p-3">Loading…</p>}
        {!isLoading && filtered.length === 0 && (
          <p className="col-span-2 text-xs text-muted-foreground p-3 text-center">No items in this slot.</p>
        )}
        {filtered.map((p: any) => (
          <button
            key={p.id}
            onClick={() => onPick({ product: p, slot, z: Z_BY_SLOT[slot] })}
            className="group flex flex-col bg-surface rounded overflow-hidden border border-border hover:border-primary transition-colors text-left"
          >
            <div className="aspect-square bg-background">
              <img src={p.fit_image || p.image} alt={p.name} className="w-full h-full object-contain" loading="lazy" />
            </div>
            <div className="p-1.5">
              <p className="text-[10px] font-display font-bold text-foreground truncate">{p.name}</p>
              <p className="text-[10px] text-primary">{formatPrice(p.price)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function inferSlot(cat: string): Slot {
  const c = (cat || "").toLowerCase();
  if (/(hoodie|jacket|coat|outer)/.test(c)) return "outerwear";
  if (/(tee|shirt|top|jersey)/.test(c)) return "top";
  if (/(pant|trouser|short|bottom|jean)/.test(c)) return "bottom";
  if (/(shoe|sneaker|boot)/.test(c)) return "shoes";
  if (/(hat|cap|beanie)/.test(c)) return "hat";
  if (/(acc|bag|chain|glasses)/.test(c)) return "accessory";
  return "top";
}
