// Crée une facture LigdiCash pour l'acompte (puis le solde) d'un stand du festival.
// Appelée depuis l'espace vendeur : supabase.functions.invoke('festival-stand-pay', { body: { stand_id } })
// Le montant est calculé en base (festival_prepare_payment), jamais par le navigateur.
import { adminClient, corsHeaders, createInvoice, env, json, UUID_RE } from "../_shared/ligdicash.ts";

const MAX_ATTEMPTS_PER_HOUR = 6;

// Retour sur le domaine d'où vient le vendeur (sa session y est ouverte), s'il est autorisé.
function returnBase(req: Request): string {
  const origin = req.headers.get("origin") ?? "";
  const allowed = (Deno.env.get("ALLOWED_ORIGINS") ?? env("SITE_URL")).split(",").map((s) => s.trim());
  return (allowed.includes(origin) ? origin : env("SITE_URL")).replace(/\/$/, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "Méthode non autorisée" }, 405);

  try {
    const db = adminClient();
    const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    const { data: auth } = await db.auth.getUser(jwt);
    if (!auth?.user) return json(req, { error: "Connectez-vous à votre espace vendeur." }, 401);

    const { stand_id } = await req.json().catch(() => ({}));
    if (typeof stand_id !== "string" || !UUID_RE.test(stand_id)) {
      return json(req, { error: "Réservation invalide." }, 400);
    }

    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await db
      .from("payments")
      .select("id", { count: "exact", head: true })
      .eq("stand_id", stand_id)
      .gte("created_at", since);
    if ((count ?? 0) >= MAX_ATTEMPTS_PER_HOUR) {
      return json(req, { error: "Trop de tentatives de paiement, réessayez dans une heure." }, 429);
    }

    // Vérifie le propriétaire, la place disponible, et calcule le montant dû.
    const { data: amount, error: prepErr } = await db.rpc("festival_prepare_payment", {
      p_stand_id: stand_id,
      p_user: auth.user.id,
    });
    if (prepErr) return json(req, { error: prepErr.message }, 409);
    if (!(Number(amount) > 0)) return json(req, { error: "Rien à payer." }, 409);

    const { data: stand } = await db
      .from("festival_stands")
      .select("category, amount_paid, stores(name)")
      .eq("id", stand_id)
      .single();
    // deno-lint-ignore no-explicit-any
    const storeName = (stand as any)?.stores?.name ?? "Exposant";
    const kind = Number(stand?.amount_paid) > 0 ? "Solde" : "Acompte";

    const { data: payment, error: payErr } = await db
      .from("payments")
      .insert({ stand_id, amount })
      .select("id")
      .single();
    if (payErr || !payment) throw payErr ?? new Error("Création du paiement impossible");

    const site = returnBase(req);
    const fnBase = `${env("SUPABASE_URL").replace(/\/$/, "")}/functions/v1`;
    const { token, paymentUrl } = await createInvoice({
      transactionId: payment.id,
      amount: Number(amount),
      description: `${kind} stand Festival FestiSolde – ${storeName} (${stand?.category ?? ""})`,
      customerFirstname: storeName,
      storeName: "FestiSolde – Festival de Noël",
      returnUrl: `${site}/festival/mon-stand?pid=${payment.id}`,
      cancelUrl: `${site}/festival/mon-stand?pid=${payment.id}&annule=1`,
      callbackUrl: `${fnBase}/ligdicash-callback?pid=${payment.id}`,
    });

    await db.from("payments").update({ ligdicash_token: token, updated_at: new Date().toISOString() }).eq("id", payment.id);

    return json(req, { payment_id: payment.id, payment_url: paymentUrl, amount: Number(amount) });
  } catch (e) {
    console.error("festival-stand-pay", e);
    return json(req, { error: e instanceof Error ? e.message : "Erreur inattendue." }, 500);
  }
});
