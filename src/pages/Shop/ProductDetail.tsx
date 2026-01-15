import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { ArrowLeft, ShoppingCart, ShieldCheck, Truck, RotateCcw, Minus, Plus, Check, Star } from 'lucide-react'
import { toast } from 'sonner'

export default function ProductDetail({ setCart }: { setCart: any }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) throw error
        setProduct(data)
      } catch (err: any) {
        console.error("Erreur:", err.message)
        toast.error("Impossible de charger le produit")
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
    window.scrollTo(0, 0) // Remonte en haut de page à l'ouverture
  }, [id])

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-gray-100 border-t-brand-primary rounded-full animate-spin"></div>
    </div>
  )

  if (!product) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <p className="font-black text-gray-400 text-xl uppercase tracking-widest">Produit introuvable</p>
      <button onClick={() => navigate('/products')} className="text-brand-primary font-bold underline">Retour à la boutique</button>
    </div>
  )

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

    toast.success(`${product.title} ajouté !`, {
      description: `${quantity} article(s) ajouté(s) au panier`,
      icon: <ShoppingCart size={16} />,
    })
    
    setTimeout(() => setIsAdding(false), 1500)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8 lg:py-12">
        
        {/* FIL D'ARIANE / RETOUR */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-400 hover:text-gray-900 font-bold mb-8 transition-colors text-xs uppercase tracking-widest group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          Retour aux offres
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          
          {/* COLONNE GAUCHE : VISUELS (5/12) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative rounded-[2.5rem] overflow-hidden bg-gray-50 aspect-square border border-gray-100 group">
              <img 
                src={product.images?.[selectedImage] || '/placeholder.png'} 
                alt={product.title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
              />
              {discount && (
                <div className="absolute top-6 left-6 bg-brand-primary text-white font-black px-4 py-2 rounded-2xl text-[10px] uppercase tracking-widest shadow-2xl animate-bounce">
                  OFFRE LIMITÉE -{discount}%
                </div>
              )}
            </div>
            
            {/* MINIATURES (si plusieurs images) */}
            {product.images?.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img: string, idx: number) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-brand-primary' : 'border-transparent opacity-60'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COLONNE DROITE : INFOS (7/12) */}
          <div className="lg:col-span-6 flex flex-col pt-4">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[10px] font-black text-brand-primary bg-brand-primary/5 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border border-brand-primary/10">
                {product.category || 'Collection Officielle'}
              </span>
              {product.stock <= 5 && product.stock > 0 && (
                <span className="text-[10px] font-bold text-amber-600 animate-pulse">
                  Plus que {product.stock} en stock !
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.1] mb-6 tracking-tighter">
              {product.title}
            </h1>

            <div className="flex items-center gap-1 mb-8">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
              ))}
              <span className="text-xs font-bold text-gray-400 ml-2">(12 avis clients)</span>
            </div>

            <p className="text-gray-500 text-lg leading-relaxed mb-10">
              {product.description || "Une pièce d'exception sélectionnée par FestiSolde pour sa qualité et son design unique au Burkina Faso."}
            </p>

            {/* BOX DE PRIX ET ACHAT */}
            <div className="bg-gray-50 rounded-[2.5rem] p-8 mb-10 border border-gray-100">
              <div className="flex items-end gap-4 mb-8">
                <span className="text-5xl font-black text-gray-900 tracking-tighter">
                  {(product.promo_price || product.price).toLocaleString()} <small className="text-xl">F</small>
                </span>
                {product.promo_price && (
                  <div className="flex flex-col mb-1">
                    <span className="text-xl text-gray-300 line-through font-bold">
                      {product.price.toLocaleString()} F
                    </span>
                    <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                      Économisez {(product.price - product.promo_price).toLocaleString()} F
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row items-center gap-4">
                {/* SÉLECTEUR QUANTITÉ */}
                <div className="flex items-center border-2 border-white rounded-[1.5rem] p-1 bg-white shadow-sm w-full md:w-auto">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-12 h-12 flex items-center justify-center rounded-xl text-gray-400 hover:text-brand-primary transition-all"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="font-black text-xl px-8 tabular-nums text-gray-900">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="w-12 h-12 flex items-center justify-center rounded-xl text-gray-400 hover:text-brand-primary transition-all"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                {/* BOUTON PANIER */}
                <button 
                  onClick={handleAddToCart}
                  disabled={isAdding || product.stock === 0}
                  className={`flex-1 w-full py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-3 ${
                    isAdding 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-gray-900 text-white hover:bg-brand-primary active:scale-95'
                  } disabled:bg-gray-200 disabled:cursor-not-allowed`}
                >
                  {isAdding ? <><Check size={20} /> Article ajouté</> : <><ShoppingCart size={20} /> Ajouter au panier</>}
                </button>
              </div>
            </div>

            {/* REASSURANCE */}
            <div className="flex flex-wrap gap-8 py-6 border-t border-gray-100">
               <Feature icon={<Truck size={18}/>} title="Livraison" desc="24h Ouaga" />
               <Feature icon={<ShieldCheck size={18}/>} title="Certifié" desc="Qualité Pro" />
               <Feature icon={<RotateCcw size={18}/>} title="Échange" desc="7 jours" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Feature({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900">
        {icon}
      </div>
      <div>
        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-900">{title}</h4>
        <p className="text-[10px] text-gray-400 font-bold">{desc}</p>
      </div>
    </div>
  )
}