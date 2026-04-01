import { Link } from "react-router-dom";
import { useDrops } from "@/hooks/use-drops";
import { CountdownTimer } from "@/components/store/CountdownTimer";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

export default function DropsPage() {
  const { data: drops, isLoading } = useDrops();

  const upcoming = drops?.filter((d) => new Date(d.drop_date) > new Date()) ?? [];
  const past = drops?.filter((d) => new Date(d.drop_date) <= new Date()) ?? [];

  return (
    <div className="container py-8">
      <Helmet>
        <title>Drops — 9twanfitz Streetwear</title>
        <meta name="description" content="Upcoming and past drops from 9twanfitz. Limited edition streetwear from Nairobi." />
      </Helmet>

      <h1 className="font-heading text-5xl text-gold-gradient mb-8">Drops</h1>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="mb-12">
              <h2 className="font-display font-bold uppercase tracking-wider text-foreground mb-4">Upcoming</h2>
              <div className="grid gap-4">
                {upcoming.map((drop, i) => (
                  <motion.div
                    key={drop.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link
                      to={`/drops/${drop.slug}`}
                      className="block bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-gold"
                    >
                      {drop.cover_image && (
                        <div className="aspect-[3/1] overflow-hidden">
                          <img src={drop.cover_image} alt={drop.title} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="font-heading text-2xl text-foreground mb-2">{drop.title}</h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{drop.description}</p>
                        <CountdownTimer targetDate={drop.drop_date} />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="font-display font-bold uppercase tracking-wider text-foreground mb-4">Past Drops</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {past.map((drop, i) => (
                  <motion.div key={drop.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link
                      to={`/drops/${drop.slug}`}
                      className="block bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300"
                    >
                      {drop.cover_image && (
                        <div className="aspect-video overflow-hidden">
                          <img src={drop.cover_image} alt={drop.title} className="w-full h-full object-cover opacity-70" loading="lazy" />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-display font-bold text-foreground text-sm">{drop.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(drop.drop_date).toLocaleDateString()}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {!upcoming.length && !past.length && (
            <p className="text-muted-foreground text-center py-20">No drops yet. Stay tuned!</p>
          )}
        </>
      )}
    </div>
  );
}
