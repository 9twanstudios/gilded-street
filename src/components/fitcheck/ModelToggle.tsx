interface Props {
  value: "male" | "female";
  onChange: (v: "male" | "female") => void;
}
export function ModelToggle({ value, onChange }: Props) {
  return (
    <div role="group" aria-label="Choose model" className="inline-flex rounded-full border border-border bg-surface p-1">
      {(["male", "female"] as const).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={`px-4 py-1.5 rounded-full text-xs font-display font-bold uppercase tracking-wider transition-all ${
            value === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
          aria-pressed={value === m}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
