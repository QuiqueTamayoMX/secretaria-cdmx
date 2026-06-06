import { calcularViabilidadComercial } from '../services/analisisComercial.js';
import './AnalisisComercial.css';

const SATURACION_CONFIG = {
  baja:     { icon: '✅', color: 'verde',    label: 'Baja'      },
  media:    { icon: '⚠️', color: 'amarillo', label: 'Moderada'  },
  alta:     { icon: '🔶', color: 'naranja',  label: 'Alta'      },
  muy_alta: { icon: '🔴', color: 'rojo',     label: 'Muy alta'  },
};

const TRAFICO_CONFIG = {
  'baja':            { icon: '🚶', label: 'Bajo'       },
  'baja-media':      { icon: '🚶', label: 'Bajo-medio' },
  'media':           { icon: '🚶‍♂️', label: 'Medio'      },
  'media-alta':      { icon: '👥', label: 'Medio-alto' },
  'alta':            { icon: '👥', label: 'Alto'       },
  'muy alta':        { icon: '🏙️', label: 'Muy alto'   },
  'media (alta en fines de semana)': { icon: '📅', label: 'Fin de semana alto' },
};

function ScoreRing({ score, nivel }) {
  const colorMap = { favorable: '#2e7d32', moderado: '#b28e5c', dificil: '#c62828' };
  const color = colorMap[nivel] ?? '#9d2148';
  const pct = Math.round(score);

  return (
    <div
      className="score-ring"
      style={{ '--score-color': color, '--score-pct': `${pct}%` }}
      aria-label={`Score de viabilidad comercial: ${pct} de 100`}
    >
      <span className="score-ring__numero">{pct}</span>
      <span className="score-ring__label">/ 100</span>
    </div>
  );
}

function MetricaCard({ titulo, icono, valor, sub, scoreColor, badge }) {
  const colorClass = { verde: 'metrica--verde', amarillo: 'metrica--amarillo', naranja: 'metrica--naranja', rojo: 'metrica--rojo' }[scoreColor] ?? '';
  return (
    <div className={`metrica-card ${colorClass}`}>
      <span className="metrica-card__icono">{icono}</span>
      <div className="metrica-card__contenido">
        <span className="metrica-card__titulo">{titulo}</span>
        <strong className="metrica-card__valor">{valor}</strong>
        {badge && <span className="metrica-card__badge">{badge}</span>}
        {sub && <span className="metrica-card__sub">{sub}</span>}
      </div>
    </div>
  );
}

export default function AnalisisComercial({ giro, colonia }) {
  if (!giro || !colonia) return null;

  const analisis = calcularViabilidadComercial(colonia, giro.id);

  if (!analisis) {
    return (
      <div className="analisis-comercial analisis-comercial--sin-datos">
        <p>
          Análisis comercial no disponible para <strong>{colonia}</strong>. Consulta directamente el{' '}
          <a href="https://www.inegi.org.mx/app/mapa/denue/" target="_blank" rel="noopener noreferrer">DENUE de INEGI</a>.
        </p>
      </div>
    );
  }

  const satCfg = SATURACION_CONFIG[analisis.mercado.saturacion] ?? SATURACION_CONFIG.media;
  const trafCfg = TRAFICO_CONFIG[analisis.movilidad.traficoLabel] ?? { icon: '🚶', label: analisis.movilidad.traficoLabel };

  const nivelLabel = {
    favorable: '✅ Alta viabilidad',
    moderado:  '⚠️ Viable con diferenciación',
    dificil:   '🔴 Mercado desafiante',
  }[analisis.nivel];

  const nivelColor = {
    favorable: 'nivel--favorable',
    moderado:  'nivel--moderado',
    dificil:   'nivel--dificil',
  }[analisis.nivel];

  return (
    <section className="analisis-comercial">
      <div className="analisis-comercial__header">
        <div>
          <h2 className="analisis-comercial__titulo">Análisis comercial de la zona</h2>
          <p className="analisis-comercial__subtitulo">
            <strong>{colonia.charAt(0).toUpperCase() + colonia.slice(1)}</strong> ·{' '}
            <strong>{giro.nombre}</strong>
          </p>
        </div>
        <span className={`nivel-badge ${nivelColor}`}>{nivelLabel}</span>
      </div>

      <div className="analisis-comercial__body">
        {/* Score */}
        <div className="analisis-score-col">
          <ScoreRing score={analisis.score} nivel={analisis.nivel} />
          <p className="analisis-score-col__texto">{analisis.recomendacion}</p>
        </div>

        {/* Métricas */}
        <div className="analisis-metricas">
          <MetricaCard
            titulo="Competidores en 800m"
            icono="🏪"
            valor={`${analisis.mercado.competidores} negocios`}
            badge={`${satCfg.icon} ${satCfg.label} saturación`}
            sub={analisis.mercado.referencia}
            scoreColor={satCfg.color}
          />
          <MetricaCard
            titulo="Nivel socioeconómico"
            icono="💰"
            valor={`NSE ${analisis.nse.nivel}`}
            sub={analisis.nse.descripcion}
            scoreColor={analisis.nse.score >= 65 ? 'verde' : analisis.nse.score >= 45 ? 'amarillo' : 'naranja'}
          />
          <MetricaCard
            titulo="Movilidad y tráfico"
            icono="🚇"
            valor={analisis.movilidad.metro}
            badge={`${trafCfg.icon} Tráfico peatonal: ${trafCfg.label}`}
            sub={`${analisis.movilidad.distanciaMetroM < 500 ? '✅' : analisis.movilidad.distanciaMetroM < 1000 ? '⚠️' : '🔴'} Metro a ${analisis.movilidad.distanciaMetroM.toLocaleString('es-MX')} m${analisis.movilidad.ecobici > 0 ? ` · ${analisis.movilidad.ecobici} estaciones ECOBICI` : ''}`}
            scoreColor={analisis.movilidad.score >= 70 ? 'verde' : analisis.movilidad.score >= 50 ? 'amarillo' : 'naranja'}
          />
        </div>
      </div>

      {/* Descripción de zona */}
      <div className="analisis-zona-desc">
        <span className="analisis-zona-desc__icon">💡</span>
        <p>{analisis.descripcionZona}</p>
      </div>

      <p className="analisis-fuente">
        Datos orientativos · Fuentes: DENUE-INEGI, AMAI NSE 2023, afluencia Metro CDMX ·{' '}
        <a href="https://www.inegi.org.mx/app/mapa/denue/" target="_blank" rel="noopener noreferrer">
          Verificar en DENUE →
        </a>
      </p>
    </section>
  );
}
