import { User, Package, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  return (
    <div className="container py-8">
      <h1 className="font-heading text-5xl text-gold-gradient mb-8">My Account</h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-card rounded-lg border border-border p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-surface mx-auto mb-4 flex items-center justify-center">
            <User className="h-10 w-10 text-primary" />
          </div>
          <h3 className="font-display font-bold text-foreground">Guest User</h3>
          <p className="text-muted-foreground text-sm mt-1">Sign in to manage your account</p>
          <Button className="mt-4 bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark">
            Sign In
          </Button>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="font-display font-bold uppercase tracking-wider text-foreground">Recent Orders</h2>
            </div>
            <p className="text-muted-foreground text-sm">No orders yet. Start shopping!</p>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
