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
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-100 border-t-[#FF5A5A] rounded-full animate-spin"></div>
      </div>
    </div>
  )

  if (!product) return <div className="p-20 text-center font-medium text-gray-400">Produit introuvable.</div>

  const discount = product.promo_price 
    ? Math.round(((product.price - product.promo_price) / product.price) * 100) 
    : null
  
  const savings = product.promo_price ? product.price - product.promo_price : 0

  const handleAddToCart = () => {
    setCart((prev: any) => {
      const existing = prev.find((item: any) => item.id === product.id)
      let newCart;
      if (existing) {
        newCart = prev.map((item: any) => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        )
      } else {
        newCart = [...prev, { ...product, quantity: quantity }]
      }
      // Sauvegarde automatique dans le localStorage
      localStorage.setItem('festi-cart', JSON.stringify(newCart))
      return newCart
    })
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 lg:py-16 bg-white">
      {/* Bouton Retour discret */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-semibold mb-8 transition-colors text-sm"
      >
        <ArrowLeft size={16} /> Retour
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        
        {/* IMAGE : Bordures arrondies ajustées selon festi9.PNG */}
        <div className="relative rounded-[2.5rem] overflow-hidden bg-[#F9FAFB] aspect-square shadow-sm border border-gray-50">
          <img 
            src={product.images?.[0] || '/placeholder.png'} 
            alt={product.title} 
            className="w-full h-full object-cover" 
          />
          {discount && (
            <div className="absolute top-5 left-5 bg-[#FF5A5A] text-white font-bold px-3 py-1 rounded-lg text-sm shadow-lg">
              -{discount}%
            </div>
          )}
        </div>

        {/* CONTENU : Typographie affinée */}
        <div className="flex flex-col pt-2">
          <div className="mb-4">
            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100 uppercase tracking-wider">
              {product.category || 'Accessoires'}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-[#1A1A1A] leading-tight mb-4 tracking-tight">
            {product.title}
          </h1>

          <p className="text-gray-500 text-[15px] leading-relaxed mb-8 max-w-md">
            {product.description || "Un produit d'exception sélectionné pour sa qualité et sa durabilité."}
          </p>

          {/* PRIX : Style festi9.PNG en FCFA */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-[#FF5A5A]">
              {(product.promo_price || product.price).toLocaleString()} F
            </span>
            {product.promo_price && (
              <div className="flex items-center gap-3">
                <span className="text-lg text-gray-300 line-through font-medium">
                  {product.price.toLocaleString()} F
                </span>
                <span className="bg-[#E8F8F0] text-[#27AE60] text-[11px] font-bold px-2 py-1 rounded-md">
                  Économisez {savings.toLocaleString()} F
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-8 text-[#27AE60] font-bold text-sm">
            <Check size={16} /> En stock
          </div>

          {/* ACTIONS : Sélecteur et Bouton */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
            <div className="flex items-center border border-gray-100 rounded-xl p-1 bg-gray-50 w-full sm:w-auto">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500"
              >
                <Minus size={16} />
              </button>
              <span className="font-bold text-sm px-6">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-white hover:shadow-sm rounded-lg transition-all text-gray-500"
              >
                <Plus size={16} />
              </button>
            </div>

            <button 
              onClick={handleAddToCart}
              className="w-full sm:flex-grow bg-gradient-to-r from-[#FF5A5A] to-[#FF7B7B] text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-rose-100 hover:shadow-rose-200 transition-all flex items-center justify-center gap-3"
            >
              <ShoppingCart size={18} /> Ajouter au panier
            </button>
          </div>

          {/* RASSURANCE : Icônes fines */}
          <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-100">
            <div className="flex flex-col items-center sm:flex-row gap-2">
              <div className="p-2 bg-orange-50 text-orange-400 rounded-lg">
                <Truck size={18} />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Livraison<br/>rapide</span>
            </div>
            <div className="flex flex-col items-center sm:flex-row gap-2">
              <div className="p-2 bg-orange-50 text-orange-400 rounded-lg">
                <ShieldCheck size={18} />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Paiement<br/>sécurisé</span>
            </div>
            <div className="flex flex-col items-center sm:flex-row gap-2">
              <div className="p-2 bg-orange-50 text-orange-400 rounded-lg">
                <RotateCcw size={18} />
              </div>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Retour<br/>30 jours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}