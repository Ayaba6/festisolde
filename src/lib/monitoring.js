// Suivi des erreurs (Sentry), activé seulement si VITE_SENTRY_DSN est défini.
// Sans DSN, rien n'est chargé : aucun poids ajouté au site.
const DSN = import.meta.env.VITE_SENTRY_DSN;
let sentry = null;

export async function initMonitoring() {
  if (!DSN || import.meta.env.DEV) return;
  try {
    sentry = await import('@sentry/react');
    sentry.init({
      dsn: DSN,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0,
      // Pas de données personnelles : ni IP, ni contenu des formulaires.
      sendDefaultPii: false,
      beforeSend(event) {
        if (event.request?.url) event.request.url = event.request.url.split('?')[0];
        return event;
      },
    });
  } catch {
    sentry = null;
  }
}

export function reportError(error, context) {
  if (sentry) sentry.captureException(error, context ? { extra: context } : undefined);
  else if (import.meta.env.DEV) console.error(error, context);
}
