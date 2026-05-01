import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import qrLogo from "@/assets/qr-logo.png";

interface Props {
  value: string;
  size?: number;
  withLogo?: boolean;
  className?: string;
}

/**
 * Branded 91 Fitz QR code: gold on black with the 91 FITZ logo center-stamped.
 */
export default function BrandedQRCode({ value, size = 320, withLogo = true, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    QRCode.toCanvas(canvas, value, {
      width: size,
      margin: 2,
      errorCorrectionLevel: "H",
      color: { dark: "#FFD700", light: "#000000" },
    }).then(() => {
      if (!withLogo) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const logoSize = size * 0.22;
        const x = (size - logoSize) / 2;
        const y = (size - logoSize) / 2;
        // black plate behind logo so QR stays scannable
        ctx.fillStyle = "#000000";
        ctx.fillRect(x - 6, y - 6, logoSize + 12, logoSize + 12);
        ctx.drawImage(img, x, y, logoSize, logoSize);
      };
      img.src = qrLogo;
    });
  }, [value, size, withLogo]);

  const download = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `91fitz-qr-${value.split("/").pop() || "code"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className={className}>
      <canvas ref={canvasRef} className="rounded-lg shadow-gold" />
      <button
        onClick={download}
        className="mt-3 w-full px-4 py-2 bg-primary text-primary-foreground font-display font-bold uppercase tracking-wider text-xs rounded hover:bg-gold-dark transition-colors"
      >
        Download PNG
      </button>
    </div>
  );
}
