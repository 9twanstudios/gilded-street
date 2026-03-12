// Mock product data for the store
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

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  customerName: string;
  customerEmail: string;
}

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "91FITZ SIGNATURE TEE",
    price: 4500,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=600&fit=crop",
    category: "T-Shirts",
    badge: "NEW",
    description: "Premium heavyweight cotton tee with embossed 91Fitz logo. Limited first-run edition with gold foil detailing on the back.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    id: "2",
    name: "URBAN CARGO PANTS",
    price: 8900,
    originalPrice: 12000,
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&h=600&fit=crop",
    category: "Pants",
    badge: "SALE",
    description: "Relaxed-fit cargo pants with multiple utility pockets. Made from premium ripstop cotton with reinforced knees.",
    sizes: ["28", "30", "32", "34", "36"],
    inStock: true,
  },
  {
    id: "3",
    name: "GOLD CHAIN HOODIE",
    price: 7500,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop",
    category: "Hoodies",
    badge: "LIMITED",
    description: "Oversized hoodie with gold chain print across the chest. 400gsm French terry cotton with kangaroo pocket.",
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
  },
  {
    id: "4",
    name: "STREET KING CAP",
    price: 2500,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=600&h=600&fit=crop",
    category: "Accessories",
    description: "Structured snapback cap with gold 91Fitz embroidery. Adjustable strap with metal clasp.",
    sizes: ["One Size"],
    inStock: true,
  },
  {
    id: "5",
    name: "MIDNIGHT BOMBER JACKET",
    price: 15000,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=600&fit=crop",
    category: "Jackets",
    badge: "LIMITED",
    description: "Premium satin bomber jacket with gold zipper hardware. Quilted lining with interior pockets. 91Fitz patch on sleeve.",
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
  },
  {
    id: "6",
    name: "DRIP GRAPHIC TEE",
    price: 3800,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&h=600&fit=crop",
    category: "T-Shirts",
    badge: "NEW",
    description: "Oversized graphic tee featuring original street art design. Screen-printed on 100% combed cotton.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    inStock: true,
  },
  {
    id: "7",
    name: "91 TRACK PANTS",
    price: 6200,
    image: "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=600&h=600&fit=crop",
    category: "Pants",
    description: "Slim-fit track pants with gold side stripe. Elastic waistband with drawstring and zippered pockets.",
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
  },
  {
    id: "8",
    name: "CROSSBODY BAG",
    price: 4200,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop",
    category: "Accessories",
    badge: "NEW",
    description: "Compact crossbody bag in premium nylon with gold hardware. Multiple compartments with waterproof lining.",
    sizes: ["One Size"],
    inStock: true,
  },
];

export const mockOrders: Order[] = [
  {
    id: "ORD-001",
    userId: "usr-1",
    items: [{ product: mockProducts[0], quantity: 2, size: "L" }],
    total: 9000,
    status: "delivered",
    createdAt: "2026-03-10T10:30:00Z",
    customerName: "John Kamau",
    customerEmail: "john@example.com",
  },
  {
    id: "ORD-002",
    userId: "usr-2",
    items: [{ product: mockProducts[2], quantity: 1, size: "M" }, { product: mockProducts[4], quantity: 1, size: "L" }],
    total: 22500,
    status: "processing",
    createdAt: "2026-03-11T14:15:00Z",
    customerName: "Amina Wanjiku",
    customerEmail: "amina@example.com",
  },
  {
    id: "ORD-003",
    userId: "usr-3",
    items: [{ product: mockProducts[1], quantity: 1, size: "32" }],
    total: 8900,
    status: "pending",
    createdAt: "2026-03-12T08:45:00Z",
    customerName: "Brian Ochieng",
    customerEmail: "brian@example.com",
  },
];

export const formatPrice = (price: number) => `KES ${price.toLocaleString()}`;
