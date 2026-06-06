import { useEffect, useRef } from 'react';
import mockData from '../data/mock-tramites.json';
import './MapaZona.css';

const CDMX_CENTER = [19.4326, -99.1332];
const RADIO_KM = 0.8;

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function coloniasMock() {
  return Object.entries(mockData.colonias).map(([nombre, datos]) => ({
    nombre,
    ...datos,
  }));
}

function detectarColonia(lat, lng) {
  const colonias = coloniasMock();
  let nearest = null;
  let minDist = Infinity;
  for (const c of colonias) {
    const d = haversineKm(lat, lng, c.lat, c.lng);
    if (d < minDist) {
      minDist = d;
      nearest = c;
    }
  }
  return minDist <= 3 ? nearest : null;
}

export default function MapaZona({ onZonaSeleccionada }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  useEffect(() => {
    let L;
    let mounted = true;

    import('leaflet').then((mod) => {
      if (!mounted || !mapRef.current || mapInstanceRef.current) return;
      L = mod.default;

      // Fix default icon paths for Vite
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current, { zoomControl: true }).setView(CDMX_CENTER, 12);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19,
      }).addTo(map);

      // Render colonia markers as subtle dots
      coloniasMock().forEach((c) => {
        L.circleMarker([c.lat, c.lng], {
          radius: 4,
          color: '#9d2148',
          fillColor: '#9d2148',
          fillOpacity: 0.35,
          weight: 1,
        })
          .bindTooltip(
            `<strong>${c.nombre.charAt(0).toUpperCase() + c.nombre.slice(1)}</strong><br>Uso suelo: ${c.uso_suelo}`,
            { direction: 'top' }
          )
          .addTo(map);
      });

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;

        if (markerRef.current) map.removeLayer(markerRef.current);
        if (circleRef.current) map.removeLayer(circleRef.current);

        markerRef.current = L.marker([lat, lng]).addTo(map);
        circleRef.current = L.circle([lat, lng], {
          radius: RADIO_KM * 1000,
          color: '#9d2148',
          fillColor: '#9d2148',
          fillOpacity: 0.08,
          weight: 2,
          dashArray: '6 4',
        }).addTo(map);

        const colonia = detectarColonia(lat, lng);
        onZonaSeleccionada({ lat, lng, colonia });
      });
    });

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  function handleShortcut(nombreColonia) {
    const c = mockData.colonias[nombreColonia];
    if (!c || !mapInstanceRef.current) return;

    import('leaflet').then((mod) => {
      const L = mod.default;
      const map = mapInstanceRef.current;
      map.setView([c.lat, c.lng], 14);

      if (markerRef.current) map.removeLayer(markerRef.current);
      if (circleRef.current) map.removeLayer(circleRef.current);

      markerRef.current = L.marker([c.lat, c.lng]).addTo(map);
      circleRef.current = L.circle([c.lat, c.lng], {
        radius: RADIO_KM * 1000,
        color: '#9d2148',
        fillColor: '#9d2148',
        fillOpacity: 0.08,
        weight: 2,
        dashArray: '6 4',
      }).addTo(map);

      onZonaSeleccionada({ lat: c.lat, lng: c.lng, colonia: { nombre: nombreColonia, ...c } });
    });
  }

  const shortcuts = ['condesa', 'polanco', 'roma norte', 'del valle', 'santa fe'];

  return (
    <div className="mapa-zona">
      <div className="mapa-zona__instruccion">
        Haz clic en el mapa para seleccionar tu zona. Se mostrará el área de influencia de 800 m.
      </div>
      <div ref={mapRef} className="mapa-zona__mapa" />
      <div className="mapa-zona__shortcuts">
        <span className="mapa-zona__shortcuts-label">Prueba con:</span>
        {shortcuts.map((c) => (
          <button
            key={c}
            type="button"
            className="shortcut-btn"
            onClick={() => handleShortcut(c)}
          >
            📍 {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
