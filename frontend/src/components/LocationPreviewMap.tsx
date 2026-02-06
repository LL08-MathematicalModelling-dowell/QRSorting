import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { LatLngExpression, divIcon } from 'leaflet';
import { motion } from 'framer-motion';
import { Navigation } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

interface LocationPreviewMapProps {
  coordinates: { lat: number; lng: number };
  className?: string;
}

// Custom marker icon
const createLocationIcon = () => {
  const iconHtml = renderToStaticMarkup(
    <div
      style={{
        backgroundColor: 'hsl(25, 95%, 53%)',
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        border: '3px solid white',
      }}
    >
      <Navigation style={{ width: '22px', height: '22px', color: 'white' }} />
    </div>
  );

  return divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
};

// Map controller to handle resize and centering
const MapController = ({ center }: { center: LatLngExpression }) => {
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
    map.setView(center, 16);
  }, [map, center]);

  return null;
};

export const LocationPreviewMap = ({
  coordinates,
  className = '',
}: LocationPreviewMapProps) => {
  const center: LatLngExpression = [coordinates.lat, coordinates.lng];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-xl shadow-soft-lg ${className}`}
    >
      <MapContainer
        center={center}
        zoom={16}
        scrollWheelZoom
        style={{ height: '250px', width: '100%', background: 'hsl(var(--muted))' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController center={center} />

        <Marker position={center} icon={createLocationIcon()}>
          <Popup>
            <div className="min-w-[160px] text-center">
              <div className="font-semibold text-sm mb-2">📍 Your Current Location</div>
              <div className="font-mono text-xs bg-muted px-2 py-1 rounded">
                {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </motion.div>
  );
};

export default LocationPreviewMap;