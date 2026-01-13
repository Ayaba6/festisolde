import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Link } from 'react-router-dom'
import { ArrowRight, Send, Star, ChevronRight, ShoppingCart, Mail, Gift, CheckCircle2 } from 'lucide-react'

// --- COMPOSANTS EXTERNES ---
import HeroSection from './components/HeroSection' 
import TrustSection from './components/TrustSection'
import FlashDeals from './components/FlashDeals'

interface Product {
  id: string
  title: string
  price: number
  old_price?: number
  category: string
  images: string[]
  rating?: number
  reviews_count?: number
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { 
    fetchHomeData();
    // Script d'auto-sauvegarde du panier (Instructions utilisateur du 2026-01-13)
    const handleSaveCart = () => {
       const currentCart = localStorage.getItem('shopping-cart');
       if (currentCart) localStorage.setItem('festi_cart_backup', currentCart);
    };
    window.addEventListener('beforeunload', handleSaveCart);
    return () => window.removeEventListener('beforeunload', handleSaveCart);
  }, [])

  const fetchHomeData = async () => {
    try {
      setLoading(true)
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .range(0, 3)
      
      if (data) setFeaturedProducts(data)
    } catch (error) {
      console.error("Erreur chargement:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white min-h-screen">
      <HeroSection />
      <TrustSection />
      <FlashDeals />

      {/* 4. EXPLORER PAR CATÉGORIE (Design festi10.PNG) */}
      <CategoriesSection />

      {/* 5. PRODUITS VEDETTE (Design festi5.PNG) */}
      <ProductSection 
        title="Produits en Vedette" 
        subtitle="Notre sélection des meilleures offres, choisies pour leur qualité exceptionnelle"
        products={featuredProducts} 
        loading={loading} 
        badge="Vedette"
        bgColor="bg-gray-50/50"
      />

      {/* 6. NEWSLETTER OPTIMISÉE (Design festi8.PNG) */}
      <NewsletterSection />
    </div>
  )
}

// --- CATEGORIES SECTION (Design exact festi10.PNG) ---
const CategoriesSection = () => {
  const cats = [
    { name: 'Mode & Vêtements', promo: 'Jusqu\'à -60%', color: 'from-rose-500/80 to-pink-600/90', img: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8' },
    { name: 'Électronique', promo: 'Jusqu\'à -50%', color: 'from-blue-600/80 to-indigo-700/90', img: 'https://images.unsplash.com/photo-1498049794561-7780e7231661' },
    { name: 'Maison & Déco', promo: 'Jusqu\'à -45%', color: 'from-orange-400/80 to-red-500/90', img: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a' }
  ]

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-4">Explorer par catégorie</h2>
          <p className="text-gray-500 font-bold text-lg">Trouvez les meilleures offres dans votre catégorie préférée</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cats.map(cat => (
            <Link key={cat.name} to="/products" className="relative group h-80 overflow-hidden rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500">
              <img src={cat.img} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="" />
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-90 group-hover:opacity-95 transition-opacity`} />
              <div className="absolute inset-0 p-10 flex flex-col justify-end text-left text-white">
                <span className="text-xs font-black uppercase tracking-widest mb-2 opacity-80">{cat.promo}</span>
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-black leading-tight tracking-tight">{cat.name}</h3>
                  <div className="bg-white/20 p-2 rounded-full backdrop-blur-md translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// --- PRODUCT CARD (Style festi5.PNG) ---
function ProductCard({ product, badge }: { product: Product, badge?: string }) {
  return (
    <div className="group bg-white rounded-[2.5rem] p-4 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col h-full text-left">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#F9FAFB] mb-6">
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <div className="bg-[#FF5A5A] text-white text-[11px] font-black px-3 py-1.5 rounded-lg shadow-lg">-50%</div>
          {badge && (
            <div className="bg-[#FFB800] text-white text-[10px] font-black px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-lg">
              <Star size={10} fill="currentColor" /> {badge.toUpperCase()}
            </div>
          )}
        </div>
        
        <Link to={`/product/${product.id}`}>
          <img src={product.images?.[0] || '/placeholder.png'} alt={product.title} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000" />
        </Link>
      </div>

      <div className="px-2 flex flex-col flex-grow">
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className={i < (product.rating || 5) ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
          ))}
          <span className="text-[12px] font-bold text-gray-400 ml-1">({product.reviews_count || 128})</span>
        </div>

        <h3 className="font-black text-gray-900 text-lg mb-4 line-clamp-2">{product.title}</h3>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-[#FF5A5A]">{product.price} €</span>
            <span className="text-sm text-gray-300 line-through font-bold">{product.old_price || product.price * 2} €</span>
          </div>
          <button className="bg-gray-900 text-white p-4 rounded-2xl hover:bg-[#FF5A5A] transition-all shadow-lg">
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

// --- PRODUCT SECTION ---
function ProductSection({ title, subtitle, products, loading, badge, bgColor }: any) {
  return (
    <section className={`py-24 px-6 ${bgColor}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="text-left">
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 tracking-tighter">{title}</h2>
            <p className="text-gray-500 font-bold text-lg max-w-xl">{subtitle}</p>
          </div>
          <Link to="/products" className="group h-fit px-8 py-4 bg-white border border-gray-200 text-gray-900 rounded-2xl font-black flex items-center gap-3 hover:bg-gray-900 hover:text-white transition-all">
            Voir tout <ArrowRight size={20} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {loading ? [1,2,3,4].map(i => <div key={i} className="aspect-[4/5] bg-gray-100 animate-pulse rounded-[2.5rem]" />)
                   : products.map((p: Product) => <ProductCard key={p.id} product={p} badge={badge} />)}
        </div>
      </div>
    </section>
  )
}

// --- NEWSLETTER SECTION (Optimisée style festi8.PNG) ---
const NewsletterSection = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    setTimeout(() => {
      setStatus('success')
      setEmail('')
      setTimeout(() => setStatus('idle'), 5000)
    }, 1500)
  }

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto bg-[#0F1115] rounded-[4rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
        {/* Motif à pois et lueurs */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5A5A]/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        
        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Badge Offre de Bienvenue */}
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-2xl mb-8">
            <Gift size={18} className="text-[#FF5A5A]" />
            <span className="text-xs font-black tracking-widest uppercase">10% de réduction sur votre première commande</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter leading-tight">
            Prêt pour les <br/><span className="text-[#FF5A5A]">prochaines soldes ?</span>
          </h2>
          <p className="text-gray-400 mb-12 font-bold text-lg leading-relaxed">
            Inscrivez-vous à notre newsletter et recevez votre code promo exclusif, ainsi que nos meilleures offres en avant-première.
          </p>

          {status === 'success' ? (
            <div className="animate-in zoom-in duration-300 flex flex-col items-center">
              <CheckCircle2 size={48} className="text-emerald-400 mb-4" />
              <p className="text-xl font-black">Merci ! Vérifiez vos emails.</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-2xl px-6 focus-within:border-[#FF5A5A] transition-all">
                <Mail size={20} className="text-gray-500" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required
                  className="w-full py-5 px-4 bg-transparent text-white font-bold outline-none" 
                  placeholder="Votre adresse email" 
                />
              </div>
              <button type="submit" disabled={status === 'loading'} className="bg-[#FF5A5A] px-10 py-5 rounded-2xl font-black hover:bg-[#ff4444] flex items-center justify-center gap-2 transition-all shadow-xl shadow-rose-950/20 active:scale-95 disabled:opacity-50">
                {status === 'loading' ? 'CHARGEMENT...' : <>S'INSCRIRE <Send size={20} /></>}
              </button>
            </form>
          )}
          <p className="mt-8 text-[11px] font-medium text-gray-500 uppercase tracking-widest">
            🔒 Désinscription possible à tout moment.
          </p>
        </div>
      </div>
    </section>
  )
}