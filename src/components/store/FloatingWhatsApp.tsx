import { MessageCircle } from "lucide-react";

const WA_NUMBER = "254769254086";

export function FloatingWhatsApp() {
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("Hi 91 Fitz! I'd like help with an order.")}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with 91 Fitz on WhatsApp (0769 254 086)"
      className="fixed right-4 bottom-20 md:bottom-6 z-40 flex items-center gap-2 rounded-full bg-primary text-primary-foreground shadow-gold px-4 h-12 font-display font-bold uppercase tracking-wider text-xs hover:bg-gold-dark transition-colors"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">WhatsApp 0769 254 086</span>
    </a>
  );
}
