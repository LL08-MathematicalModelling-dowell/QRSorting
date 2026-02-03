// import { useEffect, useState } from 'react';
// import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
// import { LatLngExpression, divIcon } from 'leaflet';
// import { motion } from 'framer-motion';
// import { Navigation, Store, Home, Package } from 'lucide-react';
// import { ScanDetail, OrderStatus } from '@/types/order';
// import { renderToStaticMarkup } from 'react-dom/server';

// interface TrackingMapProps {
//   scanHistory: ScanDetail[];
//   className?: string;
// }

// const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
//   pending: { label: 'Pending', color: 'hsl(220, 13%, 69%)' },
//   preparing: { label: 'Preparing', color: 'hsl(45, 93%, 47%)' },
//   ready: { label: 'Ready', color: 'hsl(280, 85%, 65%)' },
//   picked_up: { label: 'Picked Up', color: 'hsl(262, 83%, 58%)' },
//   in_transit: { label: 'In Transit', color: 'hsl(25, 95%, 53%)' },
//   delivered: { label: 'Delivered', color: 'hsl(142, 71%, 45%)' },
// };

// // Custom marker icons using Lucide
// const createCustomIcon = (IconComponent: React.ElementType, color: string, size: number = 40) => {
//   const iconHtml = renderToStaticMarkup(
//     <div
//       style={{
//         backgroundColor: color,
//         width: `${size}px`,
//         height: `${size}px`,
//         borderRadius: '50%',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
//         border: '3px solid white',
//       }}
//     >
//       <IconComponent style={{ width: `${size / 2}px`, height: `${size / 2}px`, color: 'white' }} />
//     </div>
//   );

//   return divIcon({
//     html: iconHtml,
//     className: 'custom-marker',
//     iconSize: [size, size],
//     iconAnchor: [size / 2, size / 2],
//   });
// };

// // Map view controller to fit bounds and fix tile loading
// const MapController = ({ 
//   positions 
// }: { 
//   positions: LatLngExpression[];
// }) => {
//   const map = useMap();

//   // useEffect(() => {
//   //   const resize = () => map.invalidateSize();
//   //   window.addEventListener("resize", resize);
//   //   resize(); // run once immediately

//   //   return () => window.removeEventListener("resize", resize);
//   // }, [map]);

//   // useEffect(() => {
//   //   // Fix for partial tile loading - invalidate size after render
//   //   const timer = setTimeout(() => {
//   //     map.invalidateSize();
//   //   }, 100);

//   //   return () => clearTimeout(timer);
//   // }, [map]);

//   useEffect(() => {
//     const container = map.getContainer();

//     const observer = new ResizeObserver(() => {
//       map.invalidateSize();
//     });

//     observer.observe(container);

//     map.invalidateSize();

//     return () => observer.disconnect();
//   }, [map]);

//   useEffect(() => {
//     if (positions.length > 0) {
//       const bounds = positions.map(pos => pos as [number, number]);
//       map.fitBounds(bounds, { padding: [50, 50] });
//     }
//   }, [map, positions]);

//   return null;
// };

// const formatDate = (dateString: string): string => {
//   const date = new Date(dateString);
//   return date.toLocaleString('en-US', {
//     month: 'short',
//     day: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//   });
// };

// export const TrackingMap = ({
//   scanHistory,
//   className = '',
// }: TrackingMapProps) => {
//   const [positions, setPositions] = useState<LatLngExpression[]>([]);

//   useEffect(() => {
//     if (scanHistory.length > 0) {
//       const allPositions: LatLngExpression[] = scanHistory.map(scan => [
//         scan.location.latitude,
//         scan.location.longitude,
//       ]);
//       setPositions(allPositions);
//     }
//   }, [scanHistory]);

//   if (scanHistory.length === 0) {
//     return (
//       <div className={`relative overflow-hidden rounded-xl shadow-soft-lg bg-muted flex items-center justify-center ${className}`}>
//         <div className="text-center p-8">
//           <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
//           <p className="text-muted-foreground">No tracking data available yet</p>
//         </div>
//       </div>
//     );
//   }

