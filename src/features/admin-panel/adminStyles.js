// Tokens y estilos repetidos en el panel admin — antes copy-pasteados en
// cada componente (ReservationsTable, AccessManagementTab, los modales de
// admin...). Se centralizan acá para que las pantallas nuevas (Clientes,
// Auditoría, Check-in, Control de piscina) no vuelvan a duplicarlos.

export const panelShell = {
  background: '#ffffff', border: '1px solid #f1f5f9', borderRadius: 20,
  padding: 24, boxShadow: '0 4px 24px rgba(15,23,42,0.04)',
};

export const th = { padding: '10px 8px', fontSize: 12, color: '#94a3b8', fontWeight: 700, textAlign: 'left' };
export const td = { padding: '10px 8px', fontSize: 13, color: '#334155', whiteSpace: 'nowrap' };

export const fieldStyle = { width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 14 };
export const labelStyle = { fontSize: 12.5, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 };

export function badgeStyle(active) {
  return {
    padding: '4px 10px', borderRadius: 999, fontWeight: 700, fontSize: 12,
    background: active ? '#ecfdf5' : '#fdf2f4', color: active ? '#047857' : '#9d5570',
  };
}

export const buttonPrimary = {
  padding: '11px 18px', borderRadius: 10, border: 'none', background: '#4f46e5',
  color: '#ffffff', fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
};

export const buttonSecondary = {
  padding: '11px 18px', borderRadius: 10, border: '1.5px solid #e2e8f0', background: '#ffffff',
  color: '#334155', fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
};
