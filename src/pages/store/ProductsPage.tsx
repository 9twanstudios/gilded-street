import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useProducts } from "@/hooks/use-products";
import { useDrops } from "@/hooks/use-drops";
import { ProductGrid } from "@/components/store/ProductGrid";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { QueryError } from "@/components/QueryError";

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low → High", value: "price-asc" },
  { label: "Price: High → Low", value: "price-desc" },
  { label: "Name A-Z", value: "name-asc" },
];

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under KES 2,000", min: 0, max: 2000 },
  { label: "KES 2,000 – 5,000", min: 2000, max: 5000 },
  { label: "KES 5,000 – 10,000", min: 5000, max: 10000 },
  { label: "Over KES 10,000", min: 10000, max: Infinity },
];

const PAGE_SIZE = 12;

export default function ProductsPage() {
  const { data: products, isLoading, isError, refetch } = useProducts();
  const { data: drops } = useDrops();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState("All");
  const [selectedDrop, setSelectedDrop] = useState("All");
  const [stockFilter, setStockFilter] = useState("all");
  const [priceRange, setPriceRange] = useState(0);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const badgeFilter = searchParams.get("badge");

  // Sync URL search param
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(q);
  }, [searchParams]);

  const categories = useMemo(() => {
    if (!products) return ["All"];
    return ["All", ...Array.from(new Set(products.map((p) => p.category)))];
  }, [products]);

  const allSizes = useMemo(() => {
    if (!products) return [];
    const sizeSet = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => sizeSet.add(s)));
    return Array.from(sizeSet).sort();
  }, [products]);

  const filtered = useMemo(() => {
    let result = products ?? [];
    if (badgeFilter) result = result.filter((p) => p.badge === badgeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.description?.toLowerCase().includes(q) ?? false));
    }
    if (category !== "All") result = result.filter((p) => p.category === category);
    if (selectedDrop !== "All") {
      const drop = drops?.find((d) => d.id === selectedDrop);
      if (drop) result = result.filter((p) => drop.product_ids.includes(p.id));
    }
    if (stockFilter === "in-stock") result = result.filter((p) => p.in_stock);
    else if (stockFilter === "out-of-stock") result = result.filter((p) => !p.in_stock);
    const range = PRICE_RANGES[priceRange];
    if (range && range.max !== Infinity) result = result.filter((p) => p.price >= range.min && p.price <= range.max);
    else if (range && range.min > 0) result = result.filter((p) => p.price >= range.min);
    if (selectedSizes.length > 0) result = result.filter((p) => selectedSizes.some((s) => p.sizes.includes(s)));
    result = [...result].sort((a, b) => {
      switch (sort) {
        case "price-asc": return a.price - b.price;
        case "price-desc": return b.price - a.price;
        case "name-asc": return a.name.localeCompare(b.name);
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
    return result;
  }, [products, drops, search, category, selectedDrop, stockFilter, priceRange, selectedSizes, sort, badgeFilter]);

  // Reset visible count when filters change
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [search, category, selectedDrop, stockFilter, priceRange, selectedSizes, sort, badgeFilter]);

  // Infinite scroll
  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filtered.length));
  }, [filtered.length]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) loadMore(); }, { rootMargin: "200px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const toggleSize = (size: string) => setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
  const activeFilterCount = [category !== "All" ? 1 : 0, selectedDrop !== "All" ? 1 : 0, stockFilter !== "all" ? 1 : 0, priceRange !== 0 ? 1 : 0, selectedSizes.length > 0 ? 1 : 0].reduce((a, b) => a + b, 0);
  const clearAllFilters = () => { setSearch(""); setCategory("All"); setSelectedDrop("All"); setStockFilter("all"); setPriceRange(0); setSelectedSizes([]); setSort("newest"); };

  if (isLoading) {
    return <div className="container py-8"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mt-20" /></div>;
  }

  if (isError && !products) {
    return (
      <div className="container py-8">
        <QueryError message="Couldn't load products. Check your connection and try again." onRetry={() => refetch()} />
      </div>
    );
  }

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="container py-8">
      <Helmet>
        <title>Shop 91 Fitz — Premium Streetwear Kenya | Hoodies, Tees, Cargo</title>
        <meta name="description" content="Browse 91 Fitz collection. Premium hoodies Kenya, streetwear tees, cargo pants. Filter by size, price, category. M-Pesa checkout. Nairobi same-day delivery." />
        <link rel="canonical" href="https://91fitz.com/shop" />
      </Helmet>

      <h1 className="font-heading text-5xl md:text-6xl text-gold-gradient mb-6">
        {badgeFilter ? `${badgeFilter} Drops` : "Shop"}
      </h1>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-surface border-border text-foreground placeholder:text-muted-foreground focus:border-primary" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>}
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-display font-semibold uppercase tracking-wider transition-all duration-200 ${showFilters || activeFilterCount > 0 ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}>
          <SlidersHorizontal className="h-4 w-4" /> Filters
          {activeFilterCount > 0 && <span className="h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">{activeFilterCount}</span>}
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="bg-card rounded-lg border border-border p-5 mb-6 space-y-5">
              {/* Drop Filter */}
              {drops && drops.length > 0 && (
                <div>
                  <p className="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground mb-2">Drop</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setSelectedDrop("All")} className={`px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-all duration-200 ${selectedDrop === "All" ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-elevated"}`}>All Drops</button>
                    {drops.map((d) => (
                      <button key={d.id} onClick={() => setSelectedDrop(d.id)} className={`px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-all duration-200 ${selectedDrop === d.id ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-elevated"}`}>{d.title}</button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground mb-2">Price Range</p>
                <div className="flex flex-wrap gap-2">
                  {PRICE_RANGES.map((range, i) => (
                    <button key={i} onClick={() => setPriceRange(i)} className={`px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-all duration-200 ${priceRange === i ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-elevated"}`}>{range.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  {allSizes.map((size) => (
                    <button key={size} onClick={() => toggleSize(size)} className={`min-w-[2.5rem] h-8 px-2.5 rounded border text-xs font-display font-semibold transition-all duration-200 ${selectedSizes.includes(size) ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary hover:text-primary"}`}>{size}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground mb-2">Sort By</p>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((opt) => (
                    <button key={opt.value} onClick={() => setSort(opt.value)} className={`px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-all duration-200 ${sort === opt.value ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-elevated"}`}>{opt.label}</button>
                  ))}
                </div>
              </div>
              {/* Availability Filter */}
              <div>
                <p className="text-xs font-display font-bold uppercase tracking-wider text-muted-foreground mb-2">Availability</p>
                <div className="flex flex-wrap gap-2">
                  {[{ label: "All", value: "all" }, { label: "In Stock", value: "in-stock" }, { label: "Out of Stock", value: "out-of-stock" }].map((opt) => (
                    <button key={opt.value} onClick={() => setStockFilter(opt.value)} className={`px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-all duration-200 ${stockFilter === opt.value ? "bg-primary text-primary-foreground" : "bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-elevated"}`}>{opt.label}</button>
                  ))}
                </div>
              </div>
              {activeFilterCount > 0 && <button onClick={clearAllFilters} className="text-xs text-destructive hover:underline font-display font-semibold uppercase tracking-wider">Clear All Filters</button>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-display font-semibold uppercase tracking-wider transition-all duration-200 ${category === cat ? "bg-primary text-primary-foreground shadow-gold" : "bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-elevated"}`}>{cat}</button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mb-4 font-display uppercase tracking-wider">
        {filtered.length} {filtered.length === 1 ? "product" : "products"} found
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg mb-2">No products match your filters</p>
          <button onClick={clearAllFilters} className="text-primary hover:underline text-sm font-display font-semibold uppercase tracking-wider">Clear Filters</button>
        </div>
      ) : (
        <>
          <ProductGrid products={visible} />
          {visibleCount < filtered.length && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
