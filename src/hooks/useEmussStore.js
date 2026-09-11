import { useCallback, useEffect, useRef, useState } from 'react';
import { dayLabel } from '../utils/dateUtils';
import { isSupabaseConfigured } from '../services/supabaseClient';
import {
  SEDES,
  effectiveSlotState,
  findAlternativeSlot,
  findSedeById,
  getSlotTimesForDay,
} from '../services/sedesService';
import {
  cancelReservationByCode,
  confirmReservationViaLock,
  exportReservationsCSV,
  filterReservationsBySearch,
  fetchReservations,
  priceFor,
} from '../services/reservationsService';
import { createHold, fetchActiveHolds, releaseHold } from '../services/holdsService';
import { fetchSlotOccupancy } from '../services/slotOccupancyService';
import { subscribeToAvailabilityRealtime, unsubscribeRealtime } from '../services/realtimeService';
import {
  fetchAdminUsers,
  inviteAdminUser,
  updateAdminRol,
  updateAdminSede,
} from '../services/rbacService';
import {
  fetchActivityLogs,
  fetchMaintenanceStatus,
  fetchPanicState,
  pushActivityLog,
  setPanicState,
  toggleMaintenanceStatus,
} from '../services/adminOpsService';
import { getCurrentSession, signInWithPassword, signOut, signUpClient } from '../services/authService';
import { requestNotifyOnFreeSlot, sendReservationEmail } from '../services/notificationsService';

const EMPTY_RESERVATION_FORM = {
  tipoDocumento: 'DNI',
  nombres: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  documento: '',
  telefono: '',
  correo: '',
  personas: 1,
  exclusivo: false,
  tarifa: 'vecino',
  necesitaElevador: false,
  necesitaRampa: false,
  necesitaAsistencia: false,
  vaConCuidador: false,
  notasAccesibilidad: '',
};

const EMPTY_AUTH_FORM = { nombre: '', correo: '', password: '', dni: '' };

// El cupo se bloquea para los demás mientras alguien completa el formulario;
// se puede extender para no presionar a quien necesita más tiempo (ver WCAG 2.2.1).
const RESERVATION_HOLD_SECONDS = 480;
const RESERVATION_HOLD_EXTEND_SECONDS = 120;
const RESERVATION_HOLD_MAX_SECONDS = 900;

const INITIAL_STATE = {
  backendConfigured: isSupabaseConfigured,
  dataLoading: isSupabaseConfigured,
  globalError: '',
  view: 'public',
  activeFilter: 'todo',
  calendarOpen: false,
  selectedDay: 9,
  reservations: [],
  slotOccupancy: [],
  holds: [],
  modal: null,
  countdown: 0,
  form: { ...EMPTY_RESERVATION_FORM },
  lastTicket: null,
  recommendation: null,
  activeCupos: 3,
  panicActive: false,
  maintenance: {},
  logs: [],
  adminTab: 'analytics',
  adminRange: 'semana',
  tableSearch: '',
  adminModal: null,
  adminForm: { sedeId: 'chacarilla', time: '', personas: 1, exclusivo: false, tarifa: 'vecino', nombre: '', documento: '', telefono: '' },
  rbacUsers: [],
  rbacModal: null,
  rbacForm: { nombre: '', correo: '', rol: 'Encargado de sede', sedeId: 'chacarilla' },
  notifyModal: null,
  notifyForm: { contact: '' },
  notifyConfirmed: false,
  session: null,
  authMode: 'login',
  authForm: { ...EMPTY_AUTH_FORM },
  authError: '',
  authLoading: false,
};

