'use client';
import { useEffect, useRef } from 'react';

// Leaflet só funciona no browser (sem SSR)
export default function WorkersMap({ workers = [], center = [-23.5505, -46.6333] }) {
  const mapRef     = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Importa Leaflet dinamicamente (evita SSR errors)
    import('leaflet').then(L => {
      // Corrige os ícones do Leaflet no Next.js
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (!mapRef.current) return;

      // Evita duplicar o mapa se já foi inicializado
      if (instanceRef.current) {
        instanceRef.current.remove();
      }

      const map = L.map(mapRef.current, {
        center,
        zoom: 14,
        zoomControl: true,
        attributionControl: false,
      });
      instanceRef.current = map;

      // Tiles OpenStreetMap gratuito
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Pin da localização atual (centro)
      const userIcon = L.divIcon({
        html: `<div style="
          width:16px;height:16px;border-radius:50%;
          background:#6366f1;border:3px solid white;
          box-shadow:0 2px 8px rgba(99,102,241,0.5)
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        className: '',
      });
      L.marker(center, { icon: userIcon })
        .addTo(map)
        .bindPopup('<b>Você está aqui</b>');

      // Pins dos trabalhadores
      workers.forEach(w => {
        if (!w.lat || !w.lng) return;

        const color = w.is_available ? '#22c55e' : '#94a3b8';
        const workerIcon = L.divIcon({
          html: `<div style="
            background:white;border:2px solid ${color};
            border-radius:50%;width:36px;height:36px;
            display:flex;align-items:center;justify-content:center;
            font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.15);
            cursor:pointer;
          ">
            ${w.is_available ? '🟢' : '⚫'}
          </div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          className: '',
        });

        const stars = w.avg_rating
          ? '★'.repeat(Math.round(w.avg_rating)) + '☆'.repeat(5 - Math.round(w.avg_rating))
          : 'Novo';

        L.marker([w.lat, w.lng], { icon: workerIcon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width:160px;font-family:sans-serif">
              <div style="font-weight:700;font-size:14px;margin-bottom:4px">${w.name}</div>
              <div style="font-size:12px;color:#64748b;margin-bottom:4px">${w.neighborhood || w.city || ''}</div>
              <div style="font-size:12px;color:#f59e0b">${stars}</div>
              ${w.distance_km ? `<div style="font-size:11px;color:#94a3b8;margin-top:4px">📍 ${w.distance_km} km</div>` : ''}
              <div style="margin-top:8px">
                <span style="
                  display:inline-block;font-size:11px;font-weight:600;
                  padding:2px 8px;border-radius:4px;
                  background:${w.is_available ? '#dcfce7' : '#f1f5f9'};
                  color:${w.is_available ? '#16a34a' : '#94a3b8'}
                ">${w.is_available ? '● Disponível' : '○ Indisponível'}</span>
              </div>
            </div>
          `);
      });

      // Leaflet CSS
      if (!document.querySelector('#leaflet-css')) {
        const link = document.createElement('link');
        link.id   = 'leaflet-css';
        link.rel  = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
        document.head.appendChild(link);
      }
    });

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
  }, [workers, center]);

  return (
    <div
      ref={mapRef}
      className="w-full rounded-2xl overflow-hidden"
      style={{ height: 280 }}
    />
  );
}
