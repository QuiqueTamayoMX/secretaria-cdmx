import { useState } from 'react';
import mockData from '../data/mock-tramites.json';
import './RutaTramites.css';

function TramiteCard({ tramite, numero }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <li className={`tramite-item ${tramite.es_filtro_critico ? 'tramite-item--critico' : ''}`}>
      <div className="tramite-item__numero" aria-hidden="true">{numero}</div>
      <div className="tramite-item__contenido">
        <div className="tramite-item__header">
          <h3 className="tramite-item__nombre">{tramite.nombre}</h3>
          <button
            type="button"
            className="tramite-item__toggle"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-label={abierto ? 'Ocultar documentos' : 'Ver documentos requeridos'}
          >
            {abierto ? '▲' : '▼'} Documentos
          </button>
        </div>

        <div className="tramite-item__meta">
          <span className="meta-chip meta-chip--dependencia">🏛 {tramite.dependencia}</span>
          <span className="meta-chip meta-chip--tiempo">⏱ {tramite.tiempo_estimado}</span>
        </div>

        {tramite.nota && (
          <p className={`tramite-item__nota ${tramite.es_filtro_critico ? 'tramite-item__nota--alerta' : ''}`}>
            {tramite.nota}
          </p>
        )}

        {abierto && tramite.documentos && (
          <ul className="tramite-item__docs">
            {tramite.documentos.map((doc, i) => (
              <li key={i} className="tramite-item__doc">
                <span aria-hidden="true">📄</span> {doc}
              </li>
            ))}
          </ul>
        )}

        <a
          href={tramite.link}
          target="_blank"
          rel="noopener noreferrer"
          className="tramite-item__link"
        >
          Más información →
        </a>
      </div>
    </li>
  );
}

const IMPACTO_CONFIG = {
  bajo: {
    color: 'bajo',
    titulo: 'Bajo Impacto — Aviso de Funcionamiento',
    descripcion: 'Resolución automática · Gratuito · Operación inmediata · Sin revalidación periódica',
    fase2titulo: 'Aviso de Funcionamiento (operación inmediata)',
    fase2desc: 'Al registrar el aviso en SIAPEM puedes operar desde ese mismo día. No requiere presencia en ventanilla.',
  },
  vecinal: {
    color: 'vecinal',
    titulo: 'Impacto Vecinal — Permiso de Impacto Vecinal',
    descripcion: 'Alcohol complementario a la actividad gastronómica · 5 días hábiles · Silencio = resolución favorable · Revalidación cada 3 años',
    fase2titulo: 'Permiso de Impacto Vecinal',
    fase2desc: 'Las constancias de no adeudo (predial y agua) son obligatorias. Si la alcaldía no responde en 5 días hábiles, el permiso se considera aprobado (resolución favorable por silencio administrativo).',
  },
  zonal: {
    color: 'zonal',
    titulo: 'Impacto Zonal — Permiso de Impacto Zonal',
    descripcion: 'Alcohol como actividad principal · Evaluación compleja · Negativa ficta · Revalidación cada 2 años',
    fase2titulo: 'Permiso de Impacto Zonal',
    fase2desc: '⚠️ NEGATIVA FICTA: El silencio administrativo equivale a negativa. Requiere seguimiento activo. Se exige videovigilancia aprobada por la SSC y todos los dictámenes de seguridad.',
  },
};

