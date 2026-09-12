import { useEffect, useRef, useState } from 'react';
import { panelShell, buttonPrimary, buttonSecondary, fieldStyle, labelStyle } from '../adminStyles';
import { dayLabel } from '../../../utils/dateUtils';

const hasBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;

export default function CheckinTab({ state, actions }) {
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const detectorRef = useRef(null);

  useEffect(() => {
    if (!cameraOn) return undefined;
    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        if (hasBarcodeDetector) {
          // eslint-disable-next-line no-undef
          detectorRef.current = new BarcodeDetector({ formats: ['qr_code'] });
          const tick = async () => {
            if (cancelled || !videoRef.current) return;
            try {
              const codes = await detectorRef.current.detect(videoRef.current);
              if (codes.length > 0) {
                actions.lookupCheckinByScan(codes[0].rawValue);
                setCameraOn(false);
                return;
              }
            } catch { /* frame no decodificable, se reintenta */ }
            rafRef.current = requestAnimationFrame(tick);
          };
          rafRef.current = requestAnimationFrame(tick);
        }
      } catch {
        setCameraError('No se pudo activar la cámara. Usa el código manual.');
        setCameraOn(false);
      }
    })();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [cameraOn, actions]);

  const result = state.checkinResult;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
      <div style={panelShell}>
        <div style={{ fontWeight: 800, fontSize: 16.5, color: '#0f172a', marginBottom: 4 }}>Escanear una reserva</div>
        <p style={{ margin: '0 0 16px', fontSize: 12.5, color: '#94a3b8' }}>El QR contiene únicamente el enlace de verificación.</p>

        {cameraOn ? (
          <div style={{ borderRadius: 14, overflow: 'hidden', background: '#0f172a', marginBottom: 12 }}>
            <video ref={videoRef} muted playsInline style={{ width: '100%', display: 'block' }} />
          </div>
        ) : (
          <button onClick={() => { setCameraError(''); setCameraOn(true); }} style={{ ...buttonSecondary, width: '100%', marginBottom: 16 }}>
            📷 Activar cámara
          </button>
        )}
        {cameraOn && (
          <button onClick={() => setCameraOn(false)} style={{ ...buttonSecondary, width: '100%', marginBottom: 16 }}>Detener cámara</button>
        )}
        {!hasBarcodeDetector && !cameraError && (
          <p style={{ fontSize: 11.5, color: '#94a3b8', marginBottom: 16 }}>Tu navegador no soporta lectura automática de QR — usa el código manual.</p>
        )}
        {cameraError && <p style={{ fontSize: 11.5, color: '#e11d48', marginBottom: 16 }}>{cameraError}</p>}

        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16 }}>
          <label style={labelStyle}>o ingresa el código</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={state.checkinCode}
              onChange={(e) => actions.setCheckinCode(e.target.value)}
              placeholder="EMUSS-XXXX"
              style={{ ...fieldStyle, flex: 1 }}
              onKeyDown={(e) => e.key === 'Enter' && actions.lookupCheckinByCode(state.checkinCode)}
            />
            <button onClick={() => actions.lookupCheckinByCode(state.checkinCode)} style={buttonPrimary}>Buscar</button>
          </div>
        </div>
      </div>

      <div style={panelShell}>
        {state.checkinStatus === 'loading' && <div style={{ fontSize: 13, color: '#64748b' }}>Buscando…</div>}
        {state.checkinStatus === 'not_found' && (
          <div style={{ fontSize: 13, color: '#e11d48', fontWeight: 600 }}>No encontramos una reserva con ese código o QR.</div>
        )}
        {state.checkinStatus === 'idle' && (
          <div style={{ fontSize: 13, color: '#94a3b8' }}>Escanea el QR o busca un código para ver los datos y confirmar el ingreso.</div>
        )}
        {result && (state.checkinStatus === 'found') && (
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a', marginBottom: 14 }}>
              {result.estado === 'cancelada' ? '🚫 Reserva cancelada' : '✅ Reserva válida'}
            </div>
            <div style={{ display: 'grid', gap: 8, fontSize: 14, color: '#334155', marginBottom: 18 }}>
              <div><span style={{ color: '#94a3b8' }}>Nombre: </span><strong>{result.nombre}</strong></div>
              <div><span style={{ color: '#94a3b8' }}>Sede: </span><strong>{result.sedeName}</strong></div>
              <div><span style={{ color: '#94a3b8' }}>Fecha: </span><strong>{dayLabel(result.fecha)}</strong></div>
              <div><span style={{ color: '#94a3b8' }}>Horario: </span><strong>{result.time}</strong></div>
            </div>
            {result.estado === 'confirmada' && (
              result.checkedIn ? (
                <div style={{ background: '#ecfdf5', color: '#047857', borderRadius: 10, padding: '10px 14px', fontWeight: 700, fontSize: 13 }}>Check-in ya registrado ✓</div>
              ) : (
                <button onClick={actions.confirmCheckin} style={{ ...buttonPrimary, width: '100%' }}>Confirmar ingreso</button>
              )
            )}
            <button onClick={actions.resetCheckin} style={{ ...buttonSecondary, width: '100%', marginTop: 10 }}>Buscar otra</button>
          </div>
        )}
      </div>
    </div>
  );
}
