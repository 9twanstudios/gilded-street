import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const PRESETS = [
  "streetwear", "minimal", "vintage", "afrofuturism", "techwear", "luxury",
  "sportswear", "y2k", "monochrome", "graphic-tees", "outerwear", "denim",
];

export function ChipPicker({
  value,
  onChange,
  options = PRESETS,
  label,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  options?: string[];
  label?: string;
}) {
  const toggle = (v: string) =>
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);

  return (
    <div className="space-y-2">
      {label && <p className="text-xs font-display uppercase tracking-wider text-muted-foreground">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`px-3 py-1.5 rounded-full text-xs font-display font-semibold uppercase tracking-wider border transition-all ${
                active
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-surface text-muted-foreground border-border hover:border-primary hover:text-primary"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
      {value.filter((v) => !options.includes(v)).length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {value
            .filter((v) => !options.includes(v))
            .map((v) => (
              <Badge key={v} variant="outline" className="border-primary text-primary">
                {v}
                <button type="button" onClick={() => toggle(v)} className="ml-1"><X className="h-3 w-3" /></button>
              </Badge>
            ))}
        </div>
      )}
    </div>
  );
}
