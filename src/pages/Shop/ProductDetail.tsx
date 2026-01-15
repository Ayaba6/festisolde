import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { ArrowLeft, ShoppingCart, ShieldCheck, Truck, RotateCcw, Minus, Plus, Check } from 'lucide-react'
import { toast } from 'sonner' // Importez toast pour un feedback premium

export default function ProductDetail({ setCart }: { setCart: any }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        // Spécifier les colonnes évite les surprises si la DB change
        const { data, error } = await supabase
          .from('products')
          .select('id, title, description, price, promo_price, images, category, stock')
          .eq('id', id)
          .single()
        
        if (error) throw error
        setProduct(data)
      } catch (err: any) {
        console.error("Erreur de chargement produit:", err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-gray-100 border-t-[#FF5A5A] rounded-full animate-spin"></div>
    </div>
  )

  if (!product) return <div className="p-20 text-center font-bold text-gray-400">Produit introuvable.</div>

  const discount = product.promo_price 
    ? Math.round(((product.price - product.promo_price) / product.price) * 100) 
    : null
  
  const savings = product.promo_price ? product.price - product.promo_price : 0

  const handleAddToCart = () => {
    setIsAdding(true)
    
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
      localStorage.setItem('festi-cart', JSON.stringify(newCart))
      return newCart
    })

    // Feedback utilisateur
    toast.success(`${product.title} ajouté au panier !`)
    
    setTimeout(() => setIsAdding(false), 1000)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 lg:py-16 bg-white">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold mb-8 transition-colors text-sm group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        
        {/* IMAGE */}
        <div className="relative rounded-[3rem] overflow-hidden bg-[#F9FAFB] aspect-square border border-gray-50 group">
          <img 
            src={product.images?.[0] || '/placeholder.png'} 
            alt={product.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          />
          {discount && (
            <div className="absolute top-6 left-6 bg-[#FF5A5A] text-white font-black px-4 py-1.5 rounded-2xl text-xs shadow-xl">
              -{discount}%
            </div>
          )}
        </div>

        {/* CONTENU */}
        <div className="flex flex-col pt-2">
          <div className="mb-4">
            <span className="text-[10px] font-black text-[#FF5A5A] bg-rose-50 px-3 py-1 rounded-full uppercase tracking-widest border border-rose-100">
              {product.category || 'Premium'}
            </span>
          </div>

          <h1 className="text-4xl font-black text-gray-900 leading-tight mb-4 tracking-tighter">
            {product.title}
          </h1>

          <p className="text-gray-500 text-[15px] font-medium leading-relaxed mb-8 max-w-md">
            {product.description || "Sélection exclusive FestiSolde pour un style et une qualité inégalés."}
          </p>

          {/* PRIX */}
          <div className="flex items-center gap-5 mb-8">
            <span className="text-4xl font-black text-gray-900">
              {(product.promo_price || product.price).toLocaleString()} F
            </span>
            {product.promo_price && (
              <div className="flex flex-col">
                <span className="text-lg text-gray-300 line-through font-bold decoration-[#FF5A5A]/30">
                  {product.price.toLocaleString()} F
                </span>
                <span className="text-[#27AE60] text-[10px] font-black uppercase tracking-tighter">
                  Économie: {savings.toLocaleString()} F
                </span>
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
            <div className="flex items-center border-2 border-gray-50 rounded-[1.5rem] p-1.5 bg-gray-50/50 w-full sm:w-auto">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-12 h-12 flex items-center justify-center bg-white shadow-sm rounded-xl text-gray-900 hover:text-[#FF5A5A] transition-all"
              >
                <Minus size={18} />
              </button>
              <span className="font-black text-lg px-8 tabular-nums">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="w-12 h-12 flex items-center justify-center bg-white shadow-sm rounded-xl text-gray-900 hover:text-[#FF5A5A] transition-all"
              >
                <Plus size={18} />
              </button>
            </div>

            <button 
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`w-full sm:flex-grow py-5 rounded-[1.5rem] font-black text-[15px] shadow-xl transition-all flex items-center justify-center gap-3 ${
                isAdding 
                ? 'bg-emerald-500 text-white shadow-emerald-100' 
                : 'bg-gray-900 text-white shadow-gray-200 hover:bg-[#FF5A5A] hover:shadow-rose-200 active:scale-95'
              }`}
            >
              {isAdding ? <><Check size={20} /> Ajouté !</> : <><ShoppingCart size={20} /> Ajouter au panier</>}
            </button>
          </div>

          {/* REASSURANCE */}
          <div className="grid grid-cols-3 gap-6 pt-10 border-t border-gray-100">
            {[
              { icon: <Truck size={20} />, label: "Livraison", sub: "Express" },
              { icon: <ShieldCheck size={20} />, label: "Garantie", sub: "Sécurisée" },
              { icon: <RotateCcw size={20} />, label: "Retours", sub: "30 jours" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-2">
                <div className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-900 rounded-2xl">
                  {item.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-900 uppercase tracking-tighter">{item.label}</span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase">{item.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}