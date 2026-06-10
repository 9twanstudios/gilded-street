import { forwardRef, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { X, RotateCw, Maximize2 } from "lucide-react";
import modelMale from "@/assets/fitcheck/model-male.png";
import modelFemale from "@/assets/fitcheck/model-female.png";
import type { FitItem } from "@/hooks/use-fits";

// Design space — saved fit coordinates stay in this space, so existing fits remain valid.
const DESIGN_W = 360;
const DESIGN_H = 640;

interface Props {
  model: "male" | "female";
  items: FitItem[];
  onUpdate: (idx: number, patch: Partial<FitItem>) => void;
  onRemove: (idx: number) => void;
  selectedIdx: number | null;
  onSelect: (idx: number | null) => void;
}

export const MannequinCanvas = forwardRef<HTMLDivElement, Props>(function MannequinCanvas(
  { model, items, onUpdate, onRemove, selectedIdx, onSelect }, ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / DESIGN_W));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const setRef = (el: HTMLDivElement | null) => {
    containerRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) (ref as any).current = el;
  };
  const src = model === "male" ? modelMale : modelFemale;

  return (
    <div ref={wrapperRef} className="w-full max-w-[360px] mx-auto" style={{ height: DESIGN_H * scale }}>
      <div
        ref={setRef}
        className="relative bg-gradient-to-b from-surface to-background rounded-lg border border-border overflow-hidden select-none"
        style={{ width: DESIGN_W, height: DESIGN_H, transform: `scale(${scale})`, transformOrigin: "top left" }}
        onClick={(e) => { if (e.target === e.currentTarget) onSelect(null); }}
      >
        <img src={src} alt={`${model} mannequin`} className="absolute inset-0 w-full h-full object-contain pointer-events-none" draggable={false} />

        {items.map((it, idx) => (
          <motion.div
            key={idx}
            drag
            dragMomentum={false}
            onDragEnd={(_, info) => onUpdate(idx, { x: it.x + info.offset.x / scale, y: it.y + info.offset.y / scale })}
            onClick={(e) => { e.stopPropagation(); onSelect(idx); }}
            className={`absolute cursor-move ${selectedIdx === idx ? "outline outline-2 outline-primary outline-offset-2" : ""}`}
            style={{
              left: "50%",
              top: "50%",
              x: it.x,
              y: it.y,
              rotate: it.rotation,
              zIndex: it.z,
              width: 160 * it.scale,
              height: 160 * it.scale,
              translateX: "-50%",
              translateY: "-50%",
            }}
          >
            <img src={it.image} alt={it.name} className="w-full h-full object-contain pointer-events-none" draggable={false} />
            {selectedIdx === idx && (
              <div className="absolute -top-3 -right-3 flex gap-1">
                <button
                  onClick={(e) => { e.stopPropagation(); onUpdate(idx, { rotation: it.rotation + 15 }); }}
                  className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-gold"
                  aria-label="Rotate item"
                ><RotateCw className="h-3 w-3" /></button>
                <button
                  onClick={(e) => { e.stopPropagation(); onUpdate(idx, { scale: Math.min(2.5, it.scale + 0.15) }); }}
                  className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-gold"
                  aria-label="Make item bigger"
                ><Maximize2 className="h-3 w-3" /></button>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
                  className="h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                  aria-label="Remove item"
                ><X className="h-3 w-3" /></button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
});
