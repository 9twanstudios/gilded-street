import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ProductCard, ProductCardData } from "./ProductCard";

interface Props {
  title: string;
  subtitle?: string;
  products: ProductCardData[];
  cta?: { label: string; href: string };
}

export function RelatedCarousel({ title, subtitle, products, cta }: Props) {
  if (!products || products.length === 0) return null;
  return (
    <section className="mt-12">
      <div className="flex items-end justify-between mb-4">
        <div>
          {subtitle && <p className="text-neon font-display font-bold uppercase tracking-[0.3em] text-xs mb-1">{subtitle}</p>}
          <h2 className="font-heading text-3xl text-gold-gradient">{title}</h2>
        </div>
        {cta && (
          <a href={cta.href} className="text-xs font-display font-bold uppercase tracking-wider text-primary hover:underline">
            {cta.label} →
          </a>
        )}
      </div>
      <Carousel opts={{ align: "start", loop: false }} className="w-full">
        <CarouselContent className="-ml-3">
          {products.map((p, i) => (
            <CarouselItem key={p.id} className="pl-3 basis-1/2 sm:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <ProductCard product={p} index={i} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex -left-3" />
        <CarouselNext className="hidden sm:flex -right-3" />
      </Carousel>
    </section>
  );
}
