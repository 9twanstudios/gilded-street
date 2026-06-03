import { ReactNode } from "react";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

export function DataTable<T extends { id?: string | number }>({
  rows,
  columns,
  loading,
  empty,
}: {
  rows: T[] | undefined;
  columns: Column<T>[];
  loading?: boolean;
  empty?: ReactNode;
}) {
  if (loading) {
    return <div className="text-muted-foreground text-sm py-8 text-center">Loading…</div>;
  }
  if (!rows || rows.length === 0) {
    return (
      <div className="text-muted-foreground text-sm py-12 text-center border border-dashed border-border rounded-lg">
        {empty ?? "Nothing here yet."}
      </div>
    );
  }
  return (
    <div className="overflow-x-auto border border-border rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-surface">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`text-left px-4 py-3 font-display font-bold uppercase tracking-wider text-xs text-muted-foreground ${c.className ?? ""}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={(row.id as any) ?? i} className="border-t border-border hover:bg-surface/50 transition-colors">
              {columns.map((c) => (
                <td key={c.key} className={`px-4 py-3 text-foreground ${c.className ?? ""}`}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
