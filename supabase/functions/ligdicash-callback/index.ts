// Notification envoyée par LigdiCash après un paiement (callback_url).
// À déployer SANS vérification JWT : `supabase functions deploy ligdicash-callback --no-verify-jwt`
//
// Sécurité : le contenu du callback n'est JAMAIS cru tel quel (n'importe qui peut
// appeler cette URL). On en extrait seulement l'identifiant de transaction, puis on
// re-vérifie le statut auprès de LigdiCash avec le token de création stocké en base.
import { syncPayment, UUID_RE } from "../_shared/ligdicash.ts";

function extractTransactionId(payload: unknown, url: URL): string | null {
  const candidates: unknown[] = [];
  // deno-lint-ignore no-explicit-any
  const p = payload as any;
  if (p) {
    const cd = p.custom_data;
    if (Array.isArray(cd)) {
      // Format documenté : [{ keyof_customdata, valueof_customdata }]
      const entry = cd.find((e) => e?.keyof_customdata === "transaction_id");
      candidates.push(entry?.valueof_customdata);
    } else if (cd && typeof cd === "object") {
      candidates.push(cd.transaction_id);
    }
    candidates.push(p.external_id, p.transaction_id);
  }
  candidates.push(url.searchParams.get("pid"));
  const found = candidates.find((c) => typeof c === "string" && UUID_RE.test(c));
  return (found as string) ?? null;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  let payload: unknown = null;
  try {
    const raw = await req.text();
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = Object.fromEntries(new URLSearchParams(raw));
    }
  } catch { /* corps vide */ }

  const transactionId = extractTransactionId(payload, url);
  if (!transactionId) {
    console.warn("ligdicash-callback : transaction_id introuvable");
    return new Response("ok", { status: 200 });
  }

  try {
    const status = await syncPayment(transactionId, true);
    console.log(`ligdicash-callback : paiement ${transactionId} -> ${status}`);
  } catch (e) {
    // On répond quand même 200 ; la page de retour et la re-vérification rattraperont.
    console.error("ligdicash-callback", transactionId, e);
  }
  return new Response("ok", { status: 200 });
});
