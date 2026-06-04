import { useEffect } from "react";

declare global {
  interface Window { instgrm?: { Embeds?: { process: () => void } } }
}

let loaderInjected = false;
function ensureLoader() {
  if (loaderInjected || typeof document === "undefined") return;
  if (document.querySelector('script[src*="instagram.com/embed.js"]')) { loaderInjected = true; return; }
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.instagram.com/embed.js";
  document.body.appendChild(s);
  loaderInjected = true;
}

export function IGEmbed({ url, caption }: { url: string; caption?: string }) {
  useEffect(() => {
    ensureLoader();
    const t = setTimeout(() => window.instgrm?.Embeds?.process(), 200);
    return () => clearTimeout(t);
  }, [url]);

  return (
    <blockquote
      className="instagram-media"
      data-instgrm-permalink={url}
      data-instgrm-version="14"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        borderRadius: 8,
        margin: 0,
        maxWidth: 540,
        minWidth: 280,
        padding: 0,
        width: "100%",
      }}
    >
      <div style={{ padding: 12 }}>
        <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "hsl(var(--primary))", textDecoration: "none" }}>
          {caption || "View on Instagram"}
        </a>
      </div>
    </blockquote>
  );
}
