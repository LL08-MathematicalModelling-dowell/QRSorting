import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Copy, Check, Download } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface QRCodeDisplayProps {
  orderId: string;
  size?: number;
}

export const QRCodeDisplay = ({ orderId, size = 200 }: QRCodeDisplayProps) => {
  const [copied, setCopied] = useState(false);
  const trackingUrl = `${window.location.origin}/order/${orderId}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(trackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = size + 40;
      canvas.height = size + 40;
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        
        const link = document.createElement('a');
        link.download = `qr-${orderId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-2xl p-6 text-center"
    >
      <h3 className="font-semibold mb-4">Order QR Code</h3>
      
      <div className="inline-flex p-4 bg-card rounded-xl shadow-soft mb-4">
        <QRCodeSVG
          id="qr-code-svg"
          value={trackingUrl}
          size={size}
          level="H"
          includeMargin={false}
          bgColor="transparent"
          fgColor="hsl(222, 47%, 11%)"
        />
      </div>

      <p className="text-sm text-muted-foreground mb-4 font-mono bg-muted rounded-lg px-3 py-2 break-all">
        {trackingUrl}
      </p>

      <div className="flex gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-2"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>
    </motion.div>
  );
};

export default QRCodeDisplay;
