// Abonnement aux notifications push (nouvelles commandes) pour les vendeurs.
import { supabase } from './supabaseClient';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export const pushSupported = () =>
  !!VAPID_PUBLIC_KEY && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

const toUint8 = (base64) => {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

export async function getPushState() {
  if (!pushSupported()) return 'unsupported';
  if (Notification.permission === 'denied') return 'denied';
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  return sub ? 'enabled' : 'disabled';
}

export async function enablePush() {
  if (!pushSupported()) throw new Error('Votre navigateur ne gère pas les notifications.');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Autorisez les notifications dans les réglages du navigateur.');

  const reg = await navigator.serviceWorker.ready;
  const sub =
    (await reg.pushManager.getSubscription()) ||
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: toUint8(VAPID_PUBLIC_KEY) }));

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Session expirée.');
  const json = sub.toJSON();
  const { error } = await supabase.from('push_subscriptions').upsert(
    { user_id: user.id, endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth },
    { onConflict: 'endpoint' }
  );
  if (error) throw error;
}

export async function disablePush() {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
  await sub.unsubscribe();
}
