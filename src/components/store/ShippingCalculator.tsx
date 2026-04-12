import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Truck, Zap } from "lucide-react";
import { formatPrice } from "@/hooks/use-products";

const counties: { name: string; rate: number; sameDay?: boolean }[] = [
  { name: "Nairobi", rate: 200, sameDay: true },
  { name: "Kiambu", rate: 250, sameDay: true },
  { name: "Machakos", rate: 300 },
  { name: "Kajiado", rate: 300 },
  { name: "Nakuru", rate: 350 },
  { name: "Mombasa", rate: 400 },
  { name: "Kisumu", rate: 400 },
  { name: "Uasin Gishu", rate: 400 },
  { name: "Nyeri", rate: 350 },
  { name: "Meru", rate: 350 },
  { name: "Kilifi", rate: 450 },
  { name: "Kwale", rate: 450 },
  { name: "Embu", rate: 350 },
  { name: "Kirinyaga", rate: 350 },
  { name: "Murang'a", rate: 300 },
  { name: "Nyandarua", rate: 350 },
  { name: "Laikipia", rate: 400 },
  { name: "Trans-Nzoia", rate: 400 },
  { name: "Bungoma", rate: 450 },
  { name: "Kakamega", rate: 450 },
  { name: "Nandi", rate: 400 },
  { name: "Kericho", rate: 400 },
  { name: "Bomet", rate: 400 },
  { name: "Narok", rate: 400 },
  { name: "Other County", rate: 500 },
];

interface ShippingCalculatorProps {
  onSelect?: (county: string, rate: number) => void;
}

export function ShippingCalculator({ onSelect }: ShippingCalculatorProps) {
  const [selected, setSelected] = useState<string>("");

  const county = counties.find((c) => c.name === selected);

  const handleChange = (val: string) => {
    setSelected(val);
    const c = counties.find((co) => co.name === val);
    if (c && onSelect) onSelect(val, c.rate);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-display font-bold uppercase tracking-wider text-foreground">Shipping</p>
      <Select value={selected} onValueChange={handleChange}>
        <SelectTrigger className="bg-surface border-border text-foreground">
          <SelectValue placeholder="Select county" />
        </SelectTrigger>
        <SelectContent className="bg-card border-border max-h-60">
          {counties.map((c) => (
            <SelectItem key={c.name} value={c.name}>
              {c.name} — {formatPrice(c.rate)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {county && (
        <div className="flex items-center gap-2 text-sm">
          {county.sameDay ? (
            <span className="flex items-center gap-1 text-neon font-display font-bold text-xs">
              <Zap className="h-3 w-3" /> Same-Day Delivery Available
            </span>
          ) : (
            <span className="flex items-center gap-1 text-muted-foreground text-xs">
              <Truck className="h-3 w-3" /> 2–4 business days
            </span>
          )}
        </div>
      )}
    </div>
  );
}
