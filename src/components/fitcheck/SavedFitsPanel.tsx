import { useMyFits, type Fit } from "@/hooks/use-fits";
import { Loader2 } from "lucide-react";

interface Props {
  onLoad: (fit: Fit) => void;
  currentId?: string;
}

export function SavedFitsPanel({ onLoad, currentId }: Props) {
  const { data: fits = [], isLoading } = useMyFits();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground p-3">
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading saved fits…
      </div>
    );
  }

  if (fits.length === 0) {
    return <p className="text-xs text-muted-foreground p-3 text-center">No saved fits yet. Build one →</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-1">
      {fits.map((f) => (
        <button
          key={f.id}
          onClick={() => onLoad(f)}
          className={`text-left rounded overflow-hidden border transition-all ${
            currentId === f.id ? "border-primary" : "border-border hover:border-primary/50"
          }`}
        >
          <div className="aspect-[3/4] bg-surface">
            {f.cover_image ? (
              <img src={f.cover_image} alt={f.name} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground">
                No preview
              </div>
            )}
          </div>
          <div className="p-1.5">
            <p className="text-[10px] font-display font-bold text-foreground truncate">{f.name}</p>
            <p className="text-[10px] text-muted-foreground">{(f.items || []).length} item{f.items?.length === 1 ? "" : "s"}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
