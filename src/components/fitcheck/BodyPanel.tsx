import type { BodyType } from "@/hooks/use-fits";

const OPTIONS: { value: BodyType; label: string; hint: string }[] = [
  { value: "slim", label: "Slim", hint: "Lean, narrow frame" },
  { value: "regular", label: "Regular", hint: "Average proportions" },
  { value: "athletic", label: "Athletic", hint: "Broad shoulders" },
  { value: "curvy", label: "Curvy", hint: "Fuller silhouette" },
];

interface Props {
  value: BodyType;
  onChange: (v: BodyType) => void;
}

export function BodyPanel({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-display font-bold uppercase tracking-wider text-muted-foreground">Body type</p>
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={value === o.value}
            className={`text-left rounded border p-2 transition-all ${
              value === o.value
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border bg-surface text-muted-foreground hover:border-primary/50"
            }`}
          >
            <p className="text-xs font-display font-bold uppercase tracking-wider">{o.label}</p>
            <p className="text-[10px] mt-0.5">{o.hint}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
