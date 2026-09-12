import { useEffect, useRef } from 'react';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

let scriptPromise = null;
function loadTurnstileScript() {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    if (window.turnstile) { resolve(window.turnstile); return; }
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return scriptPromise;
}

// Anti-bots de Cloudflare Turnstile — PREPARADO pero inactivo mientras no
// exista VITE_TURNSTILE_SITE_KEY en el .env (el componente no renderiza
// nada y no descarga ningún script): en cuanto EMUSS reciba su Site Key
// real de Cloudflare, agregarla al .env activa el widget acá mismo, sin
// tocar más código. La Secret Key correspondiente nunca va al frontend —
// se configura como secreto de la Edge Function que la valide.
export default function TurnstileWidget({ onVerify }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);

  useEffect(() => {
    if (!SITE_KEY || !containerRef.current) return undefined;
    let mounted = true;
    loadTurnstileScript().then((turnstile) => {
      if (!mounted || !turnstile || !containerRef.current) return;
      widgetIdRef.current = turnstile.render(containerRef.current, {
        sitekey: SITE_KEY,
        callback: (token) => onVerify(token),
        'expired-callback': () => onVerify(''),
      });
    }).catch(() => {});
    return () => {
      mounted = false;
      if (window.turnstile && widgetIdRef.current) window.turnstile.remove(widgetIdRef.current);
    };
  }, [onVerify]);

  if (!SITE_KEY) return null;
  return <div ref={containerRef} style={{ margin: '4px 0 16px' }} />;
}
