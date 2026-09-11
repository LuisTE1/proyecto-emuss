import { useState } from 'react';
import AccountTabs from './components/AccountTabs';
import AccountSummaryKpis from './components/AccountSummaryKpis';
import ActivityChart from './components/ActivityChart';
import AccountReservationsList from './components/AccountReservationsList';
import RecommendationsPanel from './components/RecommendationsPanel';
import NotificationPreferences from './components/NotificationPreferences';
import NotificationsFeed from './components/NotificationsFeed';
import { buildAccountKpis, buildAccountNotifications, buildAccountRecommendation, buildAccountReservations, buildActivityWeeks } from './clientAccountSelectors';

export default function ClientAccountPage({ session, reservations, actions, onLogout, onGoToDisponibilidad }) {
  const [tab, setTab] = useState('resumen');

  const kpis = buildAccountKpis(reservations, session);
  const weeks = buildActivityWeeks(reservations, session);
  const accountReservations = buildAccountReservations(reservations, session, actions);
  const recommendation = buildAccountRecommendation(reservations, session);
  const notifications = buildAccountNotifications(reservations, session);

  return (
    <div className="emuss-pad" style={{ maxWidth: 1320, margin: '0 auto', padding: '48px 32px 96px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#818cf8', fontWeight: 700, marginBottom: 8 }}>Mi cuenta</div>
          <h1 style={{ fontWeight: 800, fontSize: 32, margin: 0, color: '#0f172a', letterSpacing: '-0.02em' }}>Hola, {session.nombre.split(' ')[0]} 👋</h1>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onGoToDisponibilidad}
            style={{ padding: '10px 18px', borderRadius: 999, border: 'none', background: '#4f46e5', color: '#ffffff', fontWeight: 700, fontSize: 13, cursor: 'pointer', boxShadow: '0 8px 18px rgba(79,70,229,0.28)' }}
          >
            + Nueva reserva
          </button>
          <button
            onClick={onLogout}
            style={{ padding: '10px 18px', borderRadius: 999, border: '1.5px solid #e2e8f0', background: '#ffffff', color: '#334155', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      <AccountTabs activeTab={tab} onChange={setTab} />

      {tab === 'resumen' && (
        <>
          <AccountSummaryKpis kpis={kpis} />
          <div className="emuss-2col" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
            <ActivityChart weeks={weeks} />
            <RecommendationsPanel items={recommendation ? [recommendation] : []} onGoToDisponibilidad={onGoToDisponibilidad} />
          </div>
        </>
      )}

      {tab === 'notificaciones' && (
        <>
          <NotificationPreferences />
          <NotificationsFeed items={notifications} />
        </>
      )}

      {tab === 'reservas' && <AccountReservationsList reservations={accountReservations} onViewTicket={actions.viewTicket} />}
    </div>
  );
}
