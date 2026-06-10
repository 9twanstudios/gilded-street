import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function HeroBanner() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-background">
      {/* Video background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1920&q=80"
          className="w-full h-full object-cover opacity-30"
        >
          <source src="https://cdn.coverr.co/videos/coverr-walking-in-the-city-at-night-2559/1080p.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
      </div>

      {/* Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="text-[30vw] font-heading text-muted/10 leading-none">91</span>
      </div>

      {/* Neon accent line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-neon/60 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gold-gradient opacity-40" />

      <div className="container relative z-10 text-center px-4">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-neon font-display font-bold uppercase tracking-[0.4em] text-xs mb-4"
        >
          Premium Streetwear
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-heading text-6xl sm:text-8xl md:text-9xl text-gold-gradient leading-none mb-4"
        >
          91FITZ
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-foreground/80 text-lg md:text-2xl font-display font-bold uppercase tracking-[0.2em] mb-2"
        >
          Built in Kenya. Worn Worldwide.
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-muted-foreground text-sm md:text-base max-w-md mx-auto mb-8"
        >
          Limited drops. Bold designs. Street culture from Nairobi to the world.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild size="lg" className="bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider hover:bg-gold-dark transition-all duration-300 shadow-gold hover:shadow-gold-lg">
            <Link to="/shop">Enter the Drop</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-neon text-neon font-display font-bold uppercase tracking-wider hover:bg-neon hover:text-neon-foreground transition-all duration-300">
            <Link to="/products?badge=LIMITED">Limited Drops</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
