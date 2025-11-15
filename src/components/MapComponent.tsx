import { useEffect, useRef } from 'react';
import { Zap, MapPin } from 'lucide-react';

// OpenStreetMap Leaflet integration
declare global {
  interface Window {
    L: any;
  }
}

interface MapComponentProps {
  userLat: number;
  userLng: number;
  stationLat: number;
  stationLng: number;
  stationName: string;
  distance: string;
}

export function MapComponent({ 
  userLat, 
  userLng, 
  stationLat, 
  stationLng, 
  stationName, 
  distance 
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    // Load Leaflet CSS and JS dynamically
    const loadLeaflet = async () => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        document.head.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Initialize map once Leaflet is loaded
      if (window.L && mapRef.current && !mapInstanceRef.current) {
        // Calculate center point between user and station
        const centerLat = (userLat + stationLat) / 2;
        const centerLng = (userLng + stationLng) / 2;

        const map = window.L.map(mapRef.current, {
          center: [centerLat, centerLng],
          zoom: 14,
          zoomControl: false,
          attributionControl: false,
        });

        // Add dark mode tiles from CartoDB
        window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
        }).addTo(map);

        // Custom user icon (blue)
        const userIcon = window.L.divIcon({
          className: 'custom-user-marker',
          html: `
            <div style="position: relative;">
              <div style="position: absolute; width: 24px; height: 24px; background: #3b82f6; border-radius: 50%; opacity: 0.2; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="width: 12px; height: 12px; background: #3b82f6; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>
            </div>
          `,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        // Custom charging station icon (neon green)
        const stationIcon = window.L.divIcon({
          className: 'custom-station-marker',
          html: `
            <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
              <div style="position: absolute; width: 48px; height: 48px; background: #00FFA7; border-radius: 50%; opacity: 0.2; animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
              <div style="position: absolute; width: 32px; height: 32px; background: #00FFA7; border-radius: 50%; opacity: 0.3; filter: blur(8px);"></div>
              <div style="position: relative; z-index: 10; width: 32px; height: 32px; background: linear-gradient(to bottom right, #00FFA7, #22c55e); border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 12px rgba(0,255,167,0.4); display: flex; align-items: center; justify-content: center;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e293b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <div style="margin-top: 4px; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(8px); padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(0, 255, 167, 0.5); white-space: nowrap;">
                <span style="color: #00FFA7; font-size: 10px; font-family: system-ui, -apple-system, sans-serif;">${stationName}</span>
              </div>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        // Add markers
        window.L.marker([userLat, userLng], { icon: userIcon }).addTo(map);
        window.L.marker([stationLat, stationLng], { icon: stationIcon }).addTo(map);

        // Draw line between user and station
        const line = window.L.polyline(
          [[userLat, userLng], [stationLat, stationLng]], 
          {
            color: '#3b82f6',
            weight: 2,
            opacity: 0.5,
            dashArray: '4, 4',
          }
        ).addTo(map);

        // Fit bounds to show both markers
        const bounds = window.L.latLngBounds(
          [userLat, userLng],
          [stationLat, stationLng]
        );
        map.fitBounds(bounds, { padding: [40, 40] });

        mapInstanceRef.current = map;
      }
    };

    loadLeaflet();

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLat, userLng, stationLat, stationLng, stationName]);

  return (
    <div className="relative w-full h-40 bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Distance indicator overlay */}
      <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded px-2 py-1 flex items-center gap-1 z-[1000]">
        <MapPin className="w-3 h-3 text-cyan-400" />
        <span className="text-cyan-400 text-xs">{distance}</span>
      </div>

      {/* Map Legend overlay */}
      <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-sm border border-slate-700 rounded px-2 py-1 flex items-center gap-2 z-[1000]">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-slate-300 text-xs">You</span>
        </div>
        <div className="w-px h-3 bg-slate-600"></div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-[#00FFA7] rounded-full"></div>
          <span className="text-slate-300 text-xs">Charger</span>
        </div>
      </div>

      {/* Add custom animations as inline styles */}
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.1;
          }
        }
        .leaflet-container {
          background: #0f172a !important;
        }
        .leaflet-tile {
          filter: brightness(0.9) contrast(1.1);
        }
      `}</style>
    </div>
  );
}
