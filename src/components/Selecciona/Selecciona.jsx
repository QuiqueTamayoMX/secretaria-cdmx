import './Selecciona.css';

export default function Selecciona({ usuario, negocios, onChatbot, onComparador }) {
  return (
    <div className="sel">
      <h2 className="sel__titulo">¿Qué necesitas hoy, {usuario?.nombre?.split(' ')[0]}?</h2>
      <p className="sel__subtitulo">
        Elige entre el asistente guiado de trámites o el comparador de locales.
      </p>

      <div className="sel__grid">
        <button className="sel__card" onClick={onChatbot}>
          <div className="sel__card-icono">💬</div>
          <h3 className="sel__card-titulo">Asistente paso a paso</h3>
          <p className="sel__card-desc">
            Chatbot con RAG que te guía por los trámites de apertura en CDMX: permisos, documentos,
            tiempos y costos, personalizado a tu giro.
          </p>
          <span className="sel__card-badge">Conectado a n8n</span>
        </button>

        <button className="sel__card" onClick={onComparador}>
          <div className="sel__card-icono">📊</div>
          <h3 className="sel__card-titulo">Comparador de locales</h3>
          <p className="sel__card-desc">
            Agrega, edita y compara hasta 5 ubicaciones con sus métricas de Huff.
            Descarga el reporte en PDF.
          </p>
          {negocios.length > 0 && (
            <span className="sel__card-badge sel__card-badge--count">
              {negocios.length} local{negocios.length !== 1 ? 'es' : ''} guardado{negocios.length !== 1 ? 's' : ''}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
