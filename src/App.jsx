import { useState } from 'react';
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import Localizacion from './components/Localizacion/Localizacion.jsx';
import StepIntermedio from './components/StepIntermedio/StepIntermedio.jsx';
import Login from './components/Login/Login.jsx';
import Selecciona from './components/Selecciona/Selecciona.jsx';
import Chatbot from './components/Chatbot/Chatbot.jsx';
import Comparador from './components/Comparador/Comparador.jsx';
import './styles/variables.css';
import './App.css';

const PASOS_STEPPER = ['Localización', 'Registro', 'Selecciona'];
const RUTAS_STEPPER = ['/localizacion', '/intermedio', '/login', '/selecciona'];

function rutaAIndice(pathname) {
  if (pathname === '/localizacion' || pathname === '/intermedio') return 1;
  if (pathname === '/login') return 2;
  return 3;
}

function AppInner() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [usuario, setUsuario]             = useState(null);
  const [negocioActual, setNegocioActual] = useState(null);
  const [negocios, setNegocios]           = useState([]);
  const [modoAgregar, setModoAgregar]     = useState(false);

  // ── Localización completada ──
  function handleLocalizacion(data) {
    const neg = { id: Date.now(), ...data };
    setNegocioActual(neg);
    if (modoAgregar) {
      setNegocios((prev) => [...prev, neg]);
      setModoAgregar(false);
      navigate('/comparador');
    } else {
      navigate('/intermedio');
    }
  }

  // ── Intermedio: continuar ──
  function handleIntermedioContinuar() {
    navigate(usuario ? '/selecciona' : '/login');
  }

  // ── Intermedio: agregar otro local ──
  function handleIntermedioAgregarOtro() {
    if (negocioActual) setNegocios((prev) => [...prev, negocioActual]);
    setNegocioActual(null);
    navigate('/localizacion');
  }

  // ── Login completado ──
  function handleLogin(userData) {
    setUsuario(userData);
    navigate('/selecciona');
  }

  // ── Selecciona → Asistente ──
  function handleIrChatbot() {
    if (negocioActual && !negocios.find((n) => n.id === negocioActual.id)) {
      setNegocios((prev) => [...prev, negocioActual]);
    }
    navigate('/asistente');
  }

  // ── Selecciona → Comparador ──
  function handleIrComparador() {
    if (negocioActual && !negocios.find((n) => n.id === negocioActual.id)) {
      setNegocios((prev) => [...prev, negocioActual]);
    }
    navigate('/comparador');
  }

  // ── Comparador: agregar nuevo local ──
  function handleComparadorAgregar() {
    setModoAgregar(true);
    setNegocioActual(null);
    navigate('/localizacion');
  }

  // ── Comparador CRUD ──
  function handleEliminar(id) {
    setNegocios((prev) => prev.filter((n) => n.id !== id));
  }

  function handleEditar(id, cambios) {
    setNegocios((prev) => prev.map((n) => (n.id === id ? { ...n, ...cambios } : n)));
  }

  const showStepper = RUTAS_STEPPER.includes(pathname);
  const showFooter  = pathname !== '/asistente';
  const stepActivo  = rutaAIndice(pathname);

  return (
    <div className="app">
      <header className="navbar">
        <div className="navbar__inner">
          <span className="navbar__logo-text">SecretarIA CDMX</span>
          {usuario
            ? <span className="navbar__user">{usuario.nombre.split(' ')[0]}</span>
            : <span className="navbar__tagline">Viabilidad de negocios · SEDECO</span>
          }
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

        <section className="modulo modulo--animado" key={pathname}>
          <Routes>
            <Route path="/" element={<Navigate to="/localizacion" replace />} />

            <Route
              path="/localizacion"
              element={<Localizacion onContinuar={handleLocalizacion} negocioExistente={null} />}
            />

            <Route
              path="/intermedio"
              element={
                negocioActual
                  ? <StepIntermedio
                      negocio={negocioActual}
                      onContinuar={handleIntermedioContinuar}
                      onAgregarOtro={handleIntermedioAgregarOtro}
                    />
                  : <Navigate to="/localizacion" replace />
              }
            />

            <Route
              path="/login"
              element={<Login onLogin={handleLogin} />}
            />

            <Route
              path="/selecciona"
              element={
                usuario
                  ? <Selecciona
                      usuario={usuario}
                      negocios={negocios}
                      onChatbot={handleIrChatbot}
                      onComparador={handleIrComparador}
                    />
                  : <Navigate to="/login" replace />
              }
            />

            <Route
              path="/asistente"
              element={
                usuario
                  ? <Chatbot
                      negocio={negocioActual}
                      usuario={usuario}
                      onVolver={() => navigate('/selecciona')}
                    />
                  : <Navigate to="/login" replace />
              }
            />

            <Route
              path="/comparador"
              element={
                usuario
                  ? <Comparador
                      negocios={negocios}
                      usuario={usuario}
                      onAgregar={handleComparadorAgregar}
                      onEliminar={handleEliminar}
                      onEditar={handleEditar}
                      onVolver={() => navigate('/selecciona')}
                    />
                  : <Navigate to="/login" replace />
              }
            />

            <Route path="*" element={<Navigate to="/localizacion" replace />} />
          </Routes>
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

export default function App() {
  return (
    <HashRouter>
      <AppInner />
    </HashRouter>
  );
}