function friendlyAuthError(err) {
  const msg = err?.message || '';
  if (msg === 'EMAIL_CONFIRMATION_REQUIRED') return '¡Cuenta creada! Revisa tu correo y confirma tu cuenta antes de iniciar sesión.';
  if (msg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (msg.includes('already registered') || msg.includes('already been registered')) return 'Ya existe una cuenta con ese correo. Inicia sesión.';
  if (msg.includes('Password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.';
  return msg || 'Ocurrió un error. Intenta de nuevo.';
}

function occupancyRowFor(reservation) {
  return {
    code: reservation.code, sedeId: reservation.sedeId, day: reservation.day, time: reservation.time,
    personas: reservation.personas, exclusivo: reservation.exclusivo, estado: reservation.estado,
  };
}

function upsertByCode(list, row) {
  const idx = list.findIndex((r) => r.code === row.code);
  if (idx === -1) return [...list, row];
  const next = list.slice();
  next[idx] = row;
  return next;
}

// Contenedor de estado de la app (equivalente al Component/DCLogic original)
// migrado a un hook de React, respaldado por Supabase + Realtime. Expone el
// estado y las acciones que las features (sitio público, cuenta de cliente
// y panel admin) necesitan para renderizarse.
export function useEmussStore() {
  const [state, setState] = useState(INITIAL_STATE);
  const countdownTimer = useRef(null);
  const logPollTimer = useRef(null);

  const patchState = useCallback((patch) => {
    setState((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }));
  }, []);

  const clearCountdownTimer = useCallback(() => {
    if (countdownTimer.current) {
      clearInterval(countdownTimer.current);
      countdownTimer.current = null;
    }
  }, []);
  useEffect(() => () => clearCountdownTimer(), [clearCountdownTimer]);

  // ---- datos del panel admin (RBAC, mantenimiento, pánico, actividad) ----
  const loadAdminData = useCallback(async () => {
    try {
      const [rbacUsers, maintenance, panicActive, logs] = await Promise.all([
        fetchAdminUsers(), fetchMaintenanceStatus(), fetchPanicState(), fetchActivityLogs(),
      ]);
      patchState({ rbacUsers, maintenance, panicActive, logs });
    } catch {
      patchState({ globalError: 'No se pudieron cargar los datos del panel admin.' });
    }
  }, [patchState]);

  // Vuelve a traer disponibilidad (ocupación pública + holds) tras un
  // rechazo por cupo lleno, para que la pantalla deje de mostrar datos viejos.
  const refreshAvailability = useCallback(async () => {
    try {
      const [slotOccupancy, holds] = await Promise.all([fetchSlotOccupancy(), fetchActiveHolds()]);
      patchState({ slotOccupancy, holds });
    } catch { /* best-effort */ }
  }, [patchState]);

  // ---- carga inicial: sesión, reservas visibles y disponibilidad pública ----
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => {
      try {
        const session = await getCurrentSession();
        const [reservations, slotOccupancy, holds] = await Promise.all([
          fetchReservations(), fetchSlotOccupancy(), fetchActiveHolds(),
        ]);
        patchState({ reservations, slotOccupancy, holds, session, dataLoading: false });
        if (session?.type === 'admin') await loadAdminData();
      } catch {
        patchState({ dataLoading: false, globalError: 'No se pudo conectar con el backend. Revisa tu configuración de Supabase.' });
      }
    })();
  }, [patchState, loadAdminData]);

  // Disponibilidad en vivo: cualquier pestaña conectada ve al instante
  // cuando alguien reserva, cancela, o empieza/deja de reservar un horario.
  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    const channel = subscribeToAvailabilityRealtime({
      onSlotOccupancyChange: (row) => patchState((s) => ({ slotOccupancy: upsertByCode(s.slotOccupancy, row) })),
      onHoldsChange: (holds) => patchState({ holds }),
    });
    return () => unsubscribeRealtime(channel);
  }, [patchState]);

  // Red de seguridad local: si un hold vence y por lo que sea no llega el
  // evento de Realtime (o pg_cron no está habilitado), igual deja de
  // contarlo a los pocos segundos de vencido.
  useEffect(() => {
    const t = setInterval(() => {
      patchState((s) => {
        const now = Date.now();
        const filtered = s.holds.filter((h) => new Date(h.expiresAt).getTime() > now);
        return filtered.length === s.holds.length ? {} : { holds: filtered };
      });
    }, 5000);
    return () => clearInterval(t);
  }, [patchState]);

  // Refresca el feed de actividad mientras el panel admin está abierto.
  useEffect(() => {
    if (state.view !== 'admin') return undefined;
    logPollTimer.current = setInterval(() => {
      fetchActivityLogs().then((logs) => patchState({ logs })).catch(() => {});
    }, 6000);
    return () => clearInterval(logPollTimer.current);
  }, [state.view, patchState]);

  // ---- navegación / vista ----
  // El acceso al panel admin ya no es un botón público: entra por el mismo
  // login, y según el correo (cuenta admin vs. cuenta cliente) se decide a
  // dónde va. Si ya hay sesión, "Mi cuenta" te lleva directo a lo tuyo.
  const goToAccount = useCallback(() => {
    patchState((s) => ({ view: s.session ? (s.session.type === 'admin' ? 'admin' : 'account') : 'account', authError: '' }));
  }, [patchState]);
  const exitToPublic = useCallback(() => patchState({ view: 'public' }), [patchState]);
  const dismissGlobalError = useCallback(() => patchState({ globalError: '' }), [patchState]);

  // ---- disponibilidad pública ----
  const setActiveFilter = useCallback((key) => patchState({ activeFilter: key }), [patchState]);
  const toggleCalendar = useCallback(() => patchState((s) => ({ calendarOpen: !s.calendarOpen })), [patchState]);
  const selectDay = useCallback((day) => patchState({ selectedDay: day, calendarOpen: false }), [patchState]);

  const openQueueModal = useCallback((sede, time, day) => {
    clearCountdownTimer();
    patchState({ modal: { type: 'queue-info', sedeId: sede.id, sedeName: sede.name, slotTime: time, day } });
  }, [clearCountdownTimer, patchState]);

  const joinQueue = useCallback(() => {
    patchState((s) => ({ modal: { ...s.modal, type: 'queue-success' } }));
  }, [patchState]);

  // Pide el candado del horario en la base de datos ANTES de mostrar el
  // formulario: si alguien más lo ganó en la última fracción de segundo,
  // esto falla y ni siquiera se abre el formulario.
  const openFormModal = useCallback(async (sede, time, day, cuposLibres) => {
    clearCountdownTimer();
    let hold;
    try {
      hold = await createHold({ sedeId: sede.id, day, time, holdSeconds: RESERVATION_HOLD_SECONDS });
    } catch {
      patchState({ globalError: 'Ese horario se acaba de llenar. Elige otro.' });
      refreshAvailability();
      return;
    }
    patchState({
      modal: { type: 'form', sedeId: sede.id, sedeName: sede.name, slotTime: time, day, code: null, holdId: hold.id },
      countdown: RESERVATION_HOLD_SECONDS,
      activeCupos: cuposLibres,
      form: { ...EMPTY_RESERVATION_FORM },
      recommendation: null,
    });
    countdownTimer.current = setInterval(() => {
      patchState((s) => {
        if (s.countdown <= 1) {
          clearCountdownTimer();
          releaseHold(s.modal?.holdId).catch(() => {});
          return { countdown: 0, modal: null };
        }
        return { countdown: s.countdown - 1 };
      });
    }, 1000);
  }, [clearCountdownTimer, patchState, refreshAvailability]);

  const extendCountdown = useCallback(() => {
    patchState((s) => ({ countdown: Math.min(RESERVATION_HOLD_MAX_SECONDS, s.countdown + RESERVATION_HOLD_EXTEND_SECONDS) }));
  }, [patchState]);

  const goToCart = useCallback(() => patchState((s) => ({ modal: { ...s.modal, type: 'cart' } })), [patchState]);
  const backToForm = useCallback(() => patchState((s) => ({ modal: { ...s.modal, type: 'form' } })), [patchState]);

  const confirmReserva = useCallback(async () => {
    clearCountdownTimer();
    const m = state.modal;
    const f = state.form;
    const sede = findSedeById(m.sedeId);
    const precio = priceFor(sede, f.tarifa, f.personas, f.exclusivo);
    const nombreCompleto = [f.nombres, f.apellidoPaterno, f.apellidoMaterno].filter(Boolean).join(' ') || 'Invitado EMUSS';
    const payload = {
      sedeId: m.sedeId, day: m.day, time: m.slotTime, personas: Number(f.personas), exclusivo: f.exclusivo,
      nombre: nombreCompleto, dni: f.documento || '—', telefono: f.telefono, correo: f.correo, tarifa: f.tarifa, precio,
      necesitaElevador: f.necesitaElevador, necesitaRampa: f.necesitaRampa, necesitaAsistencia: f.necesitaAsistencia,
      vaConCuidador: f.vaConCuidador, notasAccesibilidad: f.notasAccesibilidad,
    };
    try {
      const clientId = state.session?.type === 'client' ? state.session.id : null;
      const reservation = await confirmReservationViaLock(payload, clientId, m.holdId);
      setState((prev) => ({
        ...prev,
        reservations: [...prev.reservations, reservation],
        slotOccupancy: upsertByCode(prev.slotOccupancy, occupancyRowFor(reservation)),
        modal: { ...prev.modal, type: 'ticket', code: reservation.code },
        lastTicket: {
          nombre: reservation.nombre, dni: reservation.dni, code: reservation.code,
          necesitaElevador: reservation.necesitaElevador, necesitaRampa: reservation.necesitaRampa,
          necesitaAsistencia: reservation.necesitaAsistencia, vaConCuidador: reservation.vaConCuidador,
        },
      }));
      pushActivityLog(`Reserva confirmada — ${sede.name}, carril ${m.slotTime}.`).catch(() => {});
      sendReservationEmail({
        to: reservation.correo, sedeName: sede.name, dateLabel: dayLabel(m.day),
        slotTime: m.slotTime, code: reservation.code, nombre: reservation.nombre,
      }).catch(() => {});
    } catch (err) {
      if (err.message === 'SLOT_FULL') {
        patchState({ globalError: 'Se llenó justo antes de confirmar tu reserva. Elige otro horario.', modal: null });
        refreshAvailability();
      } else {
        patchState({ globalError: 'No se pudo confirmar la reserva. Intenta de nuevo.' });
      }
    }
  }, [clearCountdownTimer, patchState, refreshAvailability, state.modal, state.form, state.session]);

  const cancelReservaByCode = useCallback(async (code) => {
    try {
      const updated = await cancelReservationByCode(code);
      patchState((s) => ({
        reservations: s.reservations.map((r) => (r.code === code ? updated : r)),
        slotOccupancy: upsertByCode(s.slotOccupancy, occupancyRowFor(updated)),
      }));
      pushActivityLog(`Reserva ${code} cancelada.`).catch(() => {});
    } catch {
      patchState({ globalError: 'No se pudo cancelar la reserva.' });
    }
  }, [patchState]);

  const cancelReserva = useCallback(async () => {
    const m = state.modal;
    if (m?.code) await cancelReservaByCode(m.code);
    patchState({ modal: null });
  }, [state.modal, cancelReservaByCode, patchState]);

  const closeModal = useCallback(() => {
    clearCountdownTimer();
    const holdId = state.modal?.holdId;
    patchState({ modal: null, recommendation: null });
    if (holdId) releaseHold(holdId).catch(() => {});
  }, [clearCountdownTimer, patchState, state.modal]);

  const viewTicket = useCallback((code) => {
    setState((prev) => {
      const r = prev.reservations.find((res) => res.code === code);
      if (!r) return prev;
      return {
        ...prev,
        modal: { type: 'ticket', sedeId: r.sedeId, sedeName: findSedeById(r.sedeId)?.name, slotTime: r.time, day: r.day, code: r.code },
        lastTicket: {
          nombre: r.nombre, dni: r.dni, code: r.code,
          necesitaElevador: r.necesitaElevador, necesitaRampa: r.necesitaRampa,
          necesitaAsistencia: r.necesitaAsistencia, vaConCuidador: r.vaConCuidador,
        },
      };
    });
  }, []);

  const goToAlternative = useCallback((sedeId, time, day) => {
    const sede = findSedeById(sedeId);
    const eff = effectiveSlotState(sede, day, time, state.slotOccupancy, state.holds);
    patchState({ recommendation: null });
    openFormModal(sede, time, day, eff.cuposLibres);
  }, [openFormModal, patchState, state.slotOccupancy, state.holds]);

  const handleSlotClick = useCallback((sede, time, day, effectiveStatus, cuposLibres) => {
    if (effectiveStatus === 'reservado') {
      const alt = findAlternativeSlot(sede, time, day, state.slotOccupancy, state.holds);
      patchState({
        recommendation: alt ? {
          fromSede: sede.name, sedeName: alt.sede.name, sedeId: alt.sede.id,
          time: alt.time, distanceMin: alt.sede.distanceMin, cuposLibres: alt.cuposLibres, day,
        } : null,
      });
      return;
    }
    patchState({ recommendation: null });
    if (effectiveStatus === 'enreserva') { openQueueModal(sede, time, day); return; }
    openFormModal(sede, time, day, cuposLibres);
  }, [openFormModal, openQueueModal, patchState, state.slotOccupancy, state.holds]);

  // ---- notificarme ----
  const openNotify = useCallback((sedeId, sedeName, time, day) => {
    patchState({ notifyModal: { sedeId, sedeName, time, day }, notifyConfirmed: false, notifyForm: { contact: '' } });
  }, [patchState]);
  const closeNotify = useCallback(() => patchState({ notifyModal: null }), [patchState]);
  const setNotifyContact = useCallback((value) => patchState((s) => ({ notifyForm: { ...s.notifyForm, contact: value } })), [patchState]);
  const submitNotify = useCallback(async () => {
    const nm = state.notifyModal;
    try {
      await requestNotifyOnFreeSlot({ sedeId: nm.sedeId, sedeName: nm.sedeName, time: nm.time, day: nm.day, contact: state.notifyForm.contact });
      patchState({ notifyConfirmed: true });
    } catch {
      patchState({ globalError: 'No se pudo registrar el aviso.' });
    }
  }, [state.notifyModal, state.notifyForm, patchState]);

  // ---- cuenta de cliente / admin (login / registro) ----
  const setAuthMode = useCallback((mode) => patchState({ authMode: mode, authError: '' }), [patchState]);
  const setAuthField = useCallback((field, value) => {
    patchState((s) => ({ authForm: { ...s.authForm, [field]: value } }));
  }, [patchState]);

  const submitLogin = useCallback(async () => {
    const f = state.authForm;
    if (!f.correo.trim() || !f.password.trim()) {
      patchState({ authError: 'Ingresa tu correo y contraseña.' });
      return;
    }
    patchState({ authLoading: true, authError: '' });
    try {
      const session = await signInWithPassword({ correo: f.correo, password: f.password });
      patchState({ session, authLoading: false, view: session.type === 'admin' ? 'admin' : 'account', authForm: { ...EMPTY_AUTH_FORM } });
      if (session.type === 'admin') await loadAdminData();
    } catch (err) {
      patchState({ authLoading: false, authError: friendlyAuthError(err) });
    }
  }, [state.authForm, patchState, loadAdminData]);

  const submitRegister = useCallback(async () => {
    const f = state.authForm;
    if (!f.nombre.trim() || !f.correo.trim() || !f.password.trim() || !f.dni.trim()) {
      patchState({ authError: 'Completa nombre, correo, DNI y contraseña.' });
      return;
    }
    patchState({ authLoading: true, authError: '' });
    try {
      const session = await signUpClient({ nombre: f.nombre, correo: f.correo, password: f.password, dni: f.dni });
      patchState({ session, authLoading: false, view: 'account', authForm: { ...EMPTY_AUTH_FORM } });
    } catch (err) {
      if (err.message === 'EMAIL_CONFIRMATION_REQUIRED') {
        patchState({ authLoading: false, authError: friendlyAuthError(err), authMode: 'login', authForm: { ...EMPTY_AUTH_FORM, correo: f.correo } });
        return;
      }
      patchState({ authLoading: false, authError: friendlyAuthError(err) });
    }
  }, [state.authForm, patchState]);

  const logout = useCallback(() => {
    signOut().catch(() => {});
    patchState({ session: null, view: 'public', rbacUsers: [], logs: [] });
  }, [patchState]);

  // ---- panel admin ----
  const togglePanic = useCallback(async () => {
    const next = !state.panicActive;
    patchState({ panicActive: next });
    try {
      await setPanicState(next);
    } catch {
      patchState({ panicActive: !next, globalError: 'No se pudo cambiar el modo pánico.' });
    }
  }, [state.panicActive, patchState]);

  const toggleMaintenance = useCallback(async (sedeId) => {
    const next = !state.maintenance[sedeId];
    patchState((s) => ({ maintenance: { ...s.maintenance, [sedeId]: next } }));
    try {
      await toggleMaintenanceStatus(sedeId, next);
    } catch {
      patchState((s) => ({ maintenance: { ...s.maintenance, [sedeId]: !next }, globalError: 'No se pudo actualizar el mantenimiento.' }));
    }
  }, [state.maintenance, patchState]);

  const setAdminTab = useCallback((tab) => patchState({ adminTab: tab }), [patchState]);
  const setAdminRange = useCallback((range) => patchState({ adminRange: range }), [patchState]);
  const setTableSearch = useCallback((value) => patchState({ tableSearch: value }), [patchState]);

  const exportCSV = useCallback(() => {
    exportReservationsCSV(filterReservationsBySearch(state.reservations, state.tableSearch));
  }, [state.reservations, state.tableSearch]);

  const openAdminNew = useCallback(() => {
    setState((prev) => {
      const sede = SEDES[0];
      const times = getSlotTimesForDay(sede, prev.selectedDay);
      return {
        ...prev,
        adminModal: 'new',
        adminForm: { sedeId: sede.id, time: times[0] || '', personas: 1, exclusivo: false, tarifa: 'vecino', nombre: '', documento: '', telefono: '' },
      };
    });
  }, []);
  const closeAdminNew = useCallback(() => patchState({ adminModal: null }), [patchState]);

  const setAdminFormSede = useCallback((sedeId) => {
    setState((prev) => {
      const sede = findSedeById(sedeId);
      const times = getSlotTimesForDay(sede, prev.selectedDay);
      return { ...prev, adminForm: { ...prev.adminForm, sedeId, time: times[0] || '' } };
    });
  }, []);
  const setAdminFormField = useCallback((field, value) => {
    patchState((s) => ({ adminForm: { ...s.adminForm, [field]: value } }));
  }, [patchState]);

  const submitAdminReserva = useCallback(async () => {
    const af = state.adminForm;
    const sede = findSedeById(af.sedeId);
    const precio = priceFor(sede, af.tarifa, af.personas, af.exclusivo);
    const payload = {
      sedeId: af.sedeId, day: state.selectedDay, time: af.time, personas: Number(af.personas), exclusivo: af.exclusivo,
      nombre: af.nombre || 'Invitado EMUSS', dni: af.documento || '—', telefono: af.telefono, correo: '', tarifa: af.tarifa, precio,
      necesitaElevador: false, necesitaRampa: false, necesitaAsistencia: false, vaConCuidador: false, notasAccesibilidad: '',
    };
    try {
      const reservation = await confirmReservationViaLock(payload, null, null);
      setState((prev) => ({
        ...prev,
        reservations: [...prev.reservations, reservation],
        slotOccupancy: upsertByCode(prev.slotOccupancy, occupancyRowFor(reservation)),
        adminModal: null,
      }));
      pushActivityLog(`Reserva creada por admin — ${sede.name}, carril ${af.time}.`).catch(() => {});
    } catch (err) {
      patchState({ globalError: err.message === 'SLOT_FULL' ? 'Ese horario ya está lleno.' : 'No se pudo crear la reserva.' });
    }
  }, [state.adminForm, state.selectedDay, patchState]);

  // ---- accesos (RBAC) ----
  const openRbacAdd = useCallback(() => patchState({ rbacModal: 'add', rbacForm: { nombre: '', correo: '', rol: 'Encargado de sede', sedeId: 'chacarilla' } }), [patchState]);
  const closeRbacAdd = useCallback(() => patchState({ rbacModal: null }), [patchState]);
  const setRbacFormField = useCallback((field, value) => {
    patchState((s) => ({ rbacForm: { ...s.rbacForm, [field]: value } }));
  }, [patchState]);

  const submitRbacAdd = useCallback(async () => {
    const f = state.rbacForm;
    try {
      const result = await inviteAdminUser({ nombre: f.nombre, correo: f.correo, rol: f.rol, sedeId: f.sedeId });
      const rbacUsers = await fetchAdminUsers();
      patchState({
        rbacUsers, rbacModal: null,
        globalError: result?.tempPassword ? `Administrador creado. Contraseña temporal: ${result.tempPassword}` : '',
      });
    } catch (err) {
      patchState({ globalError: err.message || 'No se pudo agregar el administrador.' });
    }
  }, [state.rbacForm, patchState]);

  const updateRbacRol = useCallback(async (id, rol) => {
    const current = state.rbacUsers.find((u) => u.id === id);
    try {
      const updated = await updateAdminRol(id, rol, current?.sedeId || SEDES[0].id);
      patchState((s) => ({ rbacUsers: s.rbacUsers.map((u) => (u.id === id ? updated : u)) }));
    } catch {
      patchState({ globalError: 'No se pudo actualizar el rol.' });
    }
  }, [state.rbacUsers, patchState]);

  const updateRbacSede = useCallback(async (id, sedeId) => {
    try {
      const updated = await updateAdminSede(id, sedeId);
      patchState((s) => ({ rbacUsers: s.rbacUsers.map((u) => (u.id === id ? updated : u)) }));
    } catch {
      patchState({ globalError: 'No se pudo actualizar la sede.' });
    }
  }, [patchState]);

  // ---- formulario de reserva (público) ----
  const setFormField = useCallback((field, value) => {
    patchState((s) => ({ form: { ...s.form, [field]: value } }));
  }, [patchState]);

  return {
    state,
    actions: {
      dismissGlobalError,
      goToAccount,
      exitToPublic,
      setActiveFilter,
      toggleCalendar,
      selectDay,
      handleSlotClick,
      goToAlternative,
      openNotify,
      closeNotify,
      setNotifyContact,
      submitNotify,
      setAuthMode,
      setAuthField,
      submitLogin,
      submitRegister,
      logout,
      cancelReservaByCode,
      closeModal,
      viewTicket,
      joinQueue,
      goToCart,
      backToForm,
      confirmReserva,
      cancelReserva,
      setFormField,
      extendCountdown,
      togglePanic,
      toggleMaintenance,
      setAdminTab,
      setAdminRange,
      setTableSearch,
      exportCSV,
      openAdminNew,
      closeAdminNew,
      setAdminFormSede,
      setAdminFormField,
      submitAdminReserva,
      openRbacAdd,
      closeRbacAdd,
      setRbacFormField,
      submitRbacAdd,
      updateRbacRol,
      updateRbacSede,
    },
  };
}
