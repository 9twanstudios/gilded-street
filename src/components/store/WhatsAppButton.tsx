import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WA_NUMBER = "254769254086";

interface WhatsAppButtonProps {
  message: string;
  label?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export function WhatsAppButton({
  message,
  label = "Order via WhatsApp",
  className = "",
  variant = "outline",
  size = "lg",
}: WhatsAppButtonProps) {
  const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;

  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={`border-green-600 text-green-500 hover:bg-green-600 hover:text-foreground font-display font-bold uppercase tracking-wider transition-all duration-300 ${className}`}
    >
      <a href={url} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="mr-2 h-4 w-4" />
        {label}
      </a>
    </Button>
  );
}

export function buildOrderMessage(items: { name: string; size: string; quantity: number; price: number }[], total: number) {
  const lines = items.map(
    (i) => `• ${i.name} (${i.size}) x${i.quantity} — KES ${i.price.toLocaleString()}`
  );
  return `🛒 New Order from 91Fitz\n\n${lines.join("\n")}\n\n💰 Total: KES ${total.toLocaleString()}\n\nPlease confirm my order!`;
}

export function buildProductMessage(name: string, size: string, price: number) {
  return `Hi! I'm interested in ordering:\n\n🔥 ${name}\n📏 Size: ${size}\n💰 Price: KES ${price.toLocaleString()}\n\nIs this available?`;
}
