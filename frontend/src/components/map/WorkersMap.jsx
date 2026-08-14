'use client';
import { useEffect, useRef } from 'react';

const FALLBACK_COORDS = {
  'carlos@teste.com': [-23.7061, -46.3685],
  'maria@teste.com': [-23.7042, -46.3698],
  'joao@teste.com': [-23.7075, -46.3653],
  'anati@teste.com': [-23.7052, -46.3690],
};

function resolveWorkerPosition(worker) {
  if (worker?.email && FALLBACK_COORDS[worker.email]) {
    return FALLBACK_COORDS[worker.email];
  }

  if (Number.isFinite(worker?.lat) && Number.isFinite(worker?.lng)) {
    return [Number(worker.lat), Number(worker.lng)];
  }

  return null;
}

// Leaflet só funciona no browser (sem SSR)
export default function WorkersMap({ workers = [], center = [-23.7060, -46.3690], onSelectWorker, height = 280 }) {
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
        const position = resolveWorkerPosition(w);
        if (!position) return;

        const [lat, lng] = position;
        const emoji = w.is_available ? '🧰' : '🛠️';
        const workerIcon = L.divIcon({
          html: `<div style="
            width:34px;height:34px;border-radius:50%;
            background:#fff;border:2px solid #2563eb;
            box-shadow:0 4px 12px rgba(15,23,42,0.18);
            display:flex;align-items:center;justify-content:center;
            font-size:18px;
          ">${emoji}</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
          className: '',
        });

        const marker = L.marker([lat, lng], { icon: workerIcon }).addTo(map);
        const preview = `
          <div style="min-width:170px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height:1.4; color:#0f172a">
            <div style="font-weight:700;font-size:14px; margin-bottom:4px">${w.name}</div>
            <div style="font-size:12px; color:#475569; margin-bottom:4px">${w.neighborhood || w.city || 'Ribeirão Pires'}</div>
            ${w.distance_km ? `<div style="font-size:12px; color:#475569; margin-bottom:6px">${w.distance_km} km</div>` : ''}
            <div style="font-size:11px; color:#2563eb; font-weight:600">Clique para ver o perfil</div>
          </div>
        `;

        marker.bindTooltip(preview, {
          sticky: true,
          direction: 'top',
          offset: [0, -8],
          className: 'leaflet-tooltip-custom'
        });
        marker.on('mouseover', () => marker.openTooltip());
        marker.on('mouseout', () => marker.closeTooltip());
        marker.on('click', () => onSelectWorker?.(w));
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
  }, [workers, center, onSelectWorker]);

  return (
    <div
      ref={mapRef}
      className="w-full rounded-2xl overflow-hidden"
      style={{ height, width: '100%' }}
    />
  );
}
