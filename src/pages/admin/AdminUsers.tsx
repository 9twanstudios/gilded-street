import { useAdminUsers } from "@/hooks/use-admin";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Shield, Star } from "lucide-react";

export default function AdminUsers() {
  const { data: users, isLoading } = useAdminUsers();
  const queryClient = useQueryClient();

  const { data: roles } = useQuery({
    queryKey: ["all-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data;
    },
  });

  const getUserRoles = (userId: string) => roles?.filter((r: any) => r.user_id === userId).map((r: any) => r.role) || [];

  const toggleRole = async (userId: string, role: "creator" | "admin") => {
    const currentRoles = getUserRoles(userId);
    if (currentRoles.includes(role)) {
      // Remove role
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
      if (error) { toast.error(error.message); return; }
      toast.success(`Removed ${role} role`);
    } else {
      // Add role
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role } as any);
      if (error) { toast.error(error.message); return; }
      toast.success(`Added ${role} role`);
    }
    queryClient.invalidateQueries({ queryKey: ["all-user-roles"] });
  };

  return (
    <div>
      <h1 className="font-heading text-4xl text-gold-gradient mb-6">Users</h1>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Name</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Email</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Roles</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Joined</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="p-4 text-muted-foreground text-center">Loading...</td></tr>
              ) : !users?.length ? (
                <tr><td colSpan={5} className="p-4 text-muted-foreground text-center">No users yet</td></tr>
              ) : (
                users.map((user: any) => {
                  const userRoles = getUserRoles(user.id);
                  return (
                    <tr key={user.id} className="border-b border-border/50 hover:bg-surface-elevated transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <span className="text-primary text-xs font-bold">{(user.full_name || user.email || "?")[0].toUpperCase()}</span>
                          </div>
                          <span className="text-sm font-medium text-foreground">{user.full_name || "—"}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {userRoles.map((r: string) => (
                            <span key={r} className={`text-xs font-display font-bold uppercase tracking-wider px-2 py-1 rounded ${
                              r === "admin" ? "bg-destructive/20 text-destructive" : r === "creator" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            }`}>{r}</span>
                          ))}
                          {userRoles.length === 0 && <span className="text-xs text-muted-foreground">user</span>}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={userRoles.includes("creator") ? "default" : "outline"}
                            onClick={() => toggleRole(user.id, "creator")}
                            className={`text-xs ${userRoles.includes("creator") ? "bg-primary text-primary-foreground" : "border-primary text-primary"}`}
                          >
                            <Star className="h-3 w-3 mr-1" />
                            {userRoles.includes("creator") ? "Creator ✓" : "Make Creator"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
