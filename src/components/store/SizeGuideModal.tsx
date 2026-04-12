import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Ruler } from "lucide-react";

const sizeData = [
  { size: "S", chest: "88-93", waist: "73-78", hips: "88-93", height: "165-170" },
  { size: "M", chest: "94-99", waist: "79-84", hips: "94-99", height: "170-175" },
  { size: "L", chest: "100-105", waist: "85-90", hips: "100-105", height: "175-180" },
  { size: "XL", chest: "106-111", waist: "91-96", hips: "106-111", height: "180-185" },
  { size: "XXL", chest: "112-117", waist: "97-102", hips: "112-117", height: "185-190" },
];

export function SizeGuideModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-xs text-primary hover:underline font-display font-semibold uppercase tracking-wider flex items-center gap-1">
          <Ruler className="h-3 w-3" /> Size Guide
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl text-foreground">Size Guide</DialogTitle>
        </DialogHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 px-2 text-muted-foreground font-display text-xs uppercase tracking-wider">Size</th>
                <th className="text-left py-2 px-2 text-muted-foreground font-display text-xs uppercase tracking-wider">Chest</th>
                <th className="text-left py-2 px-2 text-muted-foreground font-display text-xs uppercase tracking-wider">Waist</th>
                <th className="text-left py-2 px-2 text-muted-foreground font-display text-xs uppercase tracking-wider">Hips</th>
                <th className="text-left py-2 px-2 text-muted-foreground font-display text-xs uppercase tracking-wider">Height</th>
              </tr>
            </thead>
            <tbody>
              {sizeData.map((row) => (
                <tr key={row.size} className="border-b border-border/50">
                  <td className="py-2 px-2 font-display font-bold text-primary">{row.size}</td>
                  <td className="py-2 px-2 text-foreground">{row.chest}</td>
                  <td className="py-2 px-2 text-foreground">{row.waist}</td>
                  <td className="py-2 px-2 text-foreground">{row.hips}</td>
                  <td className="py-2 px-2 text-foreground">{row.height}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-muted-foreground mt-2">All measurements in cm.</p>
        </div>
        <div className="bg-surface rounded-lg p-3 mt-2">
          <p className="text-xs font-display font-bold text-neon uppercase tracking-wider mb-1">🇰🇪 East African Fit Notes</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Our cuts are relaxed — if between sizes, go with the smaller size for a fitted look.</li>
            <li>• Hoodies run slightly oversized by design for street style.</li>
            <li>• Cargo pants have an adjustable waist — size for hip fit.</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
