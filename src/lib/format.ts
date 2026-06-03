// Canonical money formatters. Prices are stored as whole KES integers.
export function formatKES(amount: number | null | undefined): string {
  const n = Number(amount ?? 0);
  return `KES ${n.toLocaleString("en-KE")}`;
}
export const formatPrice = formatKES;

export function formatDate(d: string | Date | null | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-KE", opts ?? { year: "numeric", month: "short", day: "numeric" });
}

export function formatDateTime(d: string | Date | null | undefined): string {
  if (!d) return "—";
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
}