//   // Create route path from scan history
//   const routePath: LatLngExpression[] = scanHistory.map(scan => [
//     scan.location.latitude,
//     scan.location.longitude,
//   ]);

//   // Get the latest scan for centering the map
//   const latestScan = scanHistory[scanHistory.length - 1];
//   const center: LatLngExpression = [latestScan.location.latitude, latestScan.location.longitude];

//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       onAnimationComplete={() => {
//         window.dispatchEvent(new Event("resize"));
//       }}
//       className={`relative overflow-hidden rounded-xl shadow-soft-lg ${className}`}
//     >
      
//     <MapContainer
//       center={center}
//       zoom={14}
//       scrollWheelZoom
//       // className="w-full h-full min-h-[350px]"
//       style={{ height: "500px", width: "100%", background: 'hsl(var(--muted))' }}
//     >
    
//       <TileLayer
//         attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//         url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//       />
      
//       <MapController positions={positions} />

//       {/* Render markers for each scan point */}
//       {scanHistory.map((scan, index) => {
//         const isFirst = index === 0;
//         const isLast = index === scanHistory.length - 1;
//         const config = statusConfig[scan.status] || statusConfig.pending;
        
//         // Different icons for first, last, and intermediate points
//         let icon;
//         if (isFirst) {
//           icon = createCustomIcon(Store, 'hsl(262, 83%, 58%)', 40);
//         } else if (isLast) {
//           icon = createCustomIcon(Navigation, config.color, 44);
//         } else {
//           icon = createCustomIcon(Package, config.color, 32);
//         }

//         return (
//           <Marker
//             key={scan._id}
//             position={[scan.location.latitude, scan.location.longitude]}
//             icon={icon}
//           >
//             <Popup>
//               <div className="min-w-[180px]">
//                 <div className="font-semibold text-sm mb-1">
//                   {isFirst ? '📍 First Update' : isLast ? '🚗 Latest Location' : '📦 Update Point'}
//                 </div>
//                 <div 
//                   className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white mb-2"
//                   style={{ backgroundColor: config.color }}
//                 >
//                   {config.label}
//                 </div>
//                 <div className="text-xs text-muted-foreground">
//                   <div className="mb-1">
//                     <strong>Time:</strong> {formatDate(scan.scannedAt)}
//                   </div>
//                   <div className="font-mono text-[10px]">
//                     {scan.location.latitude.toFixed(6)}, {scan.location.longitude.toFixed(6)}
//                   </div>
//                 </div>
//               </div>
//             </Popup>
//           </Marker>
//         );
//       })}

//       {/* Route line connecting all scan points */}
//       {routePath.length > 1 && (
//         <Polyline
//           positions={routePath}
//           pathOptions={{
//             color: 'hsl(25, 95%, 53%)',
//             weight: 4,
//             opacity: 0.7,
//             dashArray: '10, 10',
//           }}
//         />
//       )}
//     </MapContainer>
    

//       {/* Map Legend */}
//       <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-soft text-xs space-y-1.5">
//         <div className="font-semibold mb-2">Status Legend</div>
//         {Object.entries(statusConfig).map(([status, config]) => (
//           <div key={status} className="flex items-center gap-2">
//             <div 
//               className="w-3 h-3 rounded-full" 
//               style={{ backgroundColor: config.color }}
//             />
//             <span>{config.label}</span>
//           </div>
//         ))}
//       </div>
//     </motion.div>
//   );
// };

// export default TrackingMap;

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { LatLngExpression, divIcon } from 'leaflet';
import { motion } from 'framer-motion';
import { Navigation, Store, Home, Package } from 'lucide-react';
import { ScanDetail, OrderStatus } from '@/types/order';
import { renderToStaticMarkup } from 'react-dom/server';

