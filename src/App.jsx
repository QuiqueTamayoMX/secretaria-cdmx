import { useState } from 'react';
import Localizacion from './components/Localizacion/Localizacion.jsx';
import StepIntermedio from './components/StepIntermedio/StepIntermedio.jsx';
import Login from './components/Login/Login.jsx';
import Selecciona from './components/Selecciona/Selecciona.jsx';
import Chatbot from './components/Chatbot/Chatbot.jsx';
import Comparador from './components/Comparador/Comparador.jsx';
import './styles/variables.css';
import './App.css';

// Mapea el paso actual al índice del stepper (1, 2 o 3)
function pasoAIndice(paso) {
  if (paso === 'localizacion' || paso === 'intermedio') return 1;
  if (paso === 'login') return 2;
  return 3;
}

const PASOS_STEPPER = ['Localización', 'Registro', 'Selecciona'];

export default function App() {
  const [paso, setPaso]               = useState('localizacion');
  const [usuario, setUsuario]         = useState(null);
  const [negocioActual, setNegocioActual] = useState(null);
  const [negocios, setNegocios]       = useState([]);
  const [modoAgregar, setModoAgregar] = useState(false);

  // ── Localización completada ──
  function handleLocalizacion(data) {
    const neg = { id: Date.now(), ...data };
    setNegocioActual(neg);

    if (modoAgregar) {
      setNegocios((prev) => [...prev, neg]);
      setModoAgregar(false);
      setPaso('comparador');
    } else {
      setPaso('intermedio');
    }
  }

  // ── Intermedio: continuar al registro (o a Selecciona si ya hay sesión) ──
  function handleIntermedioContinuar() {
    setPaso(usuario ? 'selecciona' : 'login');
  }

  // ── Intermedio: agregar otro local (guarda el actual y vuelve al inicio) ──
  function handleIntermedioAgregarOtro() {
    if (negocioActual) {
      setNegocios((prev) => [...prev, negocioActual]);
    }
    setNegocioActual(null);
    setPaso('localizacion');
  }

  // ── Login completado ──
  function handleLogin(userData) {
    setUsuario(userData);
    setPaso('selecciona');
  }

  // ── Selecciona: ir al chatbot ──
  function handleIrChatbot() {
    if (negocioActual && !negocios.find((n) => n.id === negocioActual.id)) {
      setNegocios((prev) => [...prev, negocioActual]);
    }
    setPaso('chatbot');
  }

  // ── Selecciona: ir al comparador ──
  function handleIrComparador() {
    if (negocioActual && !negocios.find((n) => n.id === negocioActual.id)) {
      setNegocios((prev) => [...prev, negocioActual]);
    }
    setPaso('comparador');
  }

  // ── Comparador: agregar nuevo local ──
  function handleComparadorAgregar() {
    setModoAgregar(true);
    setNegocioActual(null);
    setPaso('localizacion');
  }

  // ── Comparador CRUD ──
  function handleEliminar(id) {
    setNegocios((prev) => prev.filter((n) => n.id !== id));
  }

  function handleEditar(id, cambios) {
    setNegocios((prev) => prev.map((n) => (n.id === id ? { ...n, ...cambios } : n)));
  }

  const stepActivo = pasoAIndice(paso);

  const showNavbar  = true;
  const showStepper = paso !== 'chatbot' && paso !== 'comparador';
  const showFooter  = paso !== 'chatbot';

  return (
    <div className="app">
      <header className="navbar">
        <div className="navbar__inner">
          <span className="navbar__logo-text">SecretarIA CDMX</span>
          {usuario && (
            <span className="navbar__user">
              {usuario.nombre.split(' ')[0]}
            </span>
          )}
          {!usuario && <span className="navbar__tagline">Viabilidad de negocios · SEDECO</span>}
        </div>
      </header>

      <main className="main-content">
        {showStepper && (
          <div className="stepper" aria-label="Progreso">
            {PASOS_STEPPER.map((label, i) => (
              <div
                key={i}
                className={`stepper__item ${stepActivo >= i + 1 ? 'stepper__item--activo' : ''}`}
              >
                <div className="stepper__circulo">{i + 1}</div>
                <span className="stepper__label">{label}</span>
              </div>
            ))}
          </div>
        )}

        <section className="modulo modulo--animado" key={paso}>
          {paso === 'localizacion' && (
            <Localizacion
              onContinuar={handleLocalizacion}
              negocioExistente={null}
            />
          )}

          {paso === 'intermedio' && negocioActual && (
            <StepIntermedio
              negocio={negocioActual}
              onContinuar={handleIntermedioContinuar}
              onAgregarOtro={handleIntermedioAgregarOtro}
            />
          )}

          {paso === 'login' && (
            <Login onLogin={handleLogin} />
          )}

          {paso === 'selecciona' && (
            <Selecciona
              usuario={usuario}
              negocios={negocios}
              onChatbot={handleIrChatbot}
              onComparador={handleIrComparador}
            />
          )}

          {paso === 'chatbot' && (
            <Chatbot
              negocio={negocioActual}
              usuario={usuario}
              onVolver={() => setPaso('selecciona')}
            />
          )}

          {paso === 'comparador' && (
            <Comparador
              negocios={negocios}
              usuario={usuario}
              onAgregar={handleComparadorAgregar}
              onEliminar={handleEliminar}
              onEditar={handleEditar}
              onVolver={() => setPaso('selecciona')}
            />
          )}
        </section>
      </main>

      {showFooter && (
        <footer className="footer">
          <p>Datos orientativos · Hackathon SEDECO 2026 · Ciudad de México</p>
          <p>
            Modelo de Huff (1964) ·{' '}
            <a href="https://siapem.cdmx.gob.mx/" target="_blank" rel="noopener noreferrer">SIAPEM</a>
            {' · '}
            <a href="https://www.inegi.org.mx/app/mapa/denue/" target="_blank" rel="noopener noreferrer">DENUE-INEGI</a>
          </p>
        </footer>
      )}
    </div>
  );
}
