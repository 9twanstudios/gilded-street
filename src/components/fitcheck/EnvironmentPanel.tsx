import type { Environment } from "@/hooks/use-fits";

const OPTIONS: { value: Environment; label: string; gradient: string }[] = [
  { value: "studio", label: "Studio", gradient: "from-zinc-200 to-zinc-400" },
  { value: "street", label: "Street", gradient: "from-zinc-700 to-zinc-900" },
  { value: "sunset", label: "Sunset", gradient: "from-orange-400 via-pink-500 to-purple-700" },
  { value: "club", label: "Club", gradient: "from-purple-900 via-fuchsia-700 to-black" },
  { value: "rooftop", label: "Rooftop", gradient: "from-sky-500 via-indigo-600 to-slate-900" },
];

interface Props {
  value: Environment;
  onChange: (v: Environment) => void;
}

export function EnvironmentPanel({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-display font-bold uppercase tracking-wider text-muted-foreground">Backdrop</p>
      <div className="grid grid-cols-2 gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            aria-pressed={value === o.value}
            className={`relative aspect-[4/3] rounded overflow-hidden border-2 transition-all ${
              value === o.value ? "border-primary" : "border-border hover:border-primary/50"
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${o.gradient}`} />
            <span className="absolute bottom-1 left-1.5 text-[10px] font-display font-bold uppercase tracking-wider text-white drop-shadow">
              {o.label}
            </span>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground italic">AI render uses this backdrop (coming soon).</p>
    </div>
  );
}
