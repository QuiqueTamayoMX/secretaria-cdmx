import './StatusBadge.css';

export default function StatusBadge({ status }) {
  const config = {
    viable: {
      label: 'Viable',
      description: 'Tu giro es compatible con el uso de suelo de esta zona.',
      icon: '✓',
    },
    verificacion: {
      label: 'Requiere verificación',
      description: 'Es posible operar en esta zona, pero debes confirmar el uso de suelo con SEDUVI.',
      icon: '!',
    },
    incompatible: {
      label: 'No compatible',
      description: 'Este giro no es compatible con el uso de suelo registrado para esta zona.',
      icon: '✗',
    },
  };

  const { label, description, icon } = config[status] || config.verificacion;

  return (
    <div className={`status-badge status-badge--${status}`} role="status" aria-live="polite">
      <span className="status-badge__icon" aria-hidden="true">{icon}</span>
      <div className="status-badge__content">
        <strong className="status-badge__label">{label}</strong>
        <p className="status-badge__description">{description}</p>
      </div>
    </div>
  );
}
