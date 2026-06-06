import { useState } from 'react';
import { generarPDFComparador } from '../../services/pdfService.js';
import mockData from '../../data/mock-tramites.json';
import './Comparador.css';

export default function Comparador({ negocios, usuario, onAgregar, onEliminar, onEditar, onVolver }) {
  const [editandoId, setEditandoId] = useState(null);
  const [nuevoTipo, setNuevoTipo]   = useState('');

  function iniciarEdicion(neg) {
    setEditandoId(neg.id);
    setNuevoTipo(neg.tipo);
  }

  function guardarEdicion(neg) {
    const giro = mockData.giros.find((g) => g.id === nuevoTipo);
    onEditar(neg.id, { tipo: nuevoTipo, tipoNombre: giro?.nombre || nuevoTipo });
    setEditandoId(null);
  }

  function getVerdad(neg) {
    const score = neg.huffResult?.score ?? 50;
    if (score >= 60) return { label: 'Favorable', clase: 'comp__vereda--verde' };
    if (score >= 40) return { label: 'Moderada',  clase: 'comp__vereda--amarillo' };
    return              { label: 'Difícil',   clase: 'comp__vereda--rojo' };
  }

  return (
    <div className="comp">
      <div className="comp__header">
        <div>
          <h2 className="comp__titulo">Comparador de locales</h2>
          <p className="comp__subtitulo">{negocios.length} local{negocios.length !== 1 ? 'es' : ''} · máx. 5</p>
        </div>
        <div className="comp__header-actions">
          {negocios.length < 5 && (
            <button className="comp__btn comp__btn--agregar" onClick={onAgregar}>
              + Agregar local
            </button>
          )}
          <button className="comp__btn comp__btn--volver" onClick={onVolver}>
            ← Volver
          </button>
        </div>
      </div>

      {negocios.length === 0 ? (
        <div className="comp__empty">
          <p>No hay locales agregados todavía.</p>
          <button className="btn-primary" onClick={onAgregar}>+ Agregar primer local</button>
        </div>
      ) : (
        <div className="comp__tabla-wrap">
          <table className="comp__tabla">
            <thead>
              <tr>
                <th>Local</th>
                <th>Tipo de negocio</th>
                <th>Huff</th>
                <th>Viabilidad</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {negocios.map((neg, i) => {
                const vd = getVerdad(neg);
                return (
                  <tr key={neg.id}>
                    <td className="comp__td-local">
                      <span className="comp__local-num">L{i + 1}</span>
                      <span className="comp__local-addr">{neg.nombre || neg.address?.split(',')[0] || 'Sin nombre'}</span>
                    </td>

                    <td>
                      {editandoId === neg.id ? (
                        <select
                          className="comp__select"
                          value={nuevoTipo}
                          onChange={(e) => setNuevoTipo(e.target.value)}
                        >
                          {mockData.giros.map((g) => (
                            <option key={g.id} value={g.id}>{g.nombre}</option>
                          ))}
                        </select>
                      ) : (
                        neg.tipoNombre || neg.tipo || '-'
                      )}
                    </td>

                    <td>
                      <span className="comp__score" style={{ color: neg.huffResult?.color }}>
                        {neg.huffResult ? `${neg.huffResult.cuotaMercado}%` : '-'}
                      </span>
                    </td>

                    <td>
                      <span className={`comp__vereda ${vd.clase}`}>{vd.label}</span>
                    </td>

                    <td className="comp__td-acciones">
                      {editandoId === neg.id ? (
                        <>
                          <button className="comp__ico-btn" title="Guardar" onClick={() => guardarEdicion(neg)}>✓</button>
                          <button className="comp__ico-btn" title="Cancelar" onClick={() => setEditandoId(null)}>✕</button>
                        </>
                      ) : (
                        <>
                          <button className="comp__ico-btn" title="Editar tipo" onClick={() => iniciarEdicion(neg)}>✏️</button>
                          <button className="comp__ico-btn comp__ico-btn--delete" title="Eliminar" onClick={() => onEliminar(neg.id)}>🗑️</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {negocios.length > 0 && (
        <div className="comp__footer">
          <button
            className="comp__btn comp__btn--pdf"
            onClick={() => generarPDFComparador(negocios, usuario)}
          >
            Descargar PDF
          </button>
        </div>
      )}
    </div>
  );
}
