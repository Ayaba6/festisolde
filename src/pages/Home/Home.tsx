import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Send } from 'lucide-react'

// --- IMPORTATION DU COMPOSANT EXTERNE ---
// On utilise le composant que nous avons optimisé ensemble
import HeroSection from './components/HeroSection' 

interface Product {
  id: string
  title: string
  price: number
  images: string[]
}

export default function Home() {
  const [flashProducts, setFlashProducts] = useState<Product[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      setLoading(true)
      const [flashRes, featuredRes] = await Promise.all([
        supabase.from('products').select('id, title, price, images').order('created_at', { ascending: false }).limit(4),
        supabase.from('products').select('id, title, price, images').order('created_at', { ascending: false }).range(4, 7)
      ])

      if (flashRes.data) setFlashProducts(flashRes.data)
      if (featuredRes.data) setFeaturedProducts(featuredRes.data)
    } catch (error) {
      console.error("Erreur chargement:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async () => {
    if (!email || !email.includes('@')) return alert('Email invalide.')
    alert('Inscription réussie !')
    setEmail('')
  }

  return (
    <div className="bg-white min-h-screen">
      {/* 1. HERO SECTION (Importée de components/HeroSection) */}
      <HeroSection />

      {/* 2. REASSURANCE / FEATURES */}
      <FeaturesSection />

      {/* 3. OFFRES FLASH */}
      <ProductSection 
        title="Offres Flash" 
        subtitle="Dépêchez-vous, les stocks sont limités !"
        products={flashProducts} 
        loading={loading} 
        badge="Promo"
      />

      {/* 4. CATÉGORIES */}
      <CategoriesSection />

      {/* 5. PRODUITS VEDETTE */}
      <ProductSection 
        title="Produits en Vedette" 
        subtitle="La sélection haut de gamme de la semaine"
        products={featuredProducts} 
        loading={loading} 
        bgColor="bg-gray-50"
      />

      {/* 6. NEWSLETTER */}
      <NewsletterSection 
        email={email} 
        setEmail={setEmail} 
        onSubscribe={handleSubscribe} 
      />
    </div>
  )
}

// --- SOUS-COMPOSANTS INTERNES ---

function ProductCard({ product }: { product: Product }) {
  const formattedPrice = new Intl.NumberFormat('fr-FR', { 
    style: 'currency', currency: 'XOF', minimumFractionDigits: 0 
  }).format(product.price)

  return (
    <Link to={`/product/${product.id}`} className="group flex flex-col">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-gray-100 mb-4 border border-gray-100 transition-all group-hover:shadow-xl text-center">
        <img
          src={product.images?.[0] || '/placeholder.png'}
          alt={product.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
      </div>
      <h3 className="font-bold text-gray-900 truncate mb-1">{product.title}</h3>
      <p className="text-indigo-600 font-black text-xl">{formattedPrice}</p>
    </Link>
  )
}

function ProductSection({ title, subtitle, products, loading, bgColor = "bg-white" }: any) {
  return (
    <section className={`py-24 px-6 ${bgColor}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 text-left">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mb-3 tracking-tighter">{title}</h2>
            <p className="text-gray-500 font-medium">{subtitle}</p>
          </div>
          <Link to="/products" className="font-bold text-indigo-600 flex items-center gap-2 hover:underline shrink-0">
            Voir tout le catalogue <ArrowRight size={20} />
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => <div key={i} className="aspect-square bg-gray-200 rounded-3xl animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((p: Product) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </section>
  )
}

const CategoriesSection = () => (
  <section className="py-24 px-6 bg-white border-y border-gray-100">
    <div className="max-w-7xl mx-auto text-center">
      <h2 className="text-3xl font-black mb-16 tracking-tight">Parcourir par catégories</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {['Électronique', 'Mode & Beauté', 'Maison & Déco'].map(cat => (
          <Link key={cat} to={`/category/${cat.toLowerCase()}`} className="relative group overflow-hidden rounded-[2.5rem] bg-indigo-50 p-12 hover:bg-indigo-100 transition-all duration-500">
            <span className="relative z-10 block text-2xl font-black text-indigo-900">{cat}</span>
            <div className="absolute -bottom-4 -right-4 text-indigo-200/50 scale-150 rotate-12 group-hover:scale-[1.8] transition-transform duration-500">
                <Sparkles size={100} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
)

const NewsletterSection = ({ email, setEmail, onSubscribe }: any) => (
  <section className="py-24 px-6">
    <div className="max-w-5xl mx-auto bg-indigo-950 rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-900/20">
      <div className="relative z-10">
        <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Prêt pour les prochaines soldes ?</h2>
        <p className="text-indigo-200 mb-12 max-w-md mx-auto font-medium text-lg">Rejoignez 5000+ abonnés et recevez les codes promos en exclusivité.</p>
        <div className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
          <input 
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            className="flex-1 px-6 py-5 rounded-2xl text-gray-900 font-bold outline-none border-4 border-transparent focus:border-indigo-500 transition-all" 
            placeholder="votre@email.com"
          />
          <button onClick={onSubscribe} className="bg-indigo-600 px-8 py-5 rounded-2xl font-black hover:bg-indigo-500 flex items-center justify-center gap-2 transition-all">
            S'ABONNER <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  </section>
)

const FeaturesSection = () => (
  <section className="py-12 bg-white border-b border-gray-100">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 px-6">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 text-2xl">⚡</div>
        <div><h4 className="font-black text-gray-900">Livraison Express</h4><p className="text-sm font-medium text-gray-500">Ouaga & Bobo en 24h</p></div>
      </div>
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 text-2xl">🛡️</div>
        <div><h4 className="font-black text-gray-900">Sécurité Totale</h4><p className="text-sm font-medium text-gray-500">Paiement à la livraison</p></div>
      </div>
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 text-2xl">🤝</div>
        <div><h4 className="font-black text-gray-900">Support Client</h4><p className="text-sm font-medium text-gray-500">7j/7 de 8h à 20h</p></div>
      </div>
    </div>
  </section>
)