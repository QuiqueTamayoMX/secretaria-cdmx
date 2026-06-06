import { useState } from 'react';
import './Login.css';

// Validación superficial de formato CURP (18 caracteres alfanuméricos)
function validarCURP(curp) {
  return /^[A-Z]{4}\d{6}[HM][A-Z]{2}[A-Z0-9]{3}\d{2}$/i.test(curp.trim());
}

export default function Login({ onLogin }) {
  const [nombre, setNombre] = useState('');
  const [curp, setCurp]     = useState('');
  const [correo, setCorreo] = useState('');
  const [errores, setErrores] = useState({});

  function handleSubmit(e) {
    e.preventDefault();
    const err = {};
    if (!nombre.trim()) err.nombre = 'El nombre es obligatorio.';
    if (!validarCURP(curp)) err.curp = 'CURP inválida. Formato: AAAA######XAAAXXX##';
    if (!correo.includes('@')) err.correo = 'Correo electrónico inválido.';
    if (Object.keys(err).length) { setErrores(err); return; }
    setErrores({});
    onLogin({ nombre: nombre.trim(), curp: curp.toUpperCase().trim(), correo: correo.trim() });
  }

  return (
    <div className="login">
      <h2 className="login__titulo">Registro de usuario</h2>
      <p className="login__subtitulo">
        Tus datos se usan solo para personalizar el reporte. No se envían a ningún servidor por ahora.
      </p>

      <form className="login__form" onSubmit={handleSubmit} noValidate>
        <div className="login__field">
          <label className="login__label" htmlFor="nombre">Nombre completo</label>
          <input
            id="nombre"
            className={`login__input ${errores.nombre ? 'login__input--error' : ''}`}
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. María García López"
            autoComplete="name"
          />
          {errores.nombre && <span className="login__error-msg">{errores.nombre}</span>}
        </div>

        <div className="login__field">
          <label className="login__label" htmlFor="curp">CURP</label>
          <input
            id="curp"
            className={`login__input ${errores.curp ? 'login__input--error' : ''}`}
            type="text"
            value={curp}
            onChange={(e) => setCurp(e.target.value.toUpperCase())}
            placeholder="GARM850101HDFRZR01"
            maxLength={18}
            autoComplete="off"
          />
          {errores.curp && <span className="login__error-msg">{errores.curp}</span>}
        </div>

        <div className="login__field">
          <label className="login__label" htmlFor="correo">Correo electrónico</label>
          <input
            id="correo"
            className={`login__input ${errores.correo ? 'login__input--error' : ''}`}
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="ejemplo@correo.com"
            autoComplete="email"
          />
          {errores.correo && <span className="login__error-msg">{errores.correo}</span>}
        </div>

        <button className="btn-primary login__submit" type="submit">
          Continuar →
        </button>
      </form>
    </div>
  );
}
