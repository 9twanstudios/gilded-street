import { useState, useRef, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useSaveFit, type FitItem, type BodyType, type Environment, type Fit } from "@/hooks/use-fits";
import { useProducts } from "@/hooks/use-products";
import { renderAndUploadFitCover } from "@/lib/fitcheck/render-card";
import { ModelToggle } from "@/components/fitcheck/ModelToggle";
import { SlotPalette } from "@/components/fitcheck/SlotPalette";
import { MannequinCanvas } from "@/components/fitcheck/MannequinCanvas";
import { FitActions } from "@/components/fitcheck/FitActions";
import { StudioSidebar } from "@/components/fitcheck/StudioSidebar";
import { BodyPanel } from "@/components/fitcheck/BodyPanel";
import { EnvironmentPanel } from "@/components/fitcheck/EnvironmentPanel";
import { SavedFitsPanel } from "@/components/fitcheck/SavedFitsPanel";
import { AiRenderPanel } from "@/components/fitcheck/AiRenderPanel";
import { useFitRender } from "@/hooks/use-fit-render";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import SEO from "@/components/SEO";

const ENV_BG: Record<Environment, string> = {
  studio: "from-zinc-100 to-zinc-300",
  street: "from-zinc-700 to-zinc-900",
  sunset: "from-orange-400 via-pink-500 to-purple-700",
  club: "from-purple-900 via-fuchsia-700 to-black",
  rooftop: "from-sky-500 via-indigo-600 to-slate-900",
};

export default function FitCheckPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const save = useSaveFit();
  const { data: products = [] } = useProducts();

  const [fitId, setFitId] = useState<string | undefined>();
  const [model, setModel] = useState<"male" | "female">("male");
  const [bodyType, setBodyType] = useState<BodyType>("regular");
  const [environment, setEnvironment] = useState<Environment>("studio");
  const [name, setName] = useState("Untitled Fit");
  const [items, setItems] = useState<FitItem[]>([]);
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

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

  const resetStudio = () => {
    setFitId(undefined);
    setItems([]);
    setName("Untitled Fit");
    setVisibility("private");
    setSelectedIdx(null);
  };

  const loadFit = (f: Fit) => {
    setFitId(f.id);
    setModel(f.model);
    setBodyType(f.body_type || "regular");
    setEnvironment(f.environment || "studio");
    setName(f.name);
    setItems(f.items || []);
    setVisibility(f.visibility);
    setSelectedIdx(null);
  };

  const handleSave = async () => {
    if (!user) return navigate("/auth/sign-in");
    try {
      const created = await save.mutateAsync({
        id: fitId, model, name, items, visibility, body_type: bodyType, environment,
      });
      if (created) {
        setFitId(created.id);
        if (canvasRef.current) {
          const url = await renderAndUploadFitCover(canvasRef.current, user.id, created.id);
          if (url) await save.mutateAsync({
            id: created.id, model, name, items, visibility, body_type: bodyType, environment, cover_image: url,
          });
        }
      }
    } catch {
      // surfaced via toast in useSaveFit
    }
  };

  return (
    <div className="container py-6 overflow-x-hidden">
      <SEO title="FitCheck Studio — Style your look | 91Fitz" description="Dress the model, pick a backdrop, save your fit, share with friends, shop the look." />

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <p className="text-neon font-display font-bold uppercase tracking-[0.3em] text-xs mb-1">FitCheck Studio</p>
          <h1 className="font-heading text-4xl md:text-5xl text-gold-gradient">
            {fitId ? "Editing fit" : "Style your fit"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {fitId ? "You're editing a saved look. Hit New to start fresh." : "Pick a model, layer drops, choose a backdrop, save & share."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {fitId && (
            <Button variant="ghost" size="sm" onClick={resetStudio} className="text-muted-foreground hover:text-primary">
              <Plus className="h-3.5 w-3.5 mr-1" /> New fit
            </Button>
          )}
          <Link to="/fits" className="text-xs font-display font-bold uppercase tracking-wider text-primary hover:underline">
            Community wall →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_300px] gap-4 items-start">
        {/* Left: Studio panels (tabbed) */}
        <div className="lg:h-[680px]">
          <StudioSidebar
            garments={<SlotPalette onPick={pick} />}
            body={<BodyPanel value={bodyType} onChange={setBodyType} />}
            scene={<EnvironmentPanel value={environment} onChange={setEnvironment} />}
            saved={<SavedFitsPanel onLoad={loadFit} currentId={fitId} />}
          />
        </div>

        {/* Center: Canvas + top bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <ModelToggle value={model} onChange={setModel} />
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Fit name"
              className="max-w-[220px] h-8 text-sm"
              placeholder="Name this fit"
            />
          </div>

          <div className={`rounded-lg bg-gradient-to-b ${ENV_BG[environment]} p-2 transition-colors`}>
            <MannequinCanvas
              ref={canvasRef}
              model={model}
              items={items}
              onUpdate={update}
              onRemove={remove}
              selectedIdx={selectedIdx}
              onSelect={setSelectedIdx}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-display font-bold uppercase tracking-wider text-muted-foreground">
            <span>Body: <span className="text-foreground">{bodyType}</span></span>
            <span>Scene: <span className="text-foreground">{environment}</span></span>
            <span>Items: <span className="text-foreground">{items.length}</span></span>
          </div>

          {items.length === 0 && (
            <p className="text-center text-xs text-muted-foreground">Open Garments → tap an item to start dressing.</p>
          )}
        </div>

        {/* Right: Stack + actions */}
        <div className="bg-card border border-border rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold uppercase tracking-wider text-xs text-foreground">In this fit</h2>
            {items.length > 0 && (
              <button
                onClick={() => setItems([])}
                aria-label="Clear all items"
                className="text-[10px] text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" /> Clear
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground">No items yet.</p>
          ) : (
            <ul className="space-y-1.5 max-h-48 overflow-y-auto">
              {items.map((it, i) => (
                <li
                  key={i}
                  className={`flex items-center gap-2 text-xs p-1 rounded cursor-pointer ${
                    selectedIdx === i ? "bg-primary/10" : "hover:bg-surface"
                  }`}
                  onClick={() => setSelectedIdx(i)}
                >
                  <img src={it.image} alt={it.name} loading="lazy" className="h-8 w-8 rounded object-cover bg-surface" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-display font-bold text-foreground">{it.name}</p>
                    <p className="text-primary">KES {it.price.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); remove(i); }}
                    aria-label={`Remove ${it.name}`}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
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
            shareUrl={fitId ? `${window.location.origin}/fits/${fitId}` : undefined}
          />
        </div>
      </div>
    </div>
  );
}
