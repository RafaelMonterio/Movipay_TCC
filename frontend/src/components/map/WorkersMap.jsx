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

  // Keep the latest onSelectWorker in a ref instead of a effect dependency.
  // Callers pass an inline arrow function (a new reference on every render),
  // which — if used as a dependency — made this effect (and therefore the
  // whole Leaflet map) tear down and re-initialize on every parent
  // re-render, causing flicker and, under React 18 Strict Mode's
  // mount→unmount→remount dev cycle, the classic Leaflet
  // "Map container is already initialized" error.
  const onSelectWorkerRef = useRef(onSelectWorker);
  useEffect(() => { onSelectWorkerRef.current = onSelectWorker; }, [onSelectWorker]);

  // Same problem with `center`: callers usually pass an inline array
  // literal (e.g. center={[-23.7058, -46.3685]}), which is a new reference
  // every render even when the actual coordinates don't change. Depending
  // on a stable, primitive key instead avoids needless re-initialization.
  const centerKey = center.join(',');
  const workersKey = workers
    .map(w => `${w.id}:${w.lat ?? ''}:${w.lng ?? ''}:${w.email ?? ''}:${w.is_available}`)
    .join('|');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Guards against the async import('leaflet') resolving after this
    // effect has already been cleaned up (component unmounted, or this
    // effect superseded by a newer run) — without this, a map instance
    // could be created on a DOM node that's already gone or already has
    // one, throwing "Map container is already initialized".
    let isActive = true;

    // Importa Leaflet dinamicamente (evita SSR errors)
    import('leaflet').then(L => {
      // Corrige os ícones do Leaflet no Next.js
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (!isActive || !mapRef.current) return;

      // Evita duplicar o mapa se já foi inicializado
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }

      // Defensive cleanup: if a previous Leaflet instance on this same DOM
      // node was never properly torn down (e.g. a fast unmount/remount),
      // Leaflet leaves its internal `_leaflet_id` marker on the element and
      // refuses to initialize a new map on it, throwing "Map container is
      // already initialized". Clearing it here makes re-initialization safe.
      if (mapRef.current._leaflet_id) {
        delete mapRef.current._leaflet_id;
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

        const marker = L.marker([lat, lng], { icon: workerIcon, workerData: w }).addTo(map);
        const photo = w.photo || w.avatar_url || '/img/cabeleireiro.jpg';
        const profilePath = w.profileId ? `/client/workers/${w.profileId}` : '#';
        const preview = `
          <div style="width:210px; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#111827;">
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
              <img src="${photo}" alt="${w.name}" style="width:42px; height:42px; border-radius:50%; object-fit:cover; border:2px solid #FF7A00;" />
              <div>
                <a href="${profilePath}" style="display:block; font-weight:800; font-size:14px; line-height:1.2; color:#111827; text-decoration:none;">${w.name}</a>
                <div style="font-size:11px; color:#475569; margin-top:2px;">${w.role || w.specialty || w.service || 'Profissional'}</div>
              </div>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; font-size:11px; color:#475569; margin-top:4px;">
              <span>📍 ${w.neighborhood || w.city || 'Ribeirão Pires'}</span>
              <span>${w.distance_km ? `${w.distance_km} km` : 'Próximo'}</span>
            </div>
            <a href="${profilePath}" style="display:block; margin-top:10px; background:#FF7A00; color:#fff; text-align:center; border-radius:10px; padding:8px 10px; font-size:11px; font-weight:700; text-decoration:none;">Ver perfil completo</a>
          </div>
        `;

        marker.bindPopup(preview, {
          closeButton: true,
          offset: [0, -12],
          className: 'leaflet-popup-custom',
          autoPan: true,
        });

        marker.on('click', () => {
          onSelectWorkerRef.current?.(w);
          marker.openPopup();
        });

        if (selectedWorkerId && String(w.id) === String(selectedWorkerId)) {
          marker.openPopup();
        }
      });

      // Preserve current zoom/center when map props update
      const savedView = map.getCenter ? { center: map.getCenter(), zoom: map.getZoom() } : null;
      // Apply saved view after markers rendered
      if (savedView) map.setView(savedView.center, savedView.zoom);

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
      isActive = false;
      if (instanceRef.current) {
        instanceRef.current.remove();
        instanceRef.current = null;
      }
    };
    // Depend on stable, primitive keys (centerKey/workersKey) instead of the
    // `center` array or `workers` array references, which are almost always
    // new on every parent render and previously caused the map to be torn
    // down and rebuilt constantly. `onSelectWorker` is read from a ref, not
    // a dependency, for the same reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workersKey, centerKey]);

  useEffect(() => {
    if (!instanceRef.current || !selectedWorkerId) return;

    const map = instanceRef.current;
    let selectedMarker = null;

    map.eachLayer(layer => {
      if (!(layer instanceof window.L.Marker)) return;

      const workerData = layer.options?.workerData;
      if (workerData && String(workerData.id) === String(selectedWorkerId)) {
        selectedMarker = layer;
      }
    });

    if (selectedMarker) {
      selectedMarker.openPopup();
    }
  }, [selectedWorkerId]);

  return (
    <div
      ref={mapRef}
      className="w-full rounded-2xl overflow-hidden"
      style={{ height, width: '100%' }}
    />
  );
}