interface TrackingMapProps {
  scanHistory: ScanDetail[];
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'hsl(220, 13%, 69%)' },
  preparing: { label: 'Preparing', color: 'hsl(45, 93%, 47%)' },
  ready: { label: 'Ready', color: 'hsl(280, 85%, 65%)' },
  picked_up: { label: 'Picked Up', color: 'hsl(262, 83%, 58%)' },
  in_transit: { label: 'In Transit', color: 'hsl(25, 95%, 53%)' },
  delivered: { label: 'Delivered', color: 'hsl(142, 71%, 45%)' },
};

// Custom marker icons using Lucide
const createCustomIcon = (IconComponent: React.ElementType, color: string, size: number = 40) => {
  const iconHtml = renderToStaticMarkup(
    <div
      style={{
        backgroundColor: color,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        border: '3px solid white',
      }}
    >
      <IconComponent style={{ width: `${size / 2}px`, height: `${size / 2}px`, color: 'white' }} />
    </div>
  );

  return divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

// Map view controller to fit bounds and fix tile loading
const MapController = ({ 
  positions 
}: { 
  positions: LatLngExpression[];
}) => {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });

    observer.observe(container);

    map.invalidateSize();

    return () => observer.disconnect();
  }, [map]);

  useEffect(() => {
    if (positions.length > 0) {
      const bounds = positions.map(pos => pos as [number, number]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, positions]);

  return null;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const TrackingMap = ({
  scanHistory,
  className = '',
}: TrackingMapProps) => {
  const [positions, setPositions] = useState<LatLngExpression[]>([]);

  useEffect(() => {
    if (scanHistory.length > 0) {
      const allPositions: LatLngExpression[] = scanHistory.map(scan => [
        scan.location.latitude,
        scan.location.longitude,
      ]);
      setPositions(allPositions);
    }
  }, [scanHistory]);

  if (scanHistory.length === 0) {
    return (
      <div className={`relative overflow-hidden rounded-xl shadow-soft-lg bg-muted flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No tracking data available yet</p>
        </div>
      </div>
    );
  }

  // Create route path from scan history
  const routePath: LatLngExpression[] = scanHistory.map(scan => [
    scan.location.latitude,
    scan.location.longitude,
  ]);

  // Get the latest scan for centering the map
  const latestScan = scanHistory[scanHistory.length - 1];
  const center: LatLngExpression = [latestScan.location.latitude, latestScan.location.longitude];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative overflow-hidden rounded-xl shadow-soft-lg ${className}`}
    >
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom
        style={{ height: "500px", width: "100%", background: 'hsl(var(--muted))' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController positions={positions} />
        {scanHistory.map((scan, index) => {
          const isFirst = index === 0;
          const isLast = index === scanHistory.length - 1;
          const config = statusConfig[scan.status] || statusConfig.pending;
          
          let icon;
          if (isFirst) {
            icon = createCustomIcon(Store, 'hsl(262, 83%, 58%)', 40);
          } else if (isLast) {
            icon = createCustomIcon(Navigation, config.color, 44);
          } else {
            icon = createCustomIcon(Package, config.color, 32);
          }

          return (
            <Marker
              key={scan._id}
              position={[scan.location.latitude, scan.location.longitude]}
              icon={icon}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <div className="font-semibold text-sm mb-1">
                    {isFirst ? '📍 First Update' : isLast ? '🚗 Latest Location' : '📦 Update Point'}
                  </div>
                  <div 
                    className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white mb-2"
                    style={{ backgroundColor: config.color }}
                  >
                    {config.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <div className="mb-1">
                      <strong>Time:</strong> {formatDate(scan.scannedAt)}
                    </div>
                    <div className="font-mono text-[10px]">
                      {scan.location.latitude.toFixed(6)}, {scan.location.longitude.toFixed(6)}
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        {routePath.length > 1 && (
          <Polyline
            positions={routePath}
            pathOptions={{
              color: 'hsl(25, 95%, 53%)',
              weight: 4,
              opacity: 0.7,
              dashArray: '10, 10',
            }}
          />
        )}
      </MapContainer>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-soft text-xs space-y-1.5">
        <div className="font-semibold mb-2">Status Legend</div>
        {Object.entries(statusConfig).map(([status, config]) => (
          <div key={status} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: config.color }}
            />
            <span>{config.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TrackingMap;