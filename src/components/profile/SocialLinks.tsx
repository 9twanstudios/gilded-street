import { Instagram, Twitter, Youtube, MessageCircle, Music2 } from "lucide-react";

export type SocialHandles = {
  instagram?: string;
  tiktok?: string;
  x?: string;
  twitter?: string;
  youtube?: string;
  whatsapp?: string;
  website?: string;
};

const BUILDERS: Record<string, (h: string) => string> = {
  instagram: (h) => `https://instagram.com/${h.replace(/^@/, "")}`,
  tiktok: (h) => `https://www.tiktok.com/@${h.replace(/^@/, "")}`,
  x: (h) => `https://x.com/${h.replace(/^@/, "")}`,
  twitter: (h) => `https://x.com/${h.replace(/^@/, "")}`,
  youtube: (h) => (h.startsWith("http") ? h : `https://youtube.com/@${h.replace(/^@/, "")}`),
  whatsapp: (h) => `https://wa.me/${h.replace(/[^0-9]/g, "")}`,
  website: (h) => (h.startsWith("http") ? h : `https://${h}`),
};

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  tiktok: Music2,
  x: Twitter,
  twitter: Twitter,
  youtube: Youtube,
  whatsapp: MessageCircle,
};

export function SocialLinks({ socials, size = "md", className = "" }: { socials?: SocialHandles | null; size?: "sm" | "md"; className?: string }) {
  if (!socials) return null;
  const items = Object.entries(socials).filter(([, v]) => v && String(v).trim().length > 0);
  if (items.length === 0) return null;
  const sz = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {items.map(([k, v]) => {
        const Icon = ICONS[k];
        if (!Icon || !BUILDERS[k]) return null;
        return (
          <a
            key={k}
            href={BUILDERS[k](String(v))}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={k}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Icon className={sz} />
          </a>
        );
      })}
    </div>
  );
}
