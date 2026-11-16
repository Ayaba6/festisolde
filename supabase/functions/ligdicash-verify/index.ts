// Vérifie l'état d'un paiement (page /paiement/retour) et renvoie le récapitulatif
// nécessaire pour prévenir le vendeur sur WhatsApp.
import { adminClient, corsHeaders, json, syncPayment, UUID_RE } from "../_shared/ligdicash.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(req) });
  if (req.method !== "POST") return json(req, { error: "Méthode non autorisée" }, 405);

  try {
    const { payment_id } = await req.json().catch(() => ({}));
    if (typeof payment_id !== "string" || !UUID_RE.test(payment_id)) {
      return json(req, { error: "Paiement invalide." }, 400);
    }

    const status = await syncPayment(payment_id);
    if (!status) return json(req, { error: "Paiement introuvable." }, 404);

    const db = adminClient();
    const { data: pay } = await db
      .from("payments")
      .select("amount, order_id, orders(id, items, total_amount, customer_city, stores(slug, whatsapp_number))")
      .eq("id", payment_id)
      .single();

    // deno-lint-ignore no-explicit-any
    const order = (pay as any)?.orders;
    return json(req, {
      status,
      order: order && {
        id: order.id,
        reference: String(order.id).slice(0, 8).toUpperCase(),
        total: Number(order.total_amount),
        items: order.items ?? [],
        store_slug: order.stores?.slug ?? null,
        whatsapp_number: order.stores?.whatsapp_number ?? null,
      },
    });
  } catch (e) {
    console.error("ligdicash-verify", e);
    return json(req, { error: "Vérification impossible pour le moment." }, 500);
  }
});
