import { useState } from 'react';
import mockData from '../data/mock-tramites.json';
import { calcularRutaCritica } from '../services/rutaLogica.js';
import StatusBadge from './StatusBadge.jsx';
import MapaZona from './MapaZona.jsx';
import './DiagnosticoForm.css';

function diagnosticar(giroId, coloniaKey) {
  const giro = mockData.giros.find((g) => g.id === giroId);
  if (!giro) return { status: 'verificacion', usoSuelo: null, alcaldia: null };

  const coloniaData = mockData.colonias[coloniaKey?.toLowerCase().trim()];
  if (!coloniaData) return { status: 'verificacion', usoSuelo: null, alcaldia: null };

  const compatible = giro.uso_suelo_compatible.includes(coloniaData.uso_suelo);
  return {
    status: compatible ? 'viable' : 'incompatible',
    usoSuelo: coloniaData.uso_suelo,
    alcaldia: coloniaData.alcaldia,
  };
}

const IMPACTO_LABELS = {
  bajo:    { label: 'Bajo Impacto',    color: 'bajo',    emoji: '✅' },
  vecinal: { label: 'Impacto Vecinal', color: 'vecinal', emoji: '⚠️' },
  zonal:   { label: 'Impacto Zonal',   color: 'zonal',   emoji: '🔴' },
};

