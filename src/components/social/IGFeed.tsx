import { useIGEmbeds } from "@/hooks/use-ig-embeds";
import { IGEmbed } from "./IGEmbed";
import { Instagram } from "lucide-react";

interface Props {
  scope?: "home_featured" | "creator";
  creatorId?: string;
  handle?: string;
  title?: string;
  subtitle?: string;
}

export function IGFeed({ scope = "home_featured", creatorId, handle, title = "Street Certified", subtitle }: Props) {
  const { data: embeds = [], isLoading } = useIGEmbeds(scope, creatorId);

  if (isLoading) {
    return (
      <section className="py-12 border-t border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="aspect-square rounded bg-surface animate-pulse" />)}
          </div>
        </div>
      </section>
    );
  }

  if (embeds.length === 0 && !handle) return null;

  return (
    <section className="py-12 border-t border-border">
      <div className="container">
        <div className="text-center mb-8">
          <p className="text-neon font-display font-bold uppercase tracking-[0.3em] text-xs mb-2">
            {subtitle || (handle ? `@${handle} on IG` : "@91fitz on IG")}
          </p>
          <h2 className="font-heading text-4xl text-gold-gradient">{title}</h2>
        </div>

        {embeds.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {embeds.map((e) => <IGEmbed key={e.id} url={e.post_url} caption={e.caption} />)}
          </div>
        )}

        {handle && (
          <div className="text-center">
            <a
              href={`https://instagram.com/${handle.replace(/^@/, "")}`}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2 rounded border border-primary text-primary font-display font-bold uppercase tracking-wider text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Instagram className="h-4 w-4" /> Follow @{handle.replace(/^@/, "")}
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
