// Envoie une notification push au vendeur quand une commande est créée.
//
// Déclenchée par un "Database Webhook" Supabase (table orders, événement INSERT)
// qui appelle cette fonction avec l'en-tête  x-webhook-secret: <PUSH_WEBHOOK_SECRET>.
// Déployer SANS vérification JWT :  supabase functions deploy notify-new-order --no-verify-jwt
//
// Secrets requis : VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:…), PUSH_WEBHOOK_SECRET
import webpush from "npm:web-push@3.6.7";
import { adminClient, env } from "../_shared/ligdicash.ts";

const fmt = (v: unknown) => `${Math.round(Number(v) || 0).toLocaleString("fr-FR")} F`;

// Comparaison à temps constant du secret partagé
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Méthode non autorisée", { status: 405 });
  if (!safeEqual(req.headers.get("x-webhook-secret") ?? "", env("PUSH_WEBHOOK_SECRET"))) {
    return new Response("Non autorisé", { status: 401 });
  }

  try {
    const payload = await req.json();
    const order = payload?.record;
    if (payload?.type !== "INSERT" || payload?.table !== "orders" || !order?.store_id) {
      return new Response("ignoré", { status: 200 });
    }

    webpush.setVapidDetails(env("VAPID_SUBJECT"), env("VAPID_PUBLIC_KEY"), env("VAPID_PRIVATE_KEY"));
    const db = adminClient();

    const { data: store } = await db.from("stores").select("owner_id, name").eq("id", order.store_id).maybeSingle();
    if (!store) return new Response("boutique inconnue", { status: 200 });

    const { data: subs } = await db
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", store.owner_id);
    if (!subs?.length) return new Response("aucun appareil", { status: 200 });

    const count = Array.isArray(order.items) ? order.items.reduce((a: number, i: any) => a + (Number(i.quantity) || 0), 0) : 0;
    const message = JSON.stringify({
      title: "🛍️ Nouvelle commande !",
      body: `${count ? `${count} article${count > 1 ? "s" : ""} · ` : ""}${fmt(order.total_amount)} — réf. #${String(order.id).slice(0, 8).toUpperCase()}`,
      url: "/revenus",
      tag: `order-${order.id}`,
    });

    const expired: string[] = [];
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, message, { TTL: 3600 });
        } catch (e: any) {
          // 404/410 : l'appareil s'est désabonné, on le retire.
          if (e?.statusCode === 404 || e?.statusCode === 410) expired.push(s.id);
          else console.error("push", e?.statusCode, e?.body);
        }
      })
    );
    if (expired.length) await db.from("push_subscriptions").delete().in("id", expired);

    return new Response(JSON.stringify({ sent: subs.length - expired.length }), { status: 200 });
  } catch (e) {
    console.error("notify-new-order", e);
    return new Response("erreur", { status: 500 });
  }
});
