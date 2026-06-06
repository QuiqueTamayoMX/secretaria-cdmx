import { useState, useEffect, useRef } from 'react';
import { parseCSV, evaluarCaso, getColonias, getCallesPorColonia } from '../services/motorTerritorial.js';
import { GIROS_DEMO } from '../data/territorial-lookups.js';
import './DiagnosticoTerritorial.css';

const SEMAFORO_META = {
  VERDE:    { label: 'Compatible',     clase: 'semaforo--verde',    icono: '🟢' },
  AMARILLO: { label: 'Verificar',      clase: 'semaforo--amarillo', icono: '🟡' },
  ROJO:     { label: 'No compatible',  clase: 'semaforo--rojo',     icono: '🔴' },
};

const RIESGO_META = {
  BAJO:  { label: 'Bajo',  clase: 'riesgo--bajo',  icono: '✅' },
  MEDIO: { label: 'Medio', clase: 'riesgo--medio', icono: '⚠️' },
  ALTO:  { label: 'Alto',  clase: 'riesgo--alto',  icono: '🚨' },
};

const DECISION_META = {
  AVANZAR:             { label: 'Avanzar',                 clase: 'decision--verde',         icono: '✅' },
  AVANZAR_CON_REVISION:{ label: 'Avanzar con revisión',    clase: 'decision--amarillo-verde', icono: '⚠️' },
  VERIFICAR_PRIMERO:   { label: 'Verificar primero',       clase: 'decision--amarillo',       icono: '🔍' },
  REVISION_ESPECIAL:   { label: 'Revisión especializada',  clase: 'decision--naranja',        icono: '📋' },
  NO_AVANZAR:          { label: 'No avanzar',              clase: 'decision--rojo',           icono: '🚫' },
};

