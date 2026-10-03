import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatPrice } from "@/hooks/use-products";

export interface SpotlightSlide {
  id: string;
  kicker: string;
  title: string;
  subtitle?: string | null;
  image?: string | null;
  price?: number | null;
  cta: { label: string; to: string };
}

const DURATION = 7000;

export function AnimeSpotlightHero({ slides }: { slides: SpotlightSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const count = slides.length;

  const go = useCallback((i: number) => { setIndex(((i % count) + count) % count); setProgress(0); }, [count]);

  useEffect(() => {
    if (paused || count < 2) return;
    let last = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const dt = t - last; last = t;
      setProgress((p) => {
        const n = p + dt / DURATION;
        if (n >= 1) { setIndex((i) => (i + 1) % count); return 0; }
        return n;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, count]);

  if (count === 0) return null;
  const s = slides[Math.min(index, count - 1)];

  return (
    <section
      className="relative min-h-[80vh] overflow-hidden bg-background"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Spotlight"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={s.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {s.image && <img src={s.image} alt="" className="w-full h-full object-cover opacity-50" />}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="container relative z-10 flex min-h-[80vh] items-center px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={s.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.4 }}
            className="max-w-xl"
          >
            <p className="text-neon font-display font-bold uppercase tracking-[0.35em] text-xs mb-3">{s.kicker}</p>
            <h1 className="font-heading text-5xl sm:text-7xl md:text-8xl text-gold-gradient leading-none mb-4">{s.title}</h1>
            {s.subtitle && <p className="text-foreground/80 text-base md:text-lg mb-4 line-clamp-3">{s.subtitle}</p>}
            {s.price != null && <p className="font-heading text-3xl text-primary mb-4">{formatPrice(s.price)}</p>}
            <Link
              to={s.cta.to}
              className="inline-block bg-primary text-primary-foreground px-7 py-3 rounded font-display font-bold uppercase tracking-wider text-sm hover:bg-gold-dark transition-colors shadow-gold"
            >
              {s.cta.label}
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {count > 1 && (
        <>
          <button aria-label="Previous slide" onClick={() => go(index - 1)} className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-background/50 text-foreground hover:text-primary">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button aria-label="Next slide" onClick={() => go(index + 1)} className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-background/50 text-foreground hover:text-primary">
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-6 left-0 right-0 z-20">
            <div className="container flex gap-2 px-4">
              {slides.map((sl, i) => (
                <button key={sl.id} onClick={() => go(i)} aria-label={`Go to slide ${i + 1}: ${sl.title}`} className="flex-1 py-2">
                  <span className="block h-1 rounded-full bg-foreground/20 overflow-hidden">
                    <span
                      className="block h-full bg-primary"
                      style={{ width: i < index ? "100%" : i === index ? `${progress * 100}%` : "0%" }}
                    />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
