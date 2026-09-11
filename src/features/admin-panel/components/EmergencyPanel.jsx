import { useState } from 'react';
import { SEDES, getSlotTimesForDay } from '../../../services/sedesService';

const fieldStyle = { padding: '9px 12px', borderRadius: 10, border: 'none', fontSize: 12.5, background: 'rgba(255,255,255,0.92)' };

export default function EmergencyPanel({ panicActive, onTogglePanic, session, selectedDate, reservations, holds, onNotifyIncident }) {
  const isSuperAdmin = session?.rol === 'Super Admin';
  const ownSedeId = session?.sedeId || SEDES[0].id;
  const [sedeId, setSedeId] = useState(isSuperAdmin ? SEDES[0].id : ownSedeId);
  const [time, setTime] = useState('');
  const [motivo, setMotivo] = useState('');
  const [result, setResult] = useState(null);
  const [sending, setSending] = useState(false);

  const sede = SEDES.find((s) => s.id === (isSuperAdmin ? sedeId : ownSedeId));
  const times = sede ? getSlotTimesForDay(sede, selectedDate) : [];
  const affectedCount = reservations.filter(
    (r) => r.estado === 'confirmada' && r.sedeId === sede?.id && r.fecha === selectedDate && r.time === (time || times[0])
  ).length;

  const handleNotify = async () => {
    const chosenTime = time || times[0];
    if (!chosenTime) return;
    setSending(true);
    setResult(null);
    const count = await onNotifyIncident(isSuperAdmin ? sedeId : ownSedeId, selectedDate, chosenTime, motivo);
    setSending(false);
    setResult(count);
  };

  return (
    <div style={{ background: 'linear-gradient(135deg,#7f1d1d,#dc2626)', borderRadius: 20, padding: 26, boxShadow: '0 8px 24px rgba(220,38,38,0.25)' }}>
      <div style={{ color: '#fecaca', fontSize: 12.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Emergencia</div>
      <div style={{ color: '#ffffff', fontWeight: 700, fontSize: 14.5, marginBottom: 12, lineHeight: 1.5 }}>
        Modo pánico: suspende TODAS las reservas nuevas en la red EMUSS de inmediato. Las reservas ya confirmadas no se cancelan solas — para eso usa el aviso de incidente de abajo.
      </div>
      <button
        onClick={onTogglePanic}
        style={{
          width: '100%', padding: 13, borderRadius: 12, border: 'none', fontWeight: 800, fontSize: 13.5, cursor: 'pointer', marginBottom: 20,
          background: panicActive ? '#ffffff' : '#0f172a', color: panicActive ? '#7f1d1d' : '#ffffff',
        }}
      >
        {panicActive ? '✅ Reanudar reservas en toda la red' : '🚨 Activar botón de pánico (toda la red)'}
      </button>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.25)', paddingTop: 16 }}>
        <div style={{ color: '#fecaca', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
          Avisar un incidente puntual
        </div>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, margin: '0 0 12px', lineHeight: 1.5 }}>
          Elige la sede y el horario afectado (de la fecha que tienes seleccionada) y avisamos por correo solo a quienes tienen reserva confirmada justo ahí.
        </p>
        <div style={{ display: 'grid', gap: 8, marginBottom: 10 }}>
          {isSuperAdmin && (
            <select value={sedeId} onChange={(e) => { setSedeId(e.target.value); setTime(''); }} style={fieldStyle}>
              {SEDES.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          )}
          <select value={time || times[0] || ''} onChange={(e) => setTime(e.target.value)} style={fieldStyle}>
            {times.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="text" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo (ej. corte de agua)" style={fieldStyle} />
        </div>
        <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 11.5, marginBottom: 10 }}>
          {affectedCount} reserva(s) confirmada(s) en ese horario.
        </div>
        <button
          onClick={handleNotify}
          disabled={sending || affectedCount === 0}
          style={{
            width: '100%', padding: 12, borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.5)', fontWeight: 700, fontSize: 13,
            cursor: sending || affectedCount === 0 ? 'default' : 'pointer', background: 'rgba(255,255,255,0.12)', color: '#ffffff',
            opacity: affectedCount === 0 ? 0.6 : 1,
          }}
        >
          {sending ? 'Enviando…' : '📧 Avisar por correo a los afectados'}
        </button>
        {result !== null && (
          <div style={{ marginTop: 10, color: '#ffffff', fontSize: 12, fontWeight: 700 }}>
            ✅ Aviso enviado a {result} reserva(s).
          </div>
        )}
      </div>
    </div>
  );
}
