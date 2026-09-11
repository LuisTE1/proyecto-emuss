export default function GlobalErrorBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div
      style={{
        position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 200,
        maxWidth: 'min(560px, 92vw)', width: '100%', background: '#fff1f2', border: '1.5px solid #fecdd3',
        color: '#9f1239', borderRadius: 14, padding: '14px 18px', boxShadow: '0 12px 32px rgba(2,6,23,0.18)',
        display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 13.5, fontWeight: 600, lineHeight: 1.5,
      }}
    >
      <span style={{ fontSize: 16 }}>⚠️</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onDismiss}
        style={{ border: 'none', background: 'transparent', color: '#9f1239', fontWeight: 800, cursor: 'pointer', fontSize: 15, lineHeight: 1 }}
      >
        ✕
      </button>
    </div>
  );
}
