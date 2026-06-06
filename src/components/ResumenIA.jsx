import { useState, useRef } from 'react';
import { generarResumen } from '../services/claudeApi.js';
import './ResumenIA.css';

export default function ResumenIA({ giro, colonia, tipoPersona, tramites, ruta, impacto, analisisComercial }) {
  const [texto, setTexto] = useState('');
  const [cargando, setCargando] = useState(false);
  const [iniciado, setIniciado] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const textoRef = useRef('');

  async function handleGenerar() {
    setTexto('');
    textoRef.current = '';
    setCargando(true);
    setIniciado(true);

    const todosLosTramites = [...(tramites?.fase1 ?? []), ...(tramites?.fase2 ?? [])];
    await generarResumen(giro.nombre, colonia || 'CDMX', tipoPersona, todosLosTramites, (chunk) => {
      textoRef.current += chunk;
      setTexto(textoRef.current);
    }, ruta, impacto, analisisComercial);

    setCargando(false);
  }

  async function handleCopiar() {
    try {
      await navigator.clipboard.writeText(textoRef.current);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // clipboard not available
    }
  }

  return (
    <section className="resumen-ia">
      <h2 className="resumen-ia__titulo">Resumen personalizado</h2>
      <p className="resumen-ia__subtitulo">
        Genera un resumen con consejos específicos para tu negocio, basado en la normatividad de la CDMX.
      </p>

      {!iniciado && (
        <button className="btn-primary" onClick={handleGenerar}>
          Generar resumen con IA
        </button>
      )}

      {iniciado && (
        <div className="resumen-ia__output">
          <div className="resumen-ia__texto" aria-live="polite" aria-atomic="false">
            {texto}
            {cargando && <span className="cursor-parpadeante" aria-hidden="true">▍</span>}
          </div>

          {!cargando && texto && (
            <div className="resumen-ia__acciones">
              <button className="btn-secundario" onClick={handleCopiar}>
                {copiado ? '✓ Copiado' : 'Copiar resumen'}
              </button>
              <button className="btn-secundario" onClick={handleGenerar}>
                Regenerar
              </button>
            </div>
          )}
        </div>
      )}

      <p className="disclaimer">
        Esta herramienta es de orientación general. Verifica los requisitos específicos en las
        dependencias oficiales antes de iniciar tu trámite.
      </p>
    </section>
  );
}