function ObligacionesContinuas({ impacto }) {
  const [abierto, setAbierto] = useState(false);

  const obligaciones = mockData.obligaciones_continuas.filter((o) => {
    if (o.aplica === 'todos') return true;
    return o.aplica.split(',').includes(impacto);
  });

  return (
    <div className="obligaciones-continuas">
      <button
        type="button"
        className="obligaciones__toggle"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
      >
        <span>📋 Obligaciones continuas de operación (Art. 10 LEM)</span>
        <span>{abierto ? '▲' : '▼'}</span>
      </button>
      {abierto && (
        <ul className="obligaciones__lista">
          {obligaciones.map((o) => (
            <li key={o.id} className="obligaciones__item">
              <span aria-hidden="true">✓</span> {o.texto}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function RutaTramites({ fase1, fase2, impacto, ruta, giro, tipoPersona, nivelAlcohol }) {
  const cfg = IMPACTO_CONFIG[impacto] ?? IMPACTO_CONFIG.bajo;

  const alcoholTexto = impacto === 'vecinal'
    ? ' con venta de alcohol como complemento a los alimentos'
    : impacto === 'zonal'
    ? ' con venta de alcohol como actividad principal'
    : '';

  return (
    <section className="ruta-tramites">
      <h2 className="ruta-tramites__titulo">Ruta de trámites</h2>

      <div className={`ruta-badge ruta-badge--${cfg.color}`}>
        <strong>{cfg.titulo}</strong>
        <span>{cfg.descripcion}</span>
      </div>

      <p className="ruta-tramites__subtitulo">
        Abrirás un <strong>{giro.nombre}</strong> como persona <strong>{tipoPersona === 'fisica' ? 'física' : 'moral'}</strong>{alcoholTexto}.
        Haz clic en cada paso para ver los documentos requeridos.
      </p>

      {/* Persona moral: tabla comparativa de figuras jurídicas */}
      {tipoPersona === 'moral' && (
        <div className="tabla-figuras">
          <h4 className="tabla-figuras__titulo">Comparativo de figuras jurídicas</h4>
          <div className="tabla-figuras__grid">
            {[
              {
                nombre: 'SAS',
                descripcion: 'Sociedad por Acciones Simplificada',
                socios: '1+',
                capital: 'Desde $1',
                tiempo: '48 hrs (digital)',
                nota: 'Sin notario. Ideal para emprendedores individuales.',
                recomendado: true,
              },
              {
                nombre: 'S. de R.L.',
                descripcion: 'Sociedad de Responsabilidad Limitada',
                socios: '2+',
                capital: 'Desde $3,000',
                tiempo: '1-4 semanas',
                nota: 'Control cerrado. Partes sociales no cedibles sin aprobación.',
                recomendado: false,
              },
              {
                nombre: 'SA de CV',
                descripcion: 'Sociedad Anónima de Capital Variable',
                socios: '2+',
                capital: 'Desde $50,000',
                tiempo: '2-4 semanas',
                nota: 'Acciones libremente transferibles. Para inversionistas.',
                recomendado: false,
              },
            ].map((fig) => (
              <div key={fig.nombre} className={`figura-card ${fig.recomendado ? 'figura-card--recomendada' : ''}`}>
                {fig.recomendado && <span className="figura-card__tag">Más rápida</span>}
                <strong className="figura-card__nombre">{fig.nombre}</strong>
                <span className="figura-card__desc">{fig.descripcion}</span>
                <div className="figura-card__datos">
                  <span>👥 {fig.socios} socio(s)</span>
                  <span>💰 {fig.capital}</span>
                  <span>⏱ {fig.tiempo}</span>
                </div>
                <p className="figura-card__nota">{fig.nota}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FASE 1 */}
      <div className="fase-bloque">
        <div className="fase-bloque__header">
          <span className="fase-bloque__etiqueta">Fase 1</span>
          <h3 className="fase-bloque__titulo">Autenticación y viabilidad urbana</h3>
        </div>
        <p className="fase-bloque__desc">Pasos obligatorios para todos los giros antes de cualquier solicitud. El Paso 4 es el filtro crítico.</p>
        <ol className="tramites-lista">
          {fase1.map((tramite, idx) => (
            <TramiteCard key={tramite.id} tramite={tramite} numero={idx + 1} />
          ))}
        </ol>
      </div>

      {/* FASE 2 */}
      <div className="fase-bloque">
        <div className="fase-bloque__header">
          <span className={`fase-bloque__etiqueta fase-bloque__etiqueta--${cfg.color}`}>
            Fase 2 · {impacto === 'bajo' ? 'Bajo Impacto' : impacto === 'vecinal' ? 'Impacto Vecinal' : 'Impacto Zonal'}
          </span>
          <h3 className="fase-bloque__titulo">{cfg.fase2titulo}</h3>
        </div>
        <p className="fase-bloque__desc">{cfg.fase2desc}</p>
        <ol className="tramites-lista" start={fase1.length + 1}>
          {fase2.map((tramite, idx) => (
            <TramiteCard key={tramite.id} tramite={tramite} numero={fase1.length + idx + 1} />
          ))}
        </ol>
      </div>

      {/* Obligaciones continuas */}
      <ObligacionesContinuas impacto={impacto} />

      {/* Sanciones */}
      <div className="sanciones-aviso">
        <strong>⚖️ Sanciones por incumplimiento (UMA 2026 = $117.31 MXN/día)</strong>
        <ul>
          <li>Sin aviso/permiso de funcionamiento: <strong>25–125 UMA</strong> (~$2,932–$14,663 MXN)</li>
          <li>Sin aviso Y sin uso de suelo: hasta <strong>~175.5 UMA</strong> (~$20,587 MXN)</li>
          <li>Incumplimiento de condiciones del permiso: <strong>clausura temporal o definitiva</strong></li>
        </ul>
      </div>

      <p className="disclaimer">
        Esta herramienta es de orientación general. Verifica los requisitos específicos en las
        dependencias oficiales antes de iniciar tu trámite.
      </p>
    </section>
  );
}
