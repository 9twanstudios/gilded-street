import { useAdminUsers } from "@/hooks/use-admin";

export default function AdminUsers() {
  const { data: users, isLoading } = useAdminUsers();

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
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={3} className="p-4 text-muted-foreground text-center">Loading...</td></tr>
              ) : !users?.length ? (
                <tr><td colSpan={3} className="p-4 text-muted-foreground text-center">No users yet</td></tr>
              ) : (
                users.map((user: any) => (
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
                    <td className="p-4 text-sm text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
