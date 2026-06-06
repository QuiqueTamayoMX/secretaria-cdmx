import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { geocodeDireccion, reverseGeocode } from '../../services/geocodingService.js';
import { calcularHuff } from '../../services/huffModel.js';
import mockData from '../../data/mock-tramites.json';
import './Localizacion.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const CDMX = { lat: 19.4326, lng: -99.1332 };

const userIcon = L.divIcon({
  className: '',
  html: '<div class="loc-marker-user"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function Localizacion({ onContinuar, negocioExistente }) {
  const [coords, setCoords]           = useState(negocioExistente?.coords || null);
  const [address, setAddress]         = useState(negocioExistente?.address || '');
  const [searchInput, setSearchInput] = useState('');
  const [giroId, setGiroId]           = useState(negocioExistente?.tipo || '');
  const [tipoNombre, setTipoNombre]   = useState(negocioExistente?.tipoNombre || '');
  const [catActiva, setCatActiva]     = useState(null);
  const [huffResult, setHuffResult]   = useState(null);
  const [cargandoGPS, setCargandoGPS] = useState(false);
  const [cargandoBusqueda, setCargandoBusqueda] = useState(false);
  const [error, setError]             = useState('');

  const mapRef        = useRef(null);
  const mapInst       = useRef(null);
  const markerRef     = useRef(null);
  const circlRef      = useRef(null);
  const compMarkersRef = useRef([]);

  // ── Inicializar mapa ──
  useEffect(() => {
    if (mapInst.current) return;
    const map = L.map(mapRef.current, { zoomControl: true }).setView(
      [CDMX.lat, CDMX.lng],
      13
    );
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      colocarMarcador(map, { lat, lng });
      reverseGeocode(lat, lng).then(setAddress).catch(() => {});
      setCoords({ lat, lng });
    });

    mapInst.current = map;
    return () => { map.remove(); mapInst.current = null; };
  }, []);

  // ── Actualizar marcador cuando cambian coords ──
  useEffect(() => {
    if (!coords || !mapInst.current) return;
    colocarMarcador(mapInst.current, coords);
    mapInst.current.setView([coords.lat, coords.lng], 15, { animate: true });
  }, [coords]);

  // ── Calcular métricas cuando cambian coords o giro ──
  useEffect(() => {
    if (!coords || !giroId) return;
    const huff = calcularHuff(coords, giroId);
    setHuffResult(huff);

    // Competidores en el mapa
    compMarkersRef.current.forEach((m) => m.remove());
    compMarkersRef.current = [];
    if (mapInst.current) {
      huff.competidores.forEach((c) => {
        const m = L.circleMarker([c.coords.lat, c.coords.lng], {
          radius: 7,
          color: '#c62828',
          fillColor: '#ef5350',
          fillOpacity: 0.85,
          weight: 1.5,
        })
          .addTo(mapInst.current)
          .bindTooltip(c.nombre, { permanent: false });
        compMarkersRef.current.push(m);
      });
    }
  }, [coords, giroId]);

  function colocarMarcador(map, { lat, lng }) {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon: userIcon }).addTo(map);
    }
    if (circlRef.current) {
      circlRef.current.setLatLng([lat, lng]);
    } else {
      circlRef.current = L.circle([lat, lng], {
        radius: 800,
        color: '#9d2148',
        fillColor: '#9d2148',
        fillOpacity: 0.06,
        weight: 1.5,
        dashArray: '5,5',
      }).addTo(map);
    }
  }

  function usarGPS() {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización.');
      return;
    }
    setCargandoGPS(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        try {
          const addr = await reverseGeocode(lat, lng);
          setAddress(addr);
        } catch {
          setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
        setCargandoGPS(false);
      },
      () => {
        setError('No se pudo obtener la ubicación. Verifica los permisos del navegador.');
        setCargandoGPS(false);
      },
      { timeout: 10000 }
    );
  }

  async function buscarDireccion(e) {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setCargandoBusqueda(true);
    setError('');
    try {
      const result = await geocodeDireccion(searchInput);
      setCoords(result.coords);
      setAddress(result.displayName.split(',').slice(0, 3).join(','));
      setSearchInput('');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargandoBusqueda(false);
    }
  }

  function seleccionarGiro(id, nombre) {
    setGiroId(id);
    setTipoNombre(nombre);
  }

  function handleContinuar() {
    onContinuar({
      coords,
      address,
      tipo: giroId,
      tipoNombre,
      huffResult,
    });
  }

  const listo = coords && giroId;

  return (
    <div className="loc">
      <h2 className="loc__titulo">Localización de tu negocio</h2>
      <p className="loc__subtitulo">
        Ingresa tu ubicación con GPS o búsqueda y selecciona el giro.
      </p>

      {/* ── Búsqueda ── */}
      <div className="loc__busqueda">
        <form onSubmit={buscarDireccion} className="loc__search-form">
          <input
            className="loc__search-input"
            type="text"
            placeholder="Av. Insurgentes 123, Condesa..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button className="loc__btn-buscar" type="submit" disabled={cargandoBusqueda}>
            {cargandoBusqueda ? '...' : 'Buscar'}
          </button>
        </form>
        <button className="loc__btn-gps" type="button" onClick={usarGPS} disabled={cargandoGPS}>
          {cargandoGPS ? 'Obteniendo...' : 'Usar mi GPS'}
        </button>
      </div>

      {error && <p className="loc__error">{error}</p>}

      {/* ── Mapa ── */}
      <div className="loc__mapa-wrap">
        <div ref={mapRef} className="loc__mapa" />
        <div className="loc__mapa-leyenda">
          <span className="loc__legend-item loc__legend-item--user">Tu local</span>
          <span className="loc__legend-item loc__legend-item--comp">Competidor</span>
          <span className="loc__legend-item loc__legend-item--radio">Área (800 m)</span>
        </div>
      </div>

      {address && (
        <p className="loc__address">
          <strong>Ubicación:</strong> {address}
        </p>
      )}

      {/* ── Tipo de negocio ── */}
      <div className="loc__giro-section">
        <h3 className="loc__giro-titulo">Tipo de negocio</h3>
        <div className="loc__cat-grid">
          {mockData.categorias.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`loc__cat-btn ${catActiva === cat.id ? 'loc__cat-btn--activo' : ''}`}
              onClick={() => { setCatActiva(cat.id); setGiroId(''); setTipoNombre(''); }}
            >
              <span>{cat.icono}</span>
              <span>{cat.nombre}</span>
            </button>
          ))}
        </div>

        {catActiva && (
          <div className="loc__giro-list">
            {mockData.giros
              .filter((g) => g.categoria === catActiva)
              .map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={`loc__giro-btn ${giroId === g.id ? 'loc__giro-btn--activo' : ''}`}
                  onClick={() => seleccionarGiro(g.id, g.nombre)}
                >
                  {g.nombre}
                </button>
              ))}
            {mockData.giros.filter((g) => g.categoria === catActiva).length === 0 && (
              <p className="loc__sin-giros">Próximamente más giros para esta categoría.</p>
            )}
          </div>
        )}
      </div>

      {/* ── Métricas ── */}
      {huffResult && (
        <div className="loc__metricas">
          <h3 className="loc__metricas-titulo">Análisis de zona</h3>
          <div className="loc__metrica-card">
            <div className="loc__metrica-header">
              <span className="loc__metrica-label">Modelo de Huff</span>
              <span className="loc__metrica-tag">Área de influencia</span>
            </div>
            <div className="loc__metrica-score" style={{ color: huffResult.color }}>
              {huffResult.cuotaMercado}%
            </div>
            <div className="loc__metrica-barra-wrap">
              <div
                className="loc__metrica-barra"
                style={{ width: `${huffResult.score}%`, background: huffResult.color }}
              />
            </div>
            <p className="loc__metrica-desc">
              Cuota de mercado estimada · {huffResult.interpretacion} ·{' '}
              {huffResult.numCompetidores} competidores en zona
            </p>
          </div>
        </div>
      )}

      <div className="loc__footer">
        <button
          className="btn-primary"
          disabled={!listo}
          onClick={handleContinuar}
        >
          Continuar →
        </button>
        {!listo && (
          <p className="loc__hint">
            {!coords ? 'Selecciona una ubicación en el mapa o usa GPS.' : 'Selecciona el tipo de negocio.'}
          </p>
        )}
      </div>
    </div>
  );
}
