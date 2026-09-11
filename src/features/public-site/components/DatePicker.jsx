export default function DatePicker({ calendar }) {
  const { open, onToggle, label, monthLabel, days, onPrevMonth, onNextMonth, canGoPrev, canGoNext } = calendar;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onToggle}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 24px', fontSize: 15, fontWeight: 700,
          background: '#ffffff', cursor: 'pointer', color: '#0f172a', borderRadius: 14, border: '1px solid #e2e8f0',
          boxShadow: open ? '0 0 0 3px rgba(79,70,229,0.18)' : '0 2px 10px rgba(15,23,42,0.04)',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" />
        </svg>
        {label}
      </button>
      {open && (
        <div
          style={{
            position: 'absolute', top: 'calc(100% + 10px)', left: '50%', transform: 'translateX(-50%)',
            width: 'min(320px,86vw)', background: '#ffffff', borderRadius: 24, boxShadow: '0 24px 60px rgba(15,23,42,0.18)',
            padding: 22, zIndex: 60, border: '1px solid #f1f5f9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <button
              onClick={onPrevMonth}
              disabled={!canGoPrev}
              style={{
                border: 'none', background: '#eef2ff', cursor: canGoPrev ? 'pointer' : 'default', fontSize: 16,
                width: 32, height: 32, borderRadius: 10, color: canGoPrev ? '#4f46e5' : '#c7d2fe', fontWeight: 700,
              }}
            >
              ‹
            </button>
            <span style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>{monthLabel}</span>
            <button
              onClick={onNextMonth}
              disabled={!canGoNext}
              style={{
                border: 'none', background: '#eef2ff', cursor: canGoNext ? 'pointer' : 'default', fontSize: 16,
                width: 32, height: 32, borderRadius: 10, color: canGoNext ? '#4f46e5' : '#c7d2fe', fontWeight: 700,
              }}
            >
              ›
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 8 }}>
            {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map((wd) => (
              <span key={wd} style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>{wd}</span>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
            {days.map((d, i) => (
              <button
                key={`${d.num}-${i}`}
                onClick={d.onClick}
                disabled={!d.selectable}
                style={{
                  border: 'none', background: d.selected ? '#4f46e5' : 'transparent',
                  color: !d.selectable ? '#cbd5e1' : d.selected ? '#ffffff' : '#0f172a',
                  fontWeight: d.selected ? 800 : 600, borderRadius: '50%', width: 34, height: 34, fontSize: 13,
                  cursor: d.selectable ? 'pointer' : 'default',
                }}
              >
                {d.num}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
