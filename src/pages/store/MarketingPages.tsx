import SEO from "@/components/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function Shell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="container py-12 max-w-3xl">
      <SEO title={`${title} | 91Fitz`} description={description} />
      <h1 className="font-heading text-5xl text-gold-gradient mb-4">{title}</h1>
      <div className="prose prose-invert text-foreground/90 leading-relaxed space-y-4">{children}</div>
      <div className="mt-10"><Button asChild variant="outline" className="border-primary text-primary"><Link to="/">Back home</Link></Button></div>
    </div>
  );
}

export function AboutPage() {
  return <Shell title="About 91Fitz" description="91Fitz — Pan-African streetwear forged in Nairobi. Heritage uniforms, limited drops, continent-wide reach.">
    <p>91Fitz is a Pan-African streetwear platform. Not merch — uniform. We build heritage drops with creators across the continent and ship continent-wide.</p>
    <p>Founded in Nairobi. Drops are immersive campaigns: a story, a soundtrack, a fit. Each piece is part of a numbered uniform.</p>
    <p>Our creator economy runs on a 90/10 split with an immutable ledger. Creators keep 90% of every sale. We handle logistics, payments, marketing.</p>
  </Shell>;
}

export function ContactPage() {
  return <Shell title="Contact" description="Get in touch with 91Fitz — WhatsApp +254769254086, or email hello@91fitz.com.">
    <p>WhatsApp: <a className="text-primary" href="https://wa.me/254769254086">+254 769 254 086</a></p>
    <p>Email: <a className="text-primary" href="mailto:hello@91fitz.com">hello@91fitz.com</a></p>
    <p>Press / partnerships: <a className="text-primary" href="mailto:press@91fitz.com">press@91fitz.com</a></p>
    <p>Creator applications: <Link className="text-primary" to="/onboarding/creator">apply here</Link>.</p>
  </Shell>;
}

export function ShippingPage() {
  return <Shell title="Shipping" description="Same-day Nairobi delivery. 24-72h to all 47 Kenyan counties. Pan-African and worldwide shipping available.">
    <ul className="list-disc pl-6 space-y-2">
      <li><strong>Nairobi same-day</strong> — orders confirmed before 12:00 EAT.</li>
      <li><strong>Kenya counties</strong> — 24-72h via G4S / Sendy.</li>
      <li><strong>East Africa</strong> — 3-7 days.</li>
      <li><strong>Pan-African / worldwide</strong> — 7-14 days via DHL.</li>
    </ul>
    <p>Track any order from <Link className="text-primary" to="/track-order">/track-order</Link>.</p>
  </Shell>;
}

export function ReturnsPage() {
  return <Shell title="Returns" description="14-day return window on unworn items with original tags. Free returns within Nairobi.">
    <p>Returns are accepted within 14 days of delivery for unworn items with original tags. Drops marked "Final Sale" cannot be returned.</p>
    <p>Initiate a return from your account, or WhatsApp +254 769 254 086.</p>
  </Shell>;
}

export function PrivacyPage() {
  return <Shell title="Privacy" description="How 91Fitz handles your data, cookies, and analytics.">
    <p>We collect the minimum needed to deliver orders and improve the storefront: your email, shipping address, order history, and anonymous attribution data.</p>
    <p>We never sell data. We share only with payment (Pesapal) and shipping providers as required to deliver your order.</p>
  </Shell>;
}

export function TermsPage() {
  return <Shell title="Terms" description="Terms of service for 91Fitz storefront, creators, and customers.">
    <p>By using 91Fitz you agree to fair-use of the platform, accurate billing, and our refund/return policy.</p>
    <p>Creators agree to the 90/10 commercial split and content originality requirements.</p>
  </Shell>;
}

export function FaqPage() {
  return <Shell title="FAQ" description="Common questions about drops, sizing, payment, returns, and the 91Fitz creator program.">
    <h3 className="font-display font-bold text-foreground">When do drops go live?</h3>
    <p>Drops launch on the date and time posted on the drop page. Most launch 18:00 EAT Friday.</p>
    <h3 className="font-display font-bold text-foreground">What's the creator split?</h3>
    <p>90% to the creator, 10% to platform. Settlement is nightly to your wallet.</p>
    <h3 className="font-display font-bold text-foreground">Do you ship internationally?</h3>
    <p>Yes. DHL Worldwide is available at checkout.</p>
  </Shell>;
}

export function SizingPage() {
  return <Shell title="Sizing" description="91Fitz sizing guide for tees, hoodies, and outerwear.">
    <p>Most pieces run true to size with a relaxed fit. For oversized cuts, size down. WhatsApp us if unsure — we'll match a measurement.</p>
  </Shell>;
}

export function TrackOrderPage() {
  return <Shell title="Track Order" description="Track your 91Fitz order by reference number.">
    <p>Sign in and visit <Link className="text-primary" to="/account/orders">your orders</Link>, or message WhatsApp with your order reference for live updates.</p>
  </Shell>;
}
