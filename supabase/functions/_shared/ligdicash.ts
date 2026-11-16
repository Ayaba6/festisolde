// Outils partagés par les Edge Functions LigdiCash (Deno).
// Doc : https://developers.ligdicash.com
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const LIGDICASH_BASE = "https://app.ligdicash.com/pay/v01/redirect/checkout-invoice";

export function env(name: string): string {
  const v = Deno.env.get(name);
  if (!v) throw new Error(`Variable d'environnement manquante : ${name}`);
  return v;
}

// Client "service_role" : contourne la RLS, uniquement côté serveur.
export function adminClient() {
  return createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false },
  });
}

function ligdicashHeaders(): HeadersInit {
  return {
    Apikey: env("LIGDICASH_API_KEY"),
    Authorization: `Bearer ${env("LIGDICASH_AUTH_TOKEN")}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

export type CreateInvoiceInput = {
  transactionId: string;
  amount: number;          // XOF, entier
  description: string;
  customerFirstname?: string;
  storeName: string;
  returnUrl: string;
  cancelUrl: string;
  callbackUrl: string;
};

export async function createInvoice(input: CreateInvoiceInput) {
  const body = {
    commande: {
      invoice: {
        items: [],                       // facultatif : seul total_amount fait foi
        total_amount: input.amount,
        devise: "XOF",
        description: input.description.slice(0, 250),
        customer: "",
        customer_firstname: input.customerFirstname ?? "",
        customer_lastname: "",
        customer_email: "",
        external_id: input.transactionId,
        otp: "",
      },
      store: {
        name: input.storeName.slice(0, 80),
        website_url: env("SITE_URL"),
      },
      actions: {
        cancel_url: input.cancelUrl,
        return_url: input.returnUrl,
        callback_url: input.callbackUrl,
      },
      custom_data: { transaction_id: input.transactionId },
    },
  };

  const res = await fetch(`${LIGDICASH_BASE}/create`, {
    method: "POST",
    headers: ligdicashHeaders(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  const data = await res.json().catch(() => ({}));
  if (data?.response_code !== "00" || !data?.token || !data?.response_text) {
    console.error("LigdiCash create : échec", res.status, data?.response_text, data?.wiki);
    throw new Error("Le service de paiement est indisponible, réessayez dans un instant.");
  }
  return { token: String(data.token), paymentUrl: String(data.response_text) };
}

export type ConfirmResult = {
  status: "pending" | "completed" | "notcompleted";
  amount: number | null;
  operatorName: string | null;
  operatorReference: string | null;
};

export async function confirmInvoice(token: string): Promise<ConfirmResult> {
  const url = `${LIGDICASH_BASE}/confirm/?invoiceToken=${encodeURIComponent(token)}`;
  const res = await fetch(url, {
    headers: ligdicashHeaders(),
    signal: AbortSignal.timeout(20_000),
  });
  const data = await res.json().catch(() => ({}));
  if (data?.response_code !== "00") {
    console.error("LigdiCash confirm : échec", res.status, data?.response_text);
    return { status: "pending", amount: null, operatorName: null, operatorReference: null };
  }
  const status = ["completed", "notcompleted", "pending"].includes(data.status) ? data.status : "pending";
  const amount = Number(data.amount ?? data.montant);
  return {
    status,
    amount: Number.isFinite(amount) ? amount : null,
    operatorName: data.operator_name || null,
    operatorReference: data.oreference || data.operator_id || null,
  };
}

// Vérifie le paiement auprès de LigdiCash et applique le résultat en base.
export async function syncPayment(paymentId: string, fromCallback = false) {
  const db = adminClient();
  const { data: pay } = await db
    .from("payments")
    .select("id, status, ligdicash_token")
    .eq("id", paymentId)
    .maybeSingle();
  if (!pay) return null;
  if (pay.status !== "pending" || !pay.ligdicash_token) {
    if (fromCallback) {
      await db.rpc("confirm_payment", { p_payment_id: paymentId, p_status: "pending", p_from_callback: true });
    }
    return pay.status as string;
  }

  const result = await confirmInvoice(pay.ligdicash_token);
  const { data: finalStatus, error } = await db.rpc("confirm_payment", {
    p_payment_id: paymentId,
    p_status: result.status,
    p_paid_amount: result.amount,
    p_operator_name: result.operatorName,
    p_operator_reference: result.operatorReference,
    p_from_callback: fromCallback,
  });
  if (error) throw error;
  return finalStatus as string;
}

// CORS : seuls les domaines du site peuvent appeler les fonctions depuis le navigateur.
export function corsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("origin") ?? "";
  const allowed = (Deno.env.get("ALLOWED_ORIGINS") ?? env("SITE_URL"))
    .split(",").map((s) => s.trim()).filter(Boolean);
  const ok = allowed.some((a) => a === origin || (a.startsWith("*.") && origin.endsWith(a.slice(1))));
  return {
    "Access-Control-Allow-Origin": ok ? origin : allowed[0] ?? "",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    Vary: "Origin",
  };
}

export function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
