import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useSaveFit, type FitItem } from "@/hooks/use-fits";
import { useProducts } from "@/hooks/use-products";
import { renderAndUploadFitCover } from "@/lib/fitcheck/render-card";
import { ModelToggle } from "@/components/fitcheck/ModelToggle";
import { SlotPalette } from "@/components/fitcheck/SlotPalette";
import { MannequinCanvas } from "@/components/fitcheck/MannequinCanvas";
import { FitActions } from "@/components/fitcheck/FitActions";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import { Link } from "react-router-dom";

export default function FitCheckPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const save = useSaveFit();
  const { data: products = [] } = useProducts();

  const [model, setModel] = useState<"male" | "female">("male");
  const [name, setName] = useState("Untitled Fit");
  const [items, setItems] = useState<FitItem[]>([]);
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Prefill from ?product=<id>
  useEffect(() => {
    const pid = params.get("product");
    if (!pid || products.length === 0 || items.length > 0) return;
    const p: any = products.find((x: any) => x.id === pid);
    if (!p) return;
    setItems([{
      product_id: p.id, slot: p.fit_slot || "top", z: 20, x: 0, y: 0, scale: 1, rotation: 0,
      image: p.fit_image || p.image, name: p.name, price: p.price,
    }]);
  }, [params, products, items.length]);

  const pick = ({ product, slot, z }: { product: any; slot: string; z: number }) => {
    setItems((prev) => [...prev, {
      product_id: product.id, slot, z, x: 0, y: 0, scale: 1, rotation: 0,
      image: product.fit_image || product.image, name: product.name, price: product.price,
    }]);
    setSelectedIdx(items.length);
  };
  const update = (idx: number, patch: Partial<FitItem>) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const remove = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
    setSelectedIdx(null);
  };

  const handleSave = async () => {
    if (!user) return navigate("/auth/sign-in");
    try {
      const created = await save.mutateAsync({ model, name, items, visibility });
      if (created && canvasRef.current) {
        const url = await renderAndUploadFitCover(canvasRef.current, user.id, created.id);
        if (url) await save.mutateAsync({ id: created.id, model, name, items, visibility, cover_image: url });
      }
    } catch {
      // useSaveFit already surfaces the error via toast; this prevents an unhandled rejection.
    }
  };

  return (
    <div className="container py-6 overflow-x-hidden">
      <SEO title="FitCheck — Style your look | 91Fitz" description="Dress the mannequin with 91Fitz drops. Save your fit, share with friends, shop the look." />
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <p className="text-neon font-display font-bold uppercase tracking-[0.3em] text-xs mb-1">FitCheck</p>
          <h1 className="font-heading text-4xl md:text-5xl text-gold-gradient">Style your fit</h1>
          <p className="text-muted-foreground text-sm mt-1">Pick a model, layer drops, save & share.</p>
        </div>
        <Link to="/fits" className="text-xs font-display font-bold uppercase tracking-wider text-primary hover:underline">
          Browse community wall →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-4 items-start">
        {/* Left: palette */}
        <div className="lg:h-[640px]">
          <SlotPalette onPick={pick} />
        </div>

        {/* Center: canvas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <ModelToggle value={model} onChange={setModel} />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="max-w-[200px] h-8 text-sm"
              placeholder="Name this fit"
            />
          </div>
          <MannequinCanvas
            ref={canvasRef}
            model={model}
            items={items}
            onUpdate={update}
            onRemove={remove}
            selectedIdx={selectedIdx}
            onSelect={setSelectedIdx}
          />
          {items.length === 0 && (
            <p className="text-center text-xs text-muted-foreground">Pick an item from the left to start dressing the model.</p>
          )}
        </div>

        {/* Right: actions */}
        <div className="bg-card border border-border rounded-lg p-3 space-y-3">
          <h2 className="font-display font-bold uppercase tracking-wider text-xs text-foreground">In this fit</h2>
          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground">No items yet.</p>
          ) : (
            <ul className="space-y-1.5 max-h-48 overflow-y-auto">
              {items.map((it, i) => (
                <li key={i} className="flex items-center gap-2 text-xs">
                  <img src={it.image} alt={it.name} loading="lazy" className="h-8 w-8 rounded object-cover bg-surface" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-display font-bold text-foreground">{it.name}</p>
                    <p className="text-primary">KES {it.price.toLocaleString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <FitActions
            items={items}
            visibility={visibility}
            onVisibility={setVisibility}
            onSave={handleSave}
            saving={save.isPending}
          />
        </div>
      </div>
    </div>
  );
}
