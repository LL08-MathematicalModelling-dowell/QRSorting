import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { Copy, Check, Download } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface QRCodeCardProps {
  title: string;
  url: string;
  orderId: string;
  size?: number;
}

const QRCodeCard = ({ title, url, orderId, size = 160 }: QRCodeCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = document.getElementById(`qr-${title.toLowerCase().replace(/\s+/g, '-')}`);
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
        link.download = `${title.toLowerCase().replace(/\s+/g, '-')}-${orderId}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div className="flex flex-col items-center">
      <h4 className="font-medium text-sm mb-3">{title}</h4>
      
      <div className="inline-flex p-3 bg-card rounded-xl shadow-soft mb-3">
        <QRCodeSVG
          id={`qr-${title.toLowerCase().replace(/\s+/g, '-')}`}
          value={url}
          size={size}
          level="H"
          includeMargin={false}
          bgColor="transparent"
          fgColor="hsl(222, 47%, 11%)"
        />
      </div>

      <p className="text-xs text-muted-foreground mb-3 font-mono bg-muted rounded-lg px-2 py-1.5 break-all max-w-full">
        {url}
      </p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-1.5 text-xs h-8"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="gap-1.5 text-xs h-8"
        >
          <Download className="w-3 h-3" />
          Download
        </Button>
      </div>
    </div>
  );
};

interface QRCodeDisplayProps {
  orderId: string;
  size?: number;
  showDeliveryQR?: boolean;
}

export const QRCodeDisplay = ({ orderId, size = 160, showDeliveryQR = false }: QRCodeDisplayProps) => {
  const orderTrackingUrl = `${window.location.origin}/order/${orderId}`;
  const deliveryUrl = `${window.location.origin}/order/delivery/${orderId}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-2xl p-6 text-center"
    >
      <h3 className="font-semibold mb-6">QR Codes</h3>
      
      <div className={`grid gap-6 ${showDeliveryQR ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
        <QRCodeCard 
          title="Order Tracking" 
          url={orderTrackingUrl} 
          orderId={orderId}
          size={size}
        />
        
        {showDeliveryQR && (
          <QRCodeCard 
            title="Delivery Update" 
            url={deliveryUrl} 
            orderId={orderId}
            size={size}
          />
        )}
      </div>
    </motion.div>
  );
};

export default QRCodeDisplay;
