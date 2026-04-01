import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

const ecosystemBrands = [
  {
    name: "91 Stay Woke",
    description: "Conscious culture. Stay awake to the movement.",
    url: "https://91staywoke.vercel.app",
    color: "from-primary/20 to-primary/5",
  },
  {
    name: "R3C Studios",
    description: "Music production & creative direction. Sound that moves.",
    url: "https://9twanstudios.vercel.app",
    color: "from-destructive/20 to-destructive/5",
  },
  {
    name: "LionByte",
    description: "Digital solutions & tech. Built for the bold.",
    url: "https://lionbyte.vercel.app",
    color: "from-blue-500/20 to-blue-500/5",
  },
];

export function EcosystemSection() {
  return (
    <section className="py-16 border-t border-border">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-primary font-display font-bold uppercase tracking-[0.3em] text-xs mb-2">The 91 Universe</p>
          <h2 className="font-heading text-4xl md:text-5xl text-gold-gradient">Our Ecosystem</h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto text-sm">
            More than streetwear — a movement across culture, sound, and tech.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ecosystemBrands.map((brand, i) => (
            <motion.a
              key={brand.name}
              href={brand.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`group bg-gradient-to-br ${brand.color} border border-border rounded-lg p-6 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold text-foreground text-lg">{brand.name}</h3>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-muted-foreground text-sm">{brand.description}</p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
