export default function AdminUsers() {
  const users = [
    { id: "usr-1", name: "John Kamau", email: "john@example.com", orders: 3, joined: "2026-01-15" },
    { id: "usr-2", name: "Amina Wanjiku", email: "amina@example.com", orders: 7, joined: "2025-11-20" },
    { id: "usr-3", name: "Brian Ochieng", email: "brian@example.com", orders: 1, joined: "2026-03-01" },
    { id: "usr-4", name: "Grace Muthoni", email: "grace@example.com", orders: 5, joined: "2026-02-10" },
  ];

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
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Orders</th>
                <th className="text-left p-4 text-xs font-display uppercase tracking-wider text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border/50 hover:bg-surface-elevated transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary text-xs font-bold">{user.name[0]}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{user.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                  <td className="p-4 text-sm text-primary font-display font-bold">{user.orders}</td>
                  <td className="p-4 text-sm text-muted-foreground">{new Date(user.joined).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
