// Paiement en ligne (LigdiCash) : désactivé tant que le compte marchand n'est pas actif.
// Pour l'activer : VITE_ONLINE_PAYMENT=true dans Vercel, puis redéployer.
export const ONLINE_PAYMENT = import.meta.env.VITE_ONLINE_PAYMENT === 'true';
