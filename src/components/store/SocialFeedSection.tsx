import { motion } from "framer-motion";
import { Instagram } from "lucide-react";

const socialPosts = [
  { image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=400&fit=crop", caption: "Street vibes 🔥", link: "#" },
  { image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=400&fit=crop", caption: "New drop loading", link: "#" },
  { image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&fit=crop", caption: "Nairobi nights", link: "#" },
  { image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&h=400&fit=crop", caption: "Built in Kenya 🇰🇪", link: "#" },
  { image: "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=400&h=400&fit=crop", caption: "Worn worldwide", link: "#" },
  { image: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&h=400&fit=crop", caption: "Culture coded", link: "#" },
];

export function SocialFeedSection() {
  return (
    <section className="py-12 border-t border-border">
      <div className="container">
        <div className="text-center mb-8">
          <p className="text-neon font-display font-bold uppercase tracking-[0.3em] text-xs mb-2">@91fitz on IG</p>
          <h2 className="font-heading text-4xl text-gold-gradient">Street Certified</h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {socialPosts.map((post, i) => (
            <motion.a
              key={i}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative aspect-square overflow-hidden rounded"
            >
              <img src={post.image} alt={post.caption} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Instagram className="h-6 w-6 text-primary" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
