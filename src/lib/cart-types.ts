// Cart domain types (formerly in src/lib/data.ts, now without the legacy mock data).
export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  badge?: "NEW" | "LIMITED" | "SALE";
  description: string;
  sizes: string[];
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}
