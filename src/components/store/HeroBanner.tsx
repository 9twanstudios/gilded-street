import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function HeroBanner() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[30vw] font-heading text-muted/30 leading-none">91</span>
      </div>

      {/* Gold accent lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gold-gradient opacity-40" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gold-gradient opacity-40" />

      <div className="container relative z-10 text-center px-4">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-primary font-display font-bold uppercase tracking-[0.3em] text-sm mb-4"
        >
          Premium Streetwear
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-heading text-6xl sm:text-8xl md:text-9xl text-gold-gradient leading-none mb-6"
        >
          91FITZ
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto mb-8"
        >
          Bold designs for the streets. Limited drops, exclusive collections.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild size="lg" className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark transition-all duration-300 shadow-gold hover:shadow-gold-lg">
            <Link to="/products">Shop Collection</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-primary text-primary font-display font-bold uppercase tracking-wider hover:bg-primary hover:text-primary-foreground transition-all duration-300">
            <Link to="/products?badge=LIMITED">Limited Drops</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
