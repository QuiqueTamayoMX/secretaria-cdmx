import './StepIntermedio.css';

export default function StepIntermedio({ negocio, onContinuar, onAgregarOtro }) {
  const { address, tipoNombre, huffResult } = negocio;

  return (
    <div className="si">
      <div className="si__check">✓</div>
      <h2 className="si__titulo">Análisis completado</h2>

      <div className="si__resumen">
        <div className="si__resumen-row">
          <span className="si__resumen-label">Ubicación</span>
          <span className="si__resumen-valor">{address || 'Sin dirección'}</span>
        </div>
        <div className="si__resumen-row">
          <span className="si__resumen-label">Tipo de negocio</span>
          <span className="si__resumen-valor">{tipoNombre || '-'}</span>
        </div>
        {huffResult && (
          <div className="si__resumen-row">
            <span className="si__resumen-label">Cuota de mercado (Huff)</span>
            <span className="si__resumen-valor" style={{ color: huffResult.color, fontWeight: 700 }}>
              {huffResult.cuotaMercado}% · {huffResult.interpretacion}
            </span>
          </div>
        )}
      </div>

      <p className="si__pregunta">¿Qué deseas hacer?</p>

      <div className="si__acciones">
        <button className="si__btn si__btn--principal" onClick={onContinuar}>
          Continuar con el registro →
        </button>
        <button className="si__btn si__btn--secundario" onClick={onAgregarOtro}>
          + Agregar otro local para comparar
        </button>
      </div>
    </div>
  );
}
