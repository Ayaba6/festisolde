import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function Orders() {
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    async function loadVendor() {
      const user = supabase.auth.user()
      if (!user) return
      const { data } = await supabase.from('vendors').select('id').eq('user_id', user.id).single()
      if (data) setVendorId(data.id)
    }
    loadVendor()
  }, [])

  useEffect(() => {
    if (!vendorId) return
    async function loadOrders() {
      const { data } = await supabase
        .from('order_items')
        .select('id, quantity, price, products(nom), orders(status, created_at)')
        .eq('vendor_id', vendorId)
      setOrders(data || [])
    }
    loadOrders()
  }, [vendorId])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold">Mes commandes</h2>
      {orders.map(o => (
        <div key={o.id} className="flex items-center justify-between p-4 bg-white rounded shadow">
          <div>
            <h3 className="font-bold">{o.products.nom}</h3>
            <p className="text-gray-500">Quantité : {o.quantity}</p>
            <p className="text-gray-500">Total : {o.price * o.quantity} €</p>
            <p className="text-gray-400 text-sm">Statut : {o.orders.status}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
