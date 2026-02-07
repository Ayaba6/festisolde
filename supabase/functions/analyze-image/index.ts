import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Headers pour autoriser les appels depuis ton site web (CORS)
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Gérer la pré-vérification CORS du navigateur
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return new Response(JSON.stringify({ error: 'Aucun fichier image trouvé' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // --- LOGIQUE D'ANALYSE ---
    // Note : Pour une analyse réelle, tu devrais appeler l'API OpenAI ou Google Vision ici.
    // Pour l'instant, nous renvoyons un résultat de test pour valider que ton Header communique bien avec Supabase.

    console.log(`Fichier reçu : ${file.name}, taille : ${file.size} octets`)

    // Simulation d'un délai d'analyse
    await new Promise(resolve => setTimeout(resolve, 1000))

    // On renvoie un mot-clé (tu pourras remplacer "Veste" par le résultat d'une IA plus tard)
    const keywords = "Veste" 

    return new Response(
      JSON.stringify({ keywords }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})