export default function DiagnosticoForm({ onDiagnostico }) {
  const [categoriaActiva, setCategoriaActiva] = useState(null);
  const [giro, setGiro] = useState('');
  const [colonia, setColonia] = useState('');
  const [tipoPersona, setTipoPersona] = useState('fisica');
  const [nivelAlcohol, setNivelAlcohol] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [modoMapa, setModoMapa] = useState(true);

  const girosDeCategoria = categoriaActiva
    ? mockData.giros.filter((g) => g.categoria === categoriaActiva)
    : [];

  const giroData = mockData.giros.find((g) => g.id === giro);

  // Preview del impacto mientras el usuario llena el formulario
  const impactoPreview = giroData
    ? (giroData.puede_personalizar_alcohol && nivelAlcohol === 'vecinal')
      ? 'vecinal'
      : giroData.impacto_base ?? 'bajo'
    : null;

  function handleZona({ colonia: c }) {
    if (c) setColonia(c.nombre);
  }

  function handleGiroChange(nuevoGiro) {
    setGiro(nuevoGiro);
    setNivelAlcohol(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!giro) return;

    const diagnostico = diagnosticar(giro, colonia);
    const rutaCritica = calcularRutaCritica(giro, nivelAlcohol, tipoPersona, null);

    const res = {
      ...diagnostico,
      giro: rutaCritica.giro,
      impacto: rutaCritica.impacto,
      ruta: rutaCritica.ruta,
      fase1: rutaCritica.fase1,
      fase2: rutaCritica.fase2,
      colonia,
      tipoPersona,
      nivelAlcohol,
    };
    setResultado(res);
    onDiagnostico(res);
  }

  return (
    <section className="diagnostico-form">
      <h2 className="diagnostico-form__titulo">Diagnóstico de viabilidad</h2>
      <p className="diagnostico-form__subtitulo">
        Configura tu negocio y selecciona la zona para conocer si es viable y qué trámites necesitas.
      </p>

      <form onSubmit={handleSubmit} className="diagnostico-form__form" noValidate>

        {/* ── ZONA ── */}
        <div className="seccion-form">
          <div className="seccion-form__header">
            <span className="seccion-form__numero">1</span>
            <h3 className="seccion-form__titulo">Selecciona tu zona</h3>
          </div>

          <div className="tab-toggle">
            <button
              type="button"
              className={`tab-toggle__btn ${modoMapa ? 'tab-toggle__btn--activo' : ''}`}
              onClick={() => setModoMapa(true)}
            >
              🗺 Mapa
            </button>
            <button
              type="button"
              className={`tab-toggle__btn ${!modoMapa ? 'tab-toggle__btn--activo' : ''}`}
              onClick={() => setModoMapa(false)}
            >
              🔍 Buscar colonia
            </button>
          </div>

          {modoMapa ? (
            <MapaZona onZonaSeleccionada={handleZona} />
          ) : (
            <div className="form-field">
              <label htmlFor="colonia" className="form-field__label">Colonia o alcaldía</label>
              <input
                id="colonia"
                type="text"
                value={colonia}
                onChange={(e) => setColonia(e.target.value)}
                placeholder="Ej. Condesa, Polanco, Roma Norte..."
                className="form-field__input"
                list="colonias-list"
              />
              <datalist id="colonias-list">
                {Object.keys(mockData.colonias).map((c) => (
                  <option key={c} value={c.charAt(0).toUpperCase() + c.slice(1)} />
                ))}
              </datalist>
            </div>
          )}

          {colonia && (
            <div className="zona-seleccionada">
              📍 Zona seleccionada: <strong>{colonia.charAt(0).toUpperCase() + colonia.slice(1)}</strong>
              {mockData.colonias[colonia.toLowerCase()] && (
                <> · {mockData.colonias[colonia.toLowerCase()].alcaldia}</>
              )}
            </div>
          )}
        </div>

        {/* ── TIPO DE NEGOCIO ── */}
        <div className="seccion-form">
          <div className="seccion-form__header">
            <span className="seccion-form__numero">2</span>
            <h3 className="seccion-form__titulo">Tipo de negocio</h3>
          </div>
          <p className="seccion-form__hint">Elige una categoría</p>

          <div className="categoria-grid">
            {mockData.categorias.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`categoria-card ${categoriaActiva === cat.id ? 'categoria-card--activa' : ''}`}
                onClick={() => {
                  setCategoriaActiva(cat.id);
                  handleGiroChange('');
                }}
              >
                <span className="categoria-card__icono">{cat.icono}</span>
                <strong className="categoria-card__nombre">{cat.nombre}</strong>
                <span className="categoria-card__desc">{cat.descripcion}</span>
              </button>
            ))}
          </div>

          {categoriaActiva && girosDeCategoria.length > 0 && (
            <div className="form-field" style={{ marginTop: '1rem' }}>
              <label htmlFor="giro" className="form-field__label">Especificar giro</label>
              <select
                id="giro"
                value={giro}
                onChange={(e) => handleGiroChange(e.target.value)}
                className="form-field__input"
              >
                <option value="">Selecciona un giro específico...</option>
                {girosDeCategoria.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nombre} — SCIAN {g.scian}
                  </option>
                ))}
              </select>
            </div>
          )}

          {categoriaActiva && girosDeCategoria.length === 0 && (
            <p className="sin-giros">
              Próximamente giros para esta categoría. Selecciona otra para el demo.
            </p>
          )}
        </div>

        {/* ── NIVEL DE ALCOHOL (solo para giros que pueden personalizarse) ── */}
        {giro && giroData?.puede_personalizar_alcohol && (
          <div className="seccion-form">
            <div className="seccion-form__header">
              <span className="seccion-form__numero">3</span>
              <h3 className="seccion-form__titulo">¿Tu negocio venderá bebidas alcohólicas?</h3>
            </div>
            <p className="seccion-form__hint">
              Esto determina el <strong>nivel de impacto</strong> y el tipo de permiso requerido por la Ley de Establecimientos Mercantiles.
            </p>
            <div className="persona-cards">
              {[
                {
                  val: 'ninguno',
                  label: 'No vende alcohol',
                  desc: 'Aviso de Funcionamiento automático y gratuito. Operación inmediata al registrar.',
                  badge: '✅ Bajo Impacto',
                  badgeClass: 'persona-card__badge--bajo',
                },
                {
                  val: 'vecinal',
                  label: 'Sí, como acompañamiento a los alimentos',
                  desc: 'Permiso de Impacto Vecinal · 5 días hábiles · Silencio = resolución favorable · Vigencia 3 años.',
                  badge: '⚠️ Impacto Vecinal',
                  badgeClass: 'persona-card__badge--vecinal',
                },
              ].map(({ val, label, desc, badge, badgeClass }) => {
                const activo = nivelAlcohol !== null ? nivelAlcohol === val : val === 'ninguno';
                return (
                  <button
                    key={val}
                    type="button"
                    className={`persona-card ${activo ? 'persona-card--activa' : ''}`}
                    onClick={() => setNivelAlcohol(val)}
                  >
                    <span className="persona-card__radio" aria-hidden="true">{activo ? '●' : '○'}</span>
                    <div>
                      <strong className="persona-card__label">{label}</strong>
                      <span className={`persona-card__badge ${badgeClass}`}>{badge}</span>
                      <span className="persona-card__desc">{desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Banner informativo para giros con impacto fijo (bar = zonal) */}
        {giro && giroData && !giroData.puede_personalizar_alcohol && giroData.impacto_base === 'zonal' && (
          <div className="seccion-form">
            <div className="seccion-form__header">
              <span className="seccion-form__numero">3</span>
              <h3 className="seccion-form__titulo">Nivel de impacto</h3>
            </div>
            <div className="impacto-banner impacto-banner--zonal">
              <strong>🔴 Impacto Zonal</strong>
              <p>
                Este giro (bar, cantina, antro) requiere <strong>Permiso de Impacto Zonal</strong> por la Ley de Establecimientos Mercantiles.
                El proceso incluye videovigilancia aprobada por la SSC. Vigencia: 2 años. Silencio administrativo = negativa ficta.
              </p>
            </div>
          </div>
        )}

        {/* ── TIPO DE PERSONA ── */}
        <div className="seccion-form">
          <div className="seccion-form__header">
            <span className="seccion-form__numero">{giro && (giroData?.puede_personalizar_alcohol || giroData?.impacto_base === 'zonal') ? '4' : '3'}</span>
            <h3 className="seccion-form__titulo">¿Cómo vas a operar?</h3>
          </div>

          <div className="persona-cards">
            {[
              {
                val: 'fisica',
                label: 'Persona física',
                desc: 'Emprendedor individual. Sin costo de constitución, responsabilidad ilimitada.',
              },
              {
                val: 'moral',
                label: 'Persona moral',
                desc: 'Sociedad (SA de CV, S. de R.L., SAS). La SAS se constituye digitalmente en 48 hrs desde $1 de capital.',
              },
            ].map(({ val, label, desc }) => (
              <button
                key={val}
                type="button"
                className={`persona-card ${tipoPersona === val ? 'persona-card--activa' : ''}`}
                onClick={() => setTipoPersona(val)}
              >
                <span className="persona-card__radio" aria-hidden="true">
                  {tipoPersona === val ? '●' : '○'}
                </span>
                <div>
                  <strong className="persona-card__label">{label}</strong>
                  <span className="persona-card__desc">{desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Preview del nivel de impacto */}
        {impactoPreview && (
          <div className={`impacto-preview impacto-preview--${impactoPreview}`}>
            <span>{IMPACTO_LABELS[impactoPreview].emoji}</span>
            <div>
              <strong>{IMPACTO_LABELS[impactoPreview].label}</strong>
              {impactoPreview === 'bajo' && <span> · Aviso automático y gratuito</span>}
              {impactoPreview === 'vecinal' && <span> · Permiso de 5 días hábiles</span>}
              {impactoPreview === 'zonal' && <span> · Permiso complejo con evaluación</span>}
            </div>
          </div>
        )}

        <button type="submit" className="btn-primary btn-analizar" disabled={!giro}>
          Analizar viabilidad
        </button>
      </form>

      {resultado && (
        <div className="diagnostico-form__resultado">
          <StatusBadge status={resultado.status} />
          {resultado.usoSuelo && (
            <p className="uso-suelo-info">
              Uso de suelo en <strong>{resultado.colonia}</strong>:{' '}
              <strong>{resultado.usoSuelo}</strong> · Alcaldía: <strong>{resultado.alcaldia}</strong>
            </p>
          )}
          {resultado.status === 'verificacion' && (
            <p className="uso-suelo-info">
              Zona no encontrada en nuestra base de datos. Verifica el uso de suelo directamente en SEDUVI.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
