import jsPDF from 'jspdf';

const GUINDA = [157, 33, 72];
const DORADO = [178, 142, 92];
const GRIS   = [85, 88, 90];

export function generarPDFComparador(negocios, usuario) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = 210;

  // ── Header ──
  doc.setFillColor(...GUINDA);
  doc.rect(0, 0, W, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('SecretarIA CDMX — Reporte Comparativo de Locales', 14, 11);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Análisis de viabilidad · Hackathon SEDECO 2026', 14, 18);

  // ── Metadata ──
  let y = 32;
  doc.setTextColor(...GRIS);
  doc.setFontSize(9);
  const fecha = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`Fecha de generación: ${fecha}`, 14, y);
  if (usuario) {
    doc.text(`Solicitante: ${usuario.nombre}   ·   ${usuario.correo}`, 14, y + 5);
    y += 5;
  }

  // ── Section title ──
  y += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...GUINDA);
  doc.text('Locales analizados', 14, y);

  // ── Table header ──
  y += 5;
  doc.setFillColor(240, 240, 240);
  doc.rect(14, y, W - 28, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...GRIS);
  const cols = [14, 65, 125, 160];
  const headers = ['Local / Dirección', 'Tipo de negocio', 'Huff (%)', 'Viabilidad'];
  headers.forEach((h, i) => doc.text(h, cols[i] + 1, y + 4.8));

  // ── Table rows ──
  y += 7;
  negocios.forEach((neg, i) => {
    const rowH = 9;
    const bg = i % 2 === 0 ? [255, 255, 255] : [249, 249, 249];
    doc.setFillColor(...bg);
    doc.rect(14, y, W - 28, rowH, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...GRIS);

    const nombre = (neg.nombre || `Local ${i + 1}`).substring(0, 22);
    const tipo = (neg.tipoNombre || neg.tipo || '-').substring(0, 18);
    const huff = neg.huffResult ? `${neg.huffResult.cuotaMercado}%` : '-';

    doc.text(nombre, cols[0] + 1, y + 6);
    doc.text(tipo,   cols[1] + 1, y + 6);
    doc.text(huff,   cols[2] + 1, y + 6);

    const rec = getEtiquetaViabilidad(neg);
    doc.setTextColor(...rec.rgb);
    doc.setFont('helvetica', 'bold');
    doc.text(rec.label, cols[3] + 1, y + 6);

    y += rowH;
  });

  // ── Notes ──
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(130, 130, 130);
  doc.text('Metodología: Modelo de Huff (1964) para estimación de cuota de mercado por área de influencia.', 14, y);
  doc.text('Fuentes de referencia: INEGI-DENUE, Google Routes API, SEDUVI. Datos orientativos, no vinculantes.', 14, y + 4);

  // ── Footer line ──
  doc.setDrawColor(...GUINDA);
  doc.setLineWidth(0.5);
  doc.line(14, 285, W - 14, 285);
  doc.setFontSize(7);
  doc.setTextColor(...GRIS);
  const footerContacto = usuario?.correo ? `SecretarIA CDMX · ${usuario.correo}` : 'SecretarIA CDMX';
  doc.text(footerContacto, 14, 290);

  doc.save('reporte-comparativo-secretarIA.pdf');
}

function getEtiquetaViabilidad(neg) {
  const score = neg.huffResult?.score ?? 50;
  if (score >= 60) return { label: 'Favorable', rgb: [46, 125, 50] };
  if (score >= 40) return { label: 'Moderada',  rgb: [230, 81, 0]  };
  return             { label: 'Difícil',   rgb: [198, 40, 40]  };
}
