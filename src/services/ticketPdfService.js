import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { paymentMethodLabel } from '../features/public-site/publicSiteSelectors';
import { verifyUrlFor } from './notificationsService';

function accessibilityLines(ticket) {
  const items = [];
  if (ticket.necesitaElevador) items.push('Elevador hidráulico');
  if (ticket.necesitaRampa) items.push('Rampa / silla de ruedas');
  if (ticket.necesitaAsistencia) items.push('Apoyo auditivo o visual');
  if (ticket.vaConCuidador) items.push('Con cuidador/asistente');
  return items;
}

// Genera el ticket como PDF descargable (sirve sin conexión una vez
// descargado) con un QR que el personal de la puerta puede escanear con su
// propia cámara para ver si la reserva es válida — sin instalar nada, el
// QR apunta a la misma página pública de verificación (`?verificar=CODE`).
export async function downloadTicketPdf(ticket, sedeName, dateLabel, slotTime) {
  const qrDataUrl = await QRCode.toDataURL(verifyUrlFor(ticket.verifyToken), { margin: 1, width: 260 });

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 48;
  let y = 64;

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 90, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('EMUSS', marginX, 50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Comprobante de reserva', marginX, 70);

  y = 130;
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(ticket.estado === 'cancelada' ? 'Reserva cancelada' : 'Reserva confirmada', marginX, y);

  y += 30;
  const rows = [
    ['Código', ticket.code],
    ['Nombre', ticket.nombre],
    ['DNI', ticket.dni],
    ['Sede', sedeName],
    ['Fecha', dateLabel],
    ['Horario', slotTime],
    ['Personas', ticket.exclusivo ? 'Carril exclusivo' : String(ticket.personas ?? 1)],
    ...(!ticket.exclusivo && (ticket.acompanantes || []).length ? [['Acompañantes', ticket.acompanantes.join(', ')]] : []),
    ['Método de pago', paymentMethodLabel(ticket.metodoPago)],
    ['Monto', `S/${ticket.precio ?? 0}`],
    ...(ticket.contactoEmergencia ? [['Contacto de emergencia', ticket.contactoEmergencia]] : []),
    ['Estado', ticket.estado === 'cancelada' ? 'Cancelada' : 'Confirmada'],
  ];

  doc.setFontSize(11);
  const contentWidth = pageWidth - marginX * 2 - 170;
  for (const [label, value] of rows) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(label, marginX, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(String(value ?? '—'), marginX + 170, y, { maxWidth: contentWidth });
    y += 22;
  }

  const accessibility = accessibilityLines(ticket);
  if (accessibility.length || ticket.notasAccesibilidad) {
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 128, 61);
    doc.text('Accesibilidad', marginX, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    if (accessibility.length) {
      doc.text(accessibility.join(', '), marginX, y, { maxWidth: pageWidth - marginX * 2 });
      y += 18;
    }
    if (ticket.notasAccesibilidad) {
      doc.text(`Nota: ${ticket.notasAccesibilidad}`, marginX, y, { maxWidth: pageWidth - marginX * 2 });
      y += 18;
    }
  }

  const qrSize = 130;
  const qrX = pageWidth - marginX - qrSize;
  const qrY = 130;
  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Muestra este QR en la puerta', qrX, qrY + qrSize + 16, { maxWidth: qrSize });

  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Este comprobante funciona sin conexión. El personal de la sede puede escanear el QR para validar tu ingreso.',
    marginX, doc.internal.pageSize.getHeight() - 40, { maxWidth: pageWidth - marginX * 2 }
  );

  doc.save(`${ticket.code}.pdf`);
}
