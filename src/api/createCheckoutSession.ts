import Stripe from 'stripe'
import { supabase } from '../lib/supabaseClient'

const stripe = new Stripe(import.meta.env.VITE_STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15'
})

export async function createCheckoutSession(userId: string) {
  // Récupérer le panier de l’utilisateur
  const { data: items } = await supabase
    .from('cart_items')
    .select('quantity, products(nom, prix_solde)')
    .eq('user_id', userId)

  if (!items || items.length === 0) throw new Error('Panier vide')

  const line_items = items.map(i => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: i.products.nom
      },
      unit_amount: Math.round(i.products.prix_solde * 100)
    },
    quantity: i.quantity
  }))

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items,
    success_url: `${import.meta.env.VITE_APP_URL}/success`,
    cancel_url: `${import.meta.env.VITE_APP_URL}/cart`
  })

  return session
}
