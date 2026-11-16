// Crée une facture LigdiCash pour une commande existante et renvoie l'URL de paiement.
// Appelée par le panier : supabase.functions.invoke('ligdicash-create', { body: { order_id } })
import { adminClient, corsHeaders, createInvoice, env, json, UUID_RE } from "../_shared/ligdicash.ts";

const MAX_ATTEMPTS_PER_ORDER = 5;
const ORDER_MAX_AGE_MS = 2 * 60 * 60 * 1000; // 2 h

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "Méthode non autorisée" }, 405);

  try {
    const { order_id } = await req.json().catch(() => ({}));
    if (typeof order_id !== "string" || !UUID_RE.test(order_id)) {
      return json(req, { error: "Commande invalide." }, 400);
    }

    const db = adminClient();
    const { data: order } = await db
      .from("orders")
      .select("id, store_id, customer_name, total_amount, status, payment_status, created_at, stores(name)")
      .eq("id", order_id)
      .maybeSingle();

    if (!order) return json(req, { error: "Commande introuvable." }, 404);
    if (order.payment_status === "paye") return json(req, { error: "Cette commande est déjà payée." }, 409);
    if (order.status === "annulé") return json(req, { error: "Cette commande a été annulée." }, 409);
    if (Date.now() - new Date(order.created_at).getTime() > ORDER_MAX_AGE_MS) {
      return json(req, { error: "Commande expirée, merci de la refaire." }, 409);
    }

    const { count } = await db
      .from("payments")
      .select("id", { count: "exact", head: true })
      .eq("order_id", order.id);
    if ((count ?? 0) >= MAX_ATTEMPTS_PER_ORDER) {
      return json(req, { error: "Trop de tentatives de paiement pour cette commande." }, 429);
    }

    // Montant issu de la base (recalculé par place_order), jamais du navigateur.
    const amount = Math.ceil(Number(order.total_amount));
    if (!(amount > 0)) return json(req, { error: "Montant invalide." }, 400);

    const { data: payment, error: payErr } = await db
      .from("payments")
      .insert({ order_id: order.id, amount })
      .select("id")
      .single();
    if (payErr || !payment) throw payErr ?? new Error("Création du paiement impossible");

    await db.from("orders").update({ payment_method: "ligdicash" }).eq("id", order.id);

    const site = env("SITE_URL").replace(/\/$/, "");
    const fnBase = `${env("SUPABASE_URL").replace(/\/$/, "")}/functions/v1`;
    // deno-lint-ignore no-explicit-any
    const storeName = (order as any).stores?.name ?? "FestiSolde";

    const { token, paymentUrl } = await createInvoice({
      transactionId: payment.id,
      amount,
      description: `Commande ${storeName} #${order.id.slice(0, 8).toUpperCase()}`,
      customerFirstname: order.customer_name ?? "",
      storeName: `FestiSolde – ${storeName}`,
      returnUrl: `${site}/paiement/retour?pid=${payment.id}`,
      cancelUrl: `${site}/paiement/retour?pid=${payment.id}&annule=1`,
      callbackUrl: `${fnBase}/ligdicash-callback?pid=${payment.id}`,
    });

    await db.from("payments").update({ ligdicash_token: token, updated_at: new Date().toISOString() }).eq("id", payment.id);

    return json(req, { payment_id: payment.id, payment_url: paymentUrl });
  } catch (e) {
    console.error("ligdicash-create", e);
    return json(req, { error: e instanceof Error ? e.message : "Erreur inattendue." }, 500);
  }
});
