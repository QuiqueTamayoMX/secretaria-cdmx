import { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Circle,
  useMap,
} from '@vis.gl/react-google-maps';
import { geocodeDireccion, reverseGeocode } from '../../services/geocodingService.js';
import { calcularHuff } from '../../services/huffModel.js';
import { buscarCompetidores } from '../../services/placesService.js';
import mockData from '../../data/mock-tramites.json';
import './Localizacion.css';

const CDMX = { lat: 19.4326, lng: -99.1332 };
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAP_ID  = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID';

const CIRCLE_OPTIONS = {
  strokeColor: '#9d2148',
  strokeOpacity: 0.7,
  strokeWeight: 1.5,
  fillColor: '#9d2148',
  fillOpacity: 0.06,
};

function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !center) return;
    map.panTo(center);
    map.setZoom(15);
  }, [map, center]);
  return null;
}

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

  useEffect(() => {
    if (!coords || !giroId) return;
    let cancelled = false;
    buscarCompetidores(coords, giroId)
      .then((reales) => {
        if (!cancelled) setHuffResult(calcularHuff(coords, giroId, reales));
      })
      .catch(() => {
        if (!cancelled) setHuffResult(calcularHuff(coords, giroId));
      });
    return () => { cancelled = true; };
  }, [coords, giroId]);

  function handleMapClick(e) {
    const latLng = e.detail?.latLng;
    if (!latLng) return;
    const { lat, lng } = latLng;
    setCoords({ lat, lng });
    reverseGeocode(lat, lng).then(setAddress).catch(() => {});
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
    onContinuar({ coords, address, tipo: giroId, tipoNombre, huffResult });
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
        {!GOOGLE_API_KEY ? (
          <div className="loc__mapa loc__mapa--no-key">
            <p>
              Configura <code>VITE_GOOGLE_MAPS_API_KEY</code> en <code>.env</code> para ver el mapa.
            </p>
          </div>
        ) : (
          <div className="loc__mapa">
            <APIProvider apiKey={GOOGLE_API_KEY}>
              <Map
                defaultCenter={CDMX}
                defaultZoom={13}
                mapId={GOOGLE_MAP_ID}
                onClick={handleMapClick}
                gestureHandling="greedy"
                style={{ width: '100%', height: '100%' }}
              >
                <MapController center={coords} />

                {coords && (
                  <>
                    <AdvancedMarker position={coords}>
                      <div className="loc-marker-user" />
                    </AdvancedMarker>
                    <Circle center={coords} radius={800} options={CIRCLE_OPTIONS} />
                  </>
                )}

                {huffResult?.competidores.map((c, i) => (
                  <AdvancedMarker key={i} position={c.coords} title={c.nombre}>
                    <div className="loc-marker-comp" />
                  </AdvancedMarker>
                ))}
              </Map>
            </APIProvider>
          </div>
        )}

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
        <button className="btn-primary" disabled={!listo} onClick={handleContinuar}>
          Continuar →
        </button>
        {!listo && (
          <p className="loc__hint">
            {!coords
              ? 'Selecciona una ubicación en el mapa o usa GPS.'
              : 'Selecciona el tipo de negocio.'}
          </p>
        )}
      </div>
    </div>
  );
}
