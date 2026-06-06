import { useState, useRef, useEffect } from 'react';
import { enviarMensaje, IS_LIVE } from '../../services/n8nService.js';
import './Chatbot.css';

const MSG_BIENVENIDA = {
  id: 0,
  rol: 'asistente',
  texto: `Hola, soy tu asistente de apertura de negocios en CDMX. Puedo ayudarte con:\n\n• Trámites y permisos de apertura\n• Requisitos por tipo de negocio\n• Tiempos y costos estimados\n• Normativa de la Ley de Establecimientos Mercantiles\n\n¿Por dónde empezamos?`,
};

// Convierte **texto** en <strong> y saltos de línea en <br>
function renderTexto(texto) {
  return texto.split('\n').map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={i}>
        {parts.map((p, j) =>
          p.startsWith('**') && p.endsWith('**')
            ? <strong key={j}>{p.slice(2, -2)}</strong>
            : p
        )}
        {i < texto.split('\n').length - 1 && <br />}
      </span>
    );
  });
}

export default function Chatbot({ negocio, usuario, onVolver }) {
  const [mensajes, setMensajes] = useState([MSG_BIENVENIDA]);
  const [input, setInput]       = useState('');
  const [cargando, setCargando] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, cargando]);

  async function enviar(e) {
    e.preventDefault();
    const texto = input.trim();
    if (!texto || cargando) return;

    const msgUsuario = { id: Date.now(), rol: 'usuario', texto };
    setMensajes((prev) => [...prev, msgUsuario]);
    setInput('');
    setCargando(true);

    try {
      const historial = mensajes.map((m) => ({ rol: m.rol, texto: m.texto }));
      const respuesta = await enviarMensaje(texto, historial, {
        negocio: negocio ? { tipo: negocio.tipoNombre, address: negocio.address } : null,
        usuario: usuario ? { nombre: usuario.nombre } : null,
      });
      setMensajes((prev) => [...prev, { id: Date.now() + 1, rol: 'asistente', texto: respuesta }]);
    } catch {
      setMensajes((prev) => [
        ...prev,
        { id: Date.now() + 1, rol: 'asistente', texto: 'Hubo un error al conectar con el asistente. Intenta de nuevo.' },
      ]);
    } finally {
      setCargando(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  const esDemo = !IS_LIVE;

  return (
    <div className="chat">
      <div className="chat__header">
        <div className="chat__header-info">
          <span className="chat__title">Asistente CDMX</span>
          {esDemo && <span className="chat__badge chat__badge--demo">DEMO</span>}
          {!esDemo && <span className="chat__badge chat__badge--live">n8n RAG</span>}
        </div>
        <button className="chat__btn-volver" onClick={onVolver}>← Volver</button>
      </div>

      <div className="chat__messages">
        {mensajes.map((m) => (
          <div key={m.id} className={`chat__msg chat__msg--${m.rol}`}>
            <div className="chat__bubble">{renderTexto(m.texto)}</div>
          </div>
        ))}
        {cargando && (
          <div className="chat__msg chat__msg--asistente">
            <div className="chat__bubble chat__bubble--typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form className="chat__input-row" onSubmit={enviar}>
        <input
          ref={inputRef}
          className="chat__input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta..."
          disabled={cargando}
        />
        <button className="chat__btn-enviar" type="submit" disabled={!input.trim() || cargando}>
          Enviar
        </button>
      </form>
    </div>
  );
}
