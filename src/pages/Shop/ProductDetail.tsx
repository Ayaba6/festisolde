import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { ArrowLeft, ShoppingCart, ShieldCheck, Truck, RotateCcw, Minus, Plus, Check } from 'lucide-react'

export default function ProductDetail({ setCart }: { setCart: any }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await supabase.from('products').select('*').eq('id', id).single()
      setProduct(data)
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-indigo-600 animate-pulse text-2xl tracking-tighter">
      CHARGEMENT DU PRODUIT...
    </div>
  )
  if (!product) return <div className="p-20 text-center font-bold">Produit introuvable.</div>

  const discount = product.promo_price 
    ? Math.round(((product.price - product.promo_price) / product.price) * 100) 
    : null
  
  const savings = product.promo_price ? product.price - product.promo_price : 0

  const handleAddToCart = () => {
    setCart((prev: any) => {
      const existing = prev.find((item: any) => item.id === product.id)
      if (existing) {
        return prev.map((item: any) => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        )
      }
      return [...prev, { ...product, quantity: quantity }]
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Bouton Retour */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold mb-8 transition-colors group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> 
        Retour à la boutique
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        
        {/* COLONNE GAUCHE : IMAGE */}
        <div className="relative rounded-[2rem] overflow-hidden bg-white border border-gray-100 shadow-sm aspect-square md:aspect-auto md:h-[600px]">
          <img 
            src={product.images?.[0] || '/placeholder.png'} 
            alt={product.title} 
            className="w-full h-full object-cover" 
          />
          {discount && (
            <div className="absolute top-6 left-6 bg-[#FF5A5A] text-white font-black px-4 py-2 rounded-xl shadow-lg text-lg">
              -{discount}%
            </div>
          )}
        </div>

        {/* COLONNE DROITE : INFOS */}
        <div className="flex flex-col">
          {/* Catégorie */}
          <div className="mb-4">
            <span className="bg-gray-50 text-gray-400 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-lg border border-gray-100">
              {product.category}
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-[#1A1A1A] tracking-tighter mb-6">
            {product.title}
          </h1>

          <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-lg">
            {product.description || "Description de haute qualité pour ce produit exceptionnel disponible sur FestiSolde."}
          </p>

          {/* SECTION PRIX */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-5xl font-black text-[#FF5A5A]">
              {(product.promo_price || product.price).toLocaleString()} <small className="text-xl">€</small>
            </span>
            {product.promo_price && (
              <>
                <span className="text-2xl text-gray-300 line-through font-bold">
                  {product.price.toLocaleString()} €
                </span>
                <span className="bg-[#E8F8F0] text-[#27AE60] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#D1F2E1]">
                  Économisez {savings.toLocaleString()} €
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 mb-10 text-[#27AE60] font-bold">
            <Check size={20} /> En stock
          </div>

          {/* SÉLECTEUR DE QUANTITÉ ET BOUTON */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <div className="flex items-center justify-between border-2 border-gray-100 rounded-2xl p-2 min-w-[140px]">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl transition-colors"
              >
                <Minus size={18} />
              </button>
              <span className="font-black text-xl">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>

            <button 
              onClick={handleAddToCart}
              className="flex-grow bg-gradient-to-r from-[#FF5A5A] to-[#FF7B7B] text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-red-100 hover:shadow-red-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
            >
              <ShoppingCart size={24} /> Ajouter au panier
            </button>
          </div>

          {/* RÉASSURANCE LIVRAISON */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl">
                <Truck size={24} />
              </div>
              <span className="text-xs font-bold text-gray-500 leading-tight">Livraison<br/>rapide</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl">
                <ShieldCheck size={24} />
              </div>
              <span className="text-xs font-bold text-gray-500 leading-tight">Paiement<br/>sécurisé</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl">
                <RotateCcw size={24} />
              </div>
              <span className="text-xs font-bold text-gray-500 leading-tight">Retour<br/>30 jours</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}