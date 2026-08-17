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
export default function WorkersMap({ workers = [], center = [-23.7060, -46.3690], onSelectWorker, height = 280, selectedWorkerId = null }) {
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
        const emoji = w.emoji || (w.is_available ? '🧰' : '🛠️');
        const workerIcon = L.divIcon({
          html: `<div style="
            width:38px;height:38px;border-radius:50%;
            background:#fff;border:3px solid #FF7A00;
            box-shadow:0 8px 18px rgba(255,122,0,0.25);
            display:flex;align-items:center;justify-content:center;
            font-size:20px;
          ">${emoji}</div>`,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
          className: '',
        });

        const marker = L.marker([lat, lng], { icon: workerIcon }).addTo(map);
        const photo = w.photo || w.avatar_url || '/img/cabeleireiro.jpg';
        const preview = `
          <div style="width:210px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#111827;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
              <img src="${photo}" alt="${w.name}" style="width:42px; height:42px; border-radius:50%; object-fit:cover; border:2px solid #FF7A00;" />
              <div>
                <div style="font-weight:800; font-size:14px; line-height:1.2;">${w.name}</div>
                <div style="font-size:11px; color:#475569; margin-top:2px;">${w.role || w.specialty || w.service || 'Profissional'}</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; font-size:11px; color:#475569; margin-top:4px;">
              <span>📍 ${w.neighborhood || w.city || 'Ribeirão Pires'}</span>
              <span>${w.distance_km ? `${w.distance_km} km` : 'Próximo'}</span>
            </div>
          </div>
        `;

        marker.bindPopup(preview, {
          closeButton: true,
          offset: [0, -12],
          className: 'leaflet-popup-custom',
          autoPan: true,
        });

        marker.on('click', () => {
          onSelectWorker?.(w);
          marker.openPopup();
        });

        if (selectedWorkerId && String(w.id) === String(selectedWorkerId)) {
          marker.openPopup();
        }
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
  }, [workers, center, onSelectWorker, selectedWorkerId]);

  return (
    <div
      ref={mapRef}
      className="w-full rounded-2xl overflow-hidden"
      style={{ height, width: '100%' }}
    />
  );
}
