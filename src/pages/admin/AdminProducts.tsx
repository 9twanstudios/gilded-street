import { mockProducts, formatPrice } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function AdminProducts() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-4xl text-gold-gradient">Products</h1>
        <Button className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
          <Plus className="h-4 w-4 mr-2" /> Add Product
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Product</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Category</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Price</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Badge</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockProducts.map((product) => (
                <tr key={product.id} className="border-b border-border/50 hover:bg-surface-elevated transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
                      <span className="text-sm font-medium text-foreground">{product.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{product.category}</td>
                  <td className="p-4 text-sm text-primary font-display font-bold">{formatPrice(product.price)}</td>
                  <td className="p-4">
                    {product.badge && (
                      <span className="text-xs font-display font-bold uppercase tracking-wider px-2 py-1 rounded bg-primary/10 text-primary">
                        {product.badge}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-1.5 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
