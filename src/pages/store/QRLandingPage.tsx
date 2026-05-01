import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, MapPin } from "lucide-react";
import { useQRCampaign, logQRScan } from "@/hooks/use-qr";
import { track } from "@/lib/tracking";
import SEO from "@/components/SEO";

export default function QRLandingPage() {
  const { slug } = useParams();
  const { data: campaign, isLoading } = useQRCampaign(slug);

  useEffect(() => {
    if (campaign?.id) {
      logQRScan(campaign.id);
      track.qrScanned(campaign.id, campaign.slug);
    }
  }, [campaign?.id, campaign?.slug]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background flex-col gap-4">
        <SEO title="Campaign not found" noindex />
        <h1 className="font-heading text-4xl text-gold-gradient">Drop expired</h1>
        <p className="text-muted-foreground">This campaign is no longer active.</p>
        <Link to="/" className="text-primary underline font-display uppercase tracking-wider text-sm">Return to 91 Fitz</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO title={`${campaign.name} | 91 Fitz Drop`} description={campaign.subheadline || campaign.description} noindex />

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        {campaign.hero_image && (
          <div className="absolute inset-0">
            <img src={campaign.hero_image} alt={campaign.headline} className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
          </div>
        )}
        <div className="relative z-10 text-center px-6 max-w-3xl">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-primary font-display uppercase tracking-[0.3em] text-xs mb-4">
            91 Fitz · Scan Drop
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-heading text-5xl md:text-7xl text-gold-gradient mb-6">
            {campaign.headline || campaign.name}
          </motion.h1>
          {campaign.subheadline && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-lg md:text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
              {campaign.subheadline}
            </motion.p>
          )}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Link
              to={campaign.cta_url || "/shop"}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider rounded hover:bg-gold-dark transition-colors"
            >
              {campaign.cta_label || "Shop Now"} <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Cultural context */}
      {campaign.description && (
        <section className="py-20 container max-w-3xl">
          <div className="border-l-2 border-primary pl-6">
            <h2 className="font-heading text-3xl text-foreground mb-4">The Story</h2>
            <p className="text-foreground/80 leading-relaxed whitespace-pre-line">{campaign.description}</p>
          </div>
        </section>
      )}

      {/* Tracking footer */}
      <section className="py-12 border-t border-border bg-surface">
        <div className="container text-center">
          <p className="text-muted-foreground text-xs font-display uppercase tracking-wider flex items-center justify-center gap-2">
            <MapPin className="h-3 w-3" /> Forged in Nairobi · Worn worldwide
          </p>
        </div>
      </section>
    </div>
  );
}
