import { useState, type ReactNode } from "react";
import { Shirt, User2, Image as ImageIcon, BookmarkCheck } from "lucide-react";

type Tab = "garments" | "body" | "scene" | "saved";

interface Props {
  garments: ReactNode;
  body: ReactNode;
  scene: ReactNode;
  saved: ReactNode;
  defaultTab?: Tab;
}

const TABS: { id: Tab; label: string; icon: typeof Shirt }[] = [
  { id: "garments", label: "Garments", icon: Shirt },
  { id: "body", label: "Body", icon: User2 },
  { id: "scene", label: "Scene", icon: ImageIcon },
  { id: "saved", label: "Saved", icon: BookmarkCheck },
];

export function StudioSidebar({ garments, body, scene, saved, defaultTab = "garments" }: Props) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const content = { garments, body, scene, saved }[tab];

  return (
    <div className="bg-card border border-border rounded-lg flex flex-col h-full overflow-hidden">
      <div role="tablist" aria-label="Studio panels" className="grid grid-cols-4 border-b border-border">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`flex flex-col items-center gap-1 py-2 text-[10px] font-display font-bold uppercase tracking-wider transition-all ${
                active
                  ? "text-primary border-b-2 border-primary -mb-px"
                  : "text-muted-foreground hover:text-foreground border-b-2 border-transparent -mb-px"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>
      <div className="flex-1 overflow-hidden">
        {tab === "garments" ? content : <div className="p-3 h-full overflow-y-auto">{content}</div>}
      </div>
    </div>
  );
}
