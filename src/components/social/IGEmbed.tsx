import { useEffect, useRef, useState } from "react";
import { Instagram, ExternalLink } from "lucide-react";

declare global {
  interface Window { instgrm?: { Embeds?: { process: () => void } } }
}

type LoaderState = "idle" | "loading" | "ready" | "failed";
let loaderState: LoaderState = "idle";
const listeners = new Set<(s: LoaderState) => void>();
function notify(next: LoaderState) {
  loaderState = next;
  listeners.forEach((l) => l(next));
}

function ensureLoader() {
  if (typeof document === "undefined") return;
  if (loaderState === "ready" || loaderState === "loading") return;
  if (window.instgrm?.Embeds) { notify("ready"); return; }
  notify("loading");
  let script = document.querySelector<HTMLScriptElement>('script[src*="instagram.com/embed.js"]');
  if (!script) {
    script = document.createElement("script");
    script.async = true;
    script.src = "https://www.instagram.com/embed.js";
    document.body.appendChild(script);
  }
  script.addEventListener("load", () => notify(window.instgrm?.Embeds ? "ready" : "failed"));
  script.addEventListener("error", () => notify("failed"));
  // Safety net: ad blockers can swallow the request without firing error.
  window.setTimeout(() => {
    if (loaderState === "loading") notify(window.instgrm?.Embeds ? "ready" : "failed");
  }, 8000);
}

/** Branded fallback when the Instagram embed script can't load (ad blockers, offline, IG down). */
function IGFallbackCard({ url, caption }: { url: string; caption?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[220px]">
      <Instagram className="h-8 w-8 text-primary" aria-hidden="true" />
      <p className="text-sm text-muted-foreground line-clamp-3">{caption || "This post couldn't be embedded."}</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-wider text-primary hover:underline"
      >
        View on Instagram <ExternalLink className="h-3 w-3" aria-hidden="true" />
      </a>
    </div>
  );
}

export function IGEmbed({ url, caption }: { url: string; caption?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loader, setLoader] = useState<LoaderState>(loaderState);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    const onState = (s: LoaderState) => setLoader(s);
    listeners.add(onState);
    ensureLoader();
    setLoader(loaderState);
    return () => { listeners.delete(onState); };
  }, []);

  // Once the script is ready, ask IG to process and watch for the iframe swap-in.
  useEffect(() => {
    if (loader !== "ready") return;
    window.instgrm?.Embeds?.process();
    let attempts = 0;
    const poll = window.setInterval(() => {
      attempts += 1;
      if (containerRef.current?.querySelector("iframe")) {
        setRendered(true);
        window.clearInterval(poll);
      } else if (attempts > 25) {
        window.clearInterval(poll);
      } else if (attempts % 5 === 0) {
        window.instgrm?.Embeds?.process();
      }
    }, 400);
    return () => window.clearInterval(poll);
  }, [loader, url]);

  if (loader === "failed") return <IGFallbackCard url={url} caption={caption} />;

  return (
    <div ref={containerRef} className="relative w-full">
      {!rendered && (
        <div className="absolute inset-0 rounded-lg bg-surface animate-pulse min-h-[220px]" aria-hidden="true" />
      )}
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
          minHeight: 220,
          padding: 0,
          width: "100%",
          opacity: rendered ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      >
        <div style={{ padding: 12 }}>
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "hsl(var(--primary))", textDecoration: "none" }}>
            {caption || "View on Instagram"}
          </a>
        </div>
      </blockquote>
    </div>
  );
}
