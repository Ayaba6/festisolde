import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, ShoppingCart, ShieldCheck, Truck, 
  RotateCcw, Minus, Plus, Check, Star, Share2 
} from 'lucide-react'
import { toast } from 'sonner'

// --- COMPOSANT PRODUITS SIMILAIRES ---
function SimilarProducts({ category, currentProductId }: { category: string, currentProductId: string }) {
  const [similar, setSimilar] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchSimilar() {
      try {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('category', category)
          .neq('id', currentProductId)
          .limit(4)
        
        setSimilar(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    if (category) fetchSimilar()
  }, [category, currentProductId])

  if (loading || similar.length === 0) return null

  return (
    <div className="mt-20">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic">
          Complétez votre <span className="text-brand-primary">style</span>
        </h3>
        <div className="h-px flex-1 bg-slate-200 ml-8 hidden md:block opacity-30"></div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
        {similar.map((item) => (
          <div 
            key={item.id} 
            onClick={() => {
              navigate(`/product/${item.id}`)
              window.scrollTo(0, 0)
            }}
            className="group cursor-pointer"
          >
            <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-white border border-slate-100 mb-4 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-500">
              <img 
                src={item.images?.[0] || '/placeholder.png'} 
                alt={item.title || ''} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
            </div>
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm truncate px-2 group-hover:text-brand-primary transition-colors uppercase">
              {item.title || 'Produit'}
            </h4>
            <p className="font-black text-brand-primary px-2 text-sm sm:text-base">
              {Number(item.promo_price || item.price || 0).toLocaleString()} F
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- COMPOSANT PRINCIPAL ---
export default function ProductDetail({ setCart }: { setCart: any }) {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')

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
        if (data?.sizes?.length > 0) setSelectedSize(data.sizes[0])
        if (data?.colors?.length > 0) setSelectedColor(data.colors[0])
        
      } catch (err: any) {
        console.error("Erreur:", err)
        toast.error("Impossible de charger le produit")
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
    window.scrollTo(0, 0)
  }, [id])

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-brand-primary rounded-full animate-spin"></div>
    </div>
  )

  if (!product) return null

  const price = Number(product.price || 0)
  const promoPrice = Number(product.promo_price || 0)
  const displayPrice = (promoPrice > 0) ? promoPrice : price
  const hasDiscount = promoPrice > 0 && promoPrice < price
  const discountPercent = hasDiscount ? Math.round(((price - promoPrice) / price) * 100) : null

  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) return toast.error("Choisissez une taille")
    if (product.colors?.length > 0 && !selectedColor) return toast.error("Choisissez une couleur")

    setIsAdding(true)
    setCart((prev: any) => {
      const variantId = `${product.id}-${selectedSize}-${selectedColor}`
      const existing = prev.find((item: any) => item.variantId === variantId)
      
      let newCart;
      if (existing) {
        newCart = prev.map((item: any) => 
          item.variantId === variantId ? { ...item, quantity: item.quantity + quantity } : item
        )
      } else {
        newCart = [...prev, { 
          ...product, 
          variantId, 
          selectedSize, 
          selectedColor, 
          quantity,
          displayPrice 
        }]
      }
      localStorage.setItem('festi-cart', JSON.stringify(newCart))
      return newCart
    })

    toast.success(`${product.title} ajouté !`)
    setTimeout(() => setIsAdding(false), 1500)
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-10">
        
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-brand-primary font-bold text-[10px] uppercase tracking-widest group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Retour
          </button>
          <button className="p-2.5 bg-white rounded-full shadow-sm text-slate-400 hover:text-brand-primary transition-colors"><Share2 size={18} /></button>
        </div>

        <div className="bg-white p-4 lg:p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* --- SECTION IMAGES ANIMÉE --- */}
            <div className="lg:col-span-6 space-y-6">
              <div className="relative rounded-[2rem] overflow-hidden bg-slate-50 aspect-square border border-slate-100">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={selectedImage}
                    src={product.images?.[selectedImage] || '/placeholder.png'}
                    initial={{ opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                
                {discountPercent && (
                  <div className="absolute top-6 left-6 bg-brand-primary text-white font-black px-4 py-2 rounded-2xl text-[11px] shadow-xl animate-pulse z-10">
                    -{discountPercent}% PROMO
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {product.images?.map((img: string, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedImage(idx)} 
                    className={`min-w-[80px] h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === idx ? 'border-brand-primary scale-105 shadow-md' : 'border-transparent opacity-40'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>

            {/* --- SECTION CONTENU --- */}
            <div className="lg:col-span-6 flex flex-col pt-4">
              <span className="text-[10px] font-black text-brand-primary bg-brand-primary/10 px-4 py-1.5 rounded-full uppercase tracking-widest w-fit mb-4">
                {product.category || 'Collection'}
              </span>

              <h1 className="text-3xl lg:text-5xl font-black text-slate-900 leading-tight mb-4 tracking-tighter uppercase italic">
                {product.title || 'Sans titre'}
              </h1>

              <div className="flex items-center gap-2 mb-6">
                <div className="flex text-amber-400">{[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}</div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avis certifiés</span>
              </div>

              <p className="text-slate-500 text-sm leading-relaxed mb-8">{product.description}</p>

              {/* COULEURS AVEC SYNC IMAGE */}
              {product.colors?.length > 0 && (
                <div className="mb-6">
                  <p className="text-[11px] font-black uppercase text-slate-400 mb-3 tracking-widest">Couleurs disponibles</p>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color: string, idx: number) => (
                      <button 
                        key={color} 
                        onClick={() => {
                          setSelectedColor(color);
                          if (product.images?.[idx]) setSelectedImage(idx);
                        }} 
                        className={`group px-5 py-3 rounded-2xl font-black text-[10px] uppercase border-2 transition-all flex items-center gap-3 ${
                          selectedColor === color 
                          ? 'border-brand-primary bg-brand-primary/5 text-brand-primary shadow-sm' 
                          : 'border-slate-100 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-current opacity-50 group-hover:scale-125 transition-transform" />
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* TAILLES */}
              {product.sizes?.length > 0 && (
                <div className="mb-8">
                  <p className="text-[11px] font-black uppercase text-slate-400 mb-3 tracking-widest">Choisir Taille</p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size: string) => (
                      <button 
                        key={size} 
                        onClick={() => setSelectedSize(size)} 
                        className={`h-12 min-w-[3.5rem] px-4 rounded-xl font-black text-xs border-2 transition-all ${
                          selectedSize === size ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PRIX ET ACHAT */}
              <div className="bg-slate-50 rounded-[2.5rem] p-6 lg:p-8 border border-slate-100 mb-8">
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">
                    {displayPrice.toLocaleString()} <small className="text-lg uppercase">F</small>
                  </span>
                  {hasDiscount && <span className="text-xl text-slate-300 line-through font-bold">{price.toLocaleString()} F</span>}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center bg-white rounded-2xl p-1 shadow-sm border border-slate-100">
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-12 h-12 text-slate-400 hover:text-brand-primary transition-colors"><Minus size={18} /></button>
                    <span className="font-black text-xl px-6 tabular-nums text-slate-900">{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} className="w-12 h-12 text-slate-400 hover:text-brand-primary transition-colors"><Plus size={18} /></button>
                  </div>
                  
                  <button 
                    onClick={handleAddToCart} 
                    disabled={isAdding} 
                    className={`flex-1 py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                      isAdding ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-900 text-white hover:bg-brand-primary active:scale-95 shadow-xl shadow-slate-200'
                    }`}
                  >
                    {isAdding ? <Check size={18} strokeWidth={3} /> : <ShoppingCart size={18} />} 
                    {isAdding ? 'Ajouté !' : 'Ajouter au Panier'}
                  </button>
                </div>
              </div>

              {/* FEATURES */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                 <div className="flex items-center gap-3"><Truck size={20} className="text-brand-primary" /><div className="text-[10px] font-black uppercase text-slate-900 leading-tight">Livraison 24h<br/><span className="text-slate-400 font-bold">Burkina Faso</span></div></div>
                 <div className="flex items-center gap-3"><ShieldCheck size={20} className="text-brand-primary" /><div className="text-[10px] font-black uppercase text-slate-900 leading-tight">Certifié<br/><span className="text-slate-400 font-bold">Qualité Pro</span></div></div>
                 <div className="flex items-center gap-3"><RotateCcw size={20} className="text-brand-primary" /><div className="text-[10px] font-black uppercase text-slate-900 leading-tight">Échange<br/><span className="text-slate-400 font-bold">7 Jours</span></div></div>
              </div>
            </div>
          </div>

          <SimilarProducts category={product.category} currentProductId={product.id} />
        </div>
      </div>
    </div>
  )
}