export default function DiagnosticoTerritorial() {
  const [estado, setEstado] = useState('cargando'); // cargando | listo | buscando | resultado | error
  const [predios, setPredios] = useState([]);
  const [colonias, setColonias] = useState([]);

  const [giro, setGiro] = useState('');
  const [colonia, setColonia] = useState('');
  const [calle, setCalle] = useState('');
  const [numExt, setNumExt] = useState('');

  const [callesSugeridas, setCallesSugeridas] = useState([]);
  const [resultado, setResultado] = useState(null);
  const resultadoRef = useRef(null);

  // Load and parse CSV once on mount
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/benito_juarez.csv`)
      .then((r) => {
        if (!r.ok) throw new Error('No se pudo cargar el archivo territorial.');
        return r.text();
      })
      .then((text) => {
        const data = parseCSV(text);
        setPredios(data);
        setColonias(getColonias(data));
        setEstado('listo');
      })
      .catch(() => setEstado('error'));
  }, []);

  // Update calle suggestions when colonia changes
  useEffect(() => {
    if (colonia && predios.length > 0) {
      setCallesSugeridas(getCallesPorColonia(predios, colonia));
    } else {
      setCallesSugeridas([]);
    }
    setCalle('');
    setNumExt('');
    setResultado(null);
  }, [colonia, predios]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!giro || !colonia || !calle) return;

    setEstado('buscando');
    setResultado(null);

    // Small timeout to show loading state
    setTimeout(() => {
      const res = evaluarCaso(predios, giro, calle, numExt, colonia);
      setResultado(res);
      setEstado('resultado');
      setTimeout(() => {
        resultadoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, 300);
  }

  function handleReiniciar() {
    setGiro('');
    setColonia('');
    setCalle('');
    setNumExt('');
    setResultado(null);
    setEstado('listo');
  }

  return (
    <section className="territorial">
      <div className="territorial__header">
        <div className="territorial__header-badge">Motor territorial · Demo</div>
        <h2 className="territorial__titulo">Diagnóstico de uso de suelo</h2>
        <p className="territorial__subtitulo">
          Verifica si el uso de suelo de un predio en Benito Juárez es compatible con tu giro,
          de forma orientativa. No sustituye el Certificado SEDUVI.
        </p>
      </div>

      {/* Loading state */}
      {estado === 'cargando' && (
        <div className="territorial__cargando">
          <div className="territorial__spinner" aria-hidden="true" />
          <p>Cargando base territorial de Benito Juárez…</p>
        </div>
      )}

      {/* Error state */}
      {estado === 'error' && (
        <div className="territorial__error">
          <span>⚠️</span>
          <p>No se pudo cargar la base territorial. Verifica que el servidor esté corriendo.</p>
        </div>
      )}

      {/* Form */}
      {(estado === 'listo' || estado === 'buscando' || estado === 'resultado') && (
        <form onSubmit={handleSubmit} className="territorial__form" noValidate>
          {/* Giro */}
          <div className="tform__field">
            <label htmlFor="t-giro" className="tform__label">
              Giro del negocio
            </label>
            <select
              id="t-giro"
              value={giro}
              onChange={(e) => { setGiro(e.target.value); setResultado(null); }}
              className="tform__select"
              required
            >
              <option value="">Selecciona un giro…</option>
              {GIROS_DEMO.map((g) => (
                <option key={g.giro_normalizado} value={g.giro_usuario}>
                  {g.icono} {g.giro_usuario} · Riesgo {g.riesgo.toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Colonia */}
          <div className="tform__field">
            <label htmlFor="t-colonia" className="tform__label">
              Colonia <span className="tform__hint">(Alcaldía Benito Juárez)</span>
            </label>
            <input
              id="t-colonia"
              type="text"
              value={colonia}
              onChange={(e) => setColonia(e.target.value)}
              placeholder="Ej. NAPOLES, DEL VALLE CENTRO…"
              className="tform__input"
              list="colonias-territorial"
              required
              autoComplete="off"
            />
            <datalist id="colonias-territorial">
              {colonias.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>

          {/* Calle */}
          <div className="tform__row">
            <div className="tform__field tform__field--calle">
              <label htmlFor="t-calle" className="tform__label">Calle</label>
              <input
                id="t-calle"
                type="text"
                value={calle}
                onChange={(e) => { setCalle(e.target.value); setResultado(null); }}
                placeholder="Ej. MINNESOTA"
                className="tform__input"
                list="calles-territorial"
                required
                autoComplete="off"
              />
              {callesSugeridas.length > 0 && (
                <datalist id="calles-territorial">
                  {callesSugeridas.map((c) => <option key={c} value={c} />)}
                </datalist>
              )}
            </div>

            <div className="tform__field tform__field--num">
              <label htmlFor="t-num" className="tform__label">No. exterior</label>
              <input
                id="t-num"
                type="text"
                value={numExt}
                onChange={(e) => { setNumExt(e.target.value); setResultado(null); }}
                placeholder="Ej. 2"
                className="tform__input"
                autoComplete="off"
              />
            </div>
          </div>

          <div className="tform__actions">
            <button
              type="submit"
              className="tform__btn-buscar"
              disabled={!giro || !colonia || !calle || estado === 'buscando'}
            >
              {estado === 'buscando' ? 'Buscando…' : 'Buscar predio'}
            </button>
            {resultado && (
              <button type="button" className="tform__btn-reiniciar" onClick={handleReiniciar}>
                Nueva búsqueda
              </button>
            )}
          </div>
        </form>
      )}

      {/* Results */}
      {resultado && (
        <div className="territorial__resultado" ref={resultadoRef}>
          {resultado.ok ? (
            <ResultadoExitoso resultado={resultado} />
          ) : (
            <ResultadoError resultado={resultado} />
          )}
          <p className="territorial__disclaimer">
            Este diagnóstico es orientativo y debe verificarse con certificado SEDUVI vigente.
            No sustituye revisión jurídica, normativa ni técnica.
          </p>
        </div>
      )}
    </section>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ResultadoExitoso({ resultado }) {
  const sem = SEMAFORO_META[resultado.semaforo_uso];
  const riesg = RIESGO_META[resultado.riesgo_giro];
  const dec = DECISION_META[resultado.decision_final];

  return (
    <div className="resultado">
      {/* Predio encontrado */}
      <div className="resultado__predio">
        <span className="resultado__predio-icono">📍</span>
        <div>
          <strong>{resultado.predio.calle} {resultado.predio.no_externo}</strong>
          <span className="resultado__predio-col">{resultado.predio.colonia} · BENITO JUÁREZ</span>
        </div>
        {resultado.liga_ciuda && (
          <a
            href={resultado.liga_ciuda}
            target="_blank"
            rel="noopener noreferrer"
            className="resultado__ficha-link"
          >
            Ver ficha SEDUVI →
          </a>
        )}
      </div>

      {/* Semáforo + uso */}
      <div className={`resultado__bloque resultado__bloque--uso ${sem.clase}`}>
        <div className="resultado__bloque-header">
          <span className="resultado__bloque-icono">{sem.icono}</span>
          <div>
            <span className="resultado__bloque-etiqueta">Uso de suelo</span>
            <strong className="resultado__bloque-valor">{resultado.uso_descri}</strong>
          </div>
          <span className={`resultado__badge ${sem.clase}`}>{sem.label}</span>
        </div>
        <p className="resultado__bloque-msg">{resultado.mensaje_uso}</p>
      </div>

      {/* Riesgo del giro */}
      <div className={`resultado__bloque resultado__bloque--giro ${riesg.clase}`}>
        <div className="resultado__bloque-header">
          <span className="resultado__bloque-icono">{riesg.icono}</span>
          <div>
            <span className="resultado__bloque-etiqueta">Giro evaluado</span>
            <strong className="resultado__bloque-valor">{resultado.giro_normalizado}</strong>
          </div>
          <span className={`resultado__badge ${riesg.clase}`}>Riesgo {riesg.label}</span>
        </div>
        <p className="resultado__bloque-msg">{resultado.giro_familia}</p>
      </div>

      {/* Decision final */}
      <div className={`resultado__decision ${dec.clase}`}>
        <div className="resultado__decision-header">
          <span className="resultado__decision-icono">{dec.icono}</span>
          <strong className="resultado__decision-label">{dec.label}</strong>
        </div>
        <p className="resultado__decision-msg">{resultado.mensaje_final}</p>
        <p className="resultado__decision-accion">{resultado.accion_app}</p>
      </div>

      {/* CTA */}
      <div className="resultado__cta">
        <p className="resultado__pantalla-msg">{resultado.pantalla_app}</p>
        <button className="resultado__btn-accion">
          {resultado.texto_boton}
        </button>
      </div>
    </div>
  );
}

function ResultadoError({ resultado }) {
  const iconos = {
    SIN_DATOS: '🔍',
    USO_NO_CLASIFICADO: '📋',
    GIRO_NO_CLASIFICADO: '🏢',
    REGLA_NO_ENCONTRADA: '⚙️',
  };
  return (
    <div className="resultado resultado--error">
      <span className="resultado__error-icono">{iconos[resultado.codigo] || '⚠️'}</span>
      <strong className="resultado__error-titulo">{resultado.codigo.replace(/_/g, ' ')}</strong>
      <p className="resultado__error-msg">{resultado.mensaje}</p>
      {resultado.predio && (
        <p className="resultado__error-predio">
          Predio encontrado: {resultado.predio.calle} {resultado.predio.no_externo} · {resultado.predio.colonia}
          {resultado.predio.uso_descri && ` · uso: "${resultado.predio.uso_descri}"`}
        </p>
      )}
    </div>
  );
}
