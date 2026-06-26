import { Sparkles, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  loading: boolean;
  renderUrl: string | null;
  disabled?: boolean;
  onGenerate: () => void;
  onClose: () => void;
}

export function AiRenderPanel({ loading, renderUrl, disabled, onGenerate, onClose }: Props) {
  return (
    <div className="space-y-2">
      <Button
        onClick={onGenerate}
        disabled={loading || disabled}
        variant="outline"
        className="w-full border-primary/60 text-primary font-display font-bold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground"
      >
        <Sparkles className={`mr-2 h-4 w-4 ${loading ? "animate-pulse" : ""}`} />
        {loading ? "Rendering…" : renderUrl ? "Regenerate AI render" : "✨ Generate AI render"}
      </Button>

      {(loading || renderUrl) && (
        <div className="relative rounded-lg overflow-hidden border border-border bg-surface aspect-square">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 bg-background/60 backdrop-blur-sm">
              <Sparkles className="h-6 w-6 text-primary animate-pulse" />
              <p className="text-[10px] font-display font-bold uppercase tracking-wider text-foreground">
                Composing your look…
              </p>
              <p className="text-[10px] text-muted-foreground">15–30s</p>
            </div>
          )}
          {renderUrl && (
            <>
              <img src={renderUrl} alt="AI-rendered fit" className="w-full h-full object-cover" />
              <div className="absolute top-1.5 right-1.5 flex gap-1">
                <a
                  href={renderUrl}
                  download
                  aria-label="Download render"
                  className="bg-background/80 backdrop-blur p-1.5 rounded hover:bg-background text-foreground"
                >
                  <Download className="h-3 w-3" />
                </a>
                <button
                  onClick={onClose}
                  aria-label="Close render"
                  className="bg-background/80 backdrop-blur p-1.5 rounded hover:bg-background text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
      {!renderUrl && !loading && (
        <p className="text-[10px] text-muted-foreground italic">
          AI styles your stack into a photo-real look using your body + scene picks.
        </p>
      )}
    </div>
  );
}
