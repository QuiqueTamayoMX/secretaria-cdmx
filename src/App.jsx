import { useState, useMemo } from 'react';
import DiagnosticoForm from './components/DiagnosticoForm.jsx';
import AnalisisComercial from './components/AnalisisComercial.jsx';
import RutaTramites from './components/RutaTramites.jsx';
import ResumenIA from './components/ResumenIA.jsx';
import { calcularViabilidadComercial } from './services/analisisComercial.js';
import './styles/variables.css';
import './App.css';

export default function App() {
  const [diagnostico, setDiagnostico] = useState(null);
  const [paso, setPaso] = useState(1);

  function handleDiagnostico(resultado) {
    setDiagnostico(resultado);
    setPaso(2);
    setTimeout(() => {
      document.getElementById('modulo-comercial')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  function handleVerTramites() {
    setPaso(3);
    setTimeout(() => {
      document.getElementById('modulo-tramites')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  function handleVerResumen() {
    setPaso(4);
    setTimeout(() => {
      document.getElementById('modulo-resumen')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  function handleReiniciar() {
    setDiagnostico(null);
    setPaso(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const analisisComercial = useMemo(() =>
    diagnostico ? calcularViabilidadComercial(diagnostico.colonia, diagnostico.giro?.id) : null,
    [diagnostico]
  );

  const PASOS = ['Diagnóstico', 'Mercado', 'Trámites', 'Resumen IA'];

  return (
    <div className="app">
      <header className="navbar">
        <div className="navbar__inner">
          <div className="navbar__logo">
            <span className="navbar__logo-text">SecretarIA CDMX</span>
          </div>
          <span className="navbar__tagline">Viabilidad de negocios · SEDECO</span>
        </div>
      </header>

      <main className="main-content">
        <div className="hero">
          <h1 className="hero__titulo">¿Es viable tu negocio en la CDMX?</h1>
          <p className="hero__subtitulo">
            Analiza la viabilidad comercial y legal de tu giro: competidores, nivel socioeconómico,
            uso de suelo y trámites de apertura en un solo lugar.
          </p>
        </div>

        <div className="stepper" aria-label="Progreso">
          {PASOS.map((label, i) => (
            <div key={i} className={`stepper__item ${paso >= i + 1 ? 'stepper__item--activo' : ''}`}>
              <div className="stepper__circulo">{i + 1}</div>
              <span className="stepper__label">{label}</span>
            </div>
          ))}
        </div>

        {/* MÓDULO 1: Diagnóstico */}
        <section id="modulo-diagnostico" className="modulo">
          <DiagnosticoForm onDiagnostico={handleDiagnostico} />
        </section>

        {/* MÓDULO 2: Análisis Comercial */}
        {paso >= 2 && diagnostico && (
          <section id="modulo-comercial" className="modulo modulo--animado">
            <AnalisisComercial
              giro={diagnostico.giro}
              colonia={diagnostico.colonia}
            />
            {paso === 2 && (
              <div className="modulo__accion">
                <button className="btn-continuar" onClick={handleVerTramites}>
                  Ver ruta de trámites →
                </button>
              </div>
            )}
          </section>
        )}

        {/* MÓDULO 3: Ruta de trámites */}
        {paso >= 3 && diagnostico && (
          <section id="modulo-tramites" className="modulo modulo--animado">
            <RutaTramites
              fase1={diagnostico.fase1}
              fase2={diagnostico.fase2}
              impacto={diagnostico.impacto}
              ruta={diagnostico.ruta}
              giro={diagnostico.giro}
              tipoPersona={diagnostico.tipoPersona}
              nivelAlcohol={diagnostico.nivelAlcohol}
            />
            {paso === 3 && (
              <div className="modulo__accion">
                <button className="btn-continuar" onClick={handleVerResumen}>
                  Ver resumen con IA →
                </button>
              </div>
            )}
          </section>
        )}

        {/* MÓDULO 4: Resumen IA */}
        {paso >= 4 && diagnostico && (
          <section id="modulo-resumen" className="modulo modulo--animado">
            <ResumenIA
              giro={diagnostico.giro}
              colonia={diagnostico.colonia}
              tipoPersona={diagnostico.tipoPersona}
              tramites={{ fase1: diagnostico.fase1, fase2: diagnostico.fase2 }}
              ruta={diagnostico.ruta}
              impacto={diagnostico.impacto}
              analisisComercial={analisisComercial}
            />
            <div className="modulo__accion">
              <button className="btn-outline" onClick={handleReiniciar}>
                ← Nuevo diagnóstico
              </button>
            </div>
          </section>
        )}
      </main>

      <footer className="footer">
        <p>Herramienta orientativa · Hackathon SEDECO 2026 · Ciudad de México</p>
        <p>
          Fuentes:{' '}
          <a href="https://siapem.cdmx.gob.mx/" target="_blank" rel="noopener noreferrer">SIAPEM</a>
          {' · '}
          <a href="https://www.registrodetramitesyservicios.cdmx.gob.mx/" target="_blank" rel="noopener noreferrer">RETYS</a>
          {' · '}
          <a href="http://ciudadmx.cdmx.gob.mx:8080/seduvi/" target="_blank" rel="noopener noreferrer">SEDUVI</a>
          {' · '}
          <a href="https://www.inegi.org.mx/app/mapa/denue/" target="_blank" rel="noopener noreferrer">DENUE-INEGI</a>
        </p>
      </footer>
    </div>
  );
}
