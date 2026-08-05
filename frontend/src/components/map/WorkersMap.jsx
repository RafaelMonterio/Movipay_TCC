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
        zoomControl: false,
        attributionControl: false,
      });
      instanceRef.current = map;
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Mapa mais clean
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap &copy; CARTO',
      }).addTo(map);

      // Pin da localização atual (centro)
      const userIcon = L.divIcon({
        html: `<div style="
          width:18px;height:18px;border-radius:50%;
          background:#2563eb;border:3px solid white;
          box-shadow:0 2px 10px rgba(37,99,235,0.35)
        "></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        className: '',
      });
      L.marker(center, { icon: userIcon })
        .addTo(map)
        .bindPopup('<b>Você está aqui</b>');

      // Pins dos trabalhadores
      workers.forEach(w => {
        if (!w.lat || !w.lng) return;

        const color = w.is_available ? '#16a34a' : '#94a3b8';
        const workerIcon = L.divIcon({
          html: `<div style="
            width:22px;height:22px;border-radius:50%;
            background:${color};border:2px solid white;
            box-shadow:0 2px 12px rgba(15,23,42,0.12);
          "></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
          className: '',
        });

        L.marker([w.lat, w.lng], { icon: workerIcon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width:150px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height:1.4; color:#0f172a">
              <div style="font-weight:700;font-size:14px; margin-bottom:4px">${w.name}</div>
              <div style="font-size:12px; color:#475569; margin-bottom:4px">${w.neighborhood || w.city || 'Ribeirão Pires'}</div>
              ${w.distance_km ? `<div style="font-size:12px; color:#475569;">${w.distance_km} km</div>` : ''}
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
