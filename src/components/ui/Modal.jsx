// Overlay genérico reutilizado por todos los modales de la app (cola virtual,
// notificarme, mis reservas, formulario de reserva, carrito, ticket, admin...).
export default function Modal({ maxWidth = 440, scroll = false, textAlign, children }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(2,6,23,0.4)',
        backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '24px',
      }}
    >
      <div
        style={{
          background: '#ffffff', borderRadius: '28px', maxWidth, width: '100%',
          maxHeight: scroll ? '92vh' : undefined, overflowY: scroll ? 'auto' : undefined,
          padding: 'clamp(20px,5vw,32px)', boxShadow: '0 32px 80px rgba(2,6,23,0.25)',
          textAlign,
        }}
      >
        {children}
      </div>
    </div>
  );
}
