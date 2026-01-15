import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Search, Plus, Star, SlidersHorizontal, Package, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProductCardSkeleton from './ProductCardSkeleton'

// Configuration des catégories
const CATEGORIES = ['Tous', 'Électronique', 'Mode & Beauté', 'Maison & Déco', 'Alimentation', 'Santé', 'Sport', 'Autres']

interface Product {
  id: string
  title: string
  price: number
  promo_price?: number
  images: string[]
  category: string
  stock: number
  is_featured?: boolean
  shop_id: string
}

interface ShopProps {
  cart: any[]
  setCart: React.Dispatch<React.SetStateAction<any[]>>
}

export default function Shop({ cart, setCart }: ShopProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tous')
  const [sortBy, setSortBy] = useState('recent')

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, sortBy])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      let query = supabase.from('products').select('*')

      if (selectedCategory !== 'Tous') {
        query = query.eq('category', selectedCategory)
      }

      // Tri intelligent
      if (sortBy === 'price-asc') query = query.order('price', { ascending: true })
      else if (sortBy === 'price-desc') query = query.order('price', { ascending: false })
      else query = query.order('created_at', { ascending: false })

      const { data, error } = await query
      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      console.error("Erreur boutique:", err)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      let newCart;
      
      if (existingItem) {
        newCart = prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      } else {
        newCart = [...prevCart, { ...product, quantity: 1 }]
      }
      
      // Sauvegarde automatique dans le localStorage
      localStorage.setItem('festi-cart', JSON.stringify(newCart))
      return newCart
    })
  }

  // Filtrage local pour la recherche (très rapide)
  const filteredProducts = products.filter(p => 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* HEADER DE LA BOUTIQUE */}
      <div className="bg-white border-b border-gray-100 pt-10 pb-6">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Boutique</h1>
          <p className="text-gray-500 text-sm font-medium">Découvrez les meilleures offres de Ouagadougou.</p>
        </div>
      </div>

      {/* BARRE DE RECHERCHE ET FILTRES STICKY */}
      <div className="sticky top-[72px] z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Recherche */}
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher un article, une marque..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-brand-primary/20 focus:bg-white focus:ring-4 focus:ring-brand-primary/5 outline-none font-medium transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Tri */}
            <div className="flex items-center bg-gray-50 rounded-2xl px-4 border border-transparent hover:border-gray-200 transition-all">
              <SlidersHorizontal size={16} className="text-gray-400" />
              <select 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent pl-2 pr-4 py-3 font-bold text-[10px] uppercase tracking-widest text-gray-700 outline-none cursor-pointer"
              >
                <option value="recent">Nouveautés</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
            </div>
          </div>

          {/* Catégories (Scroll horizontal sur mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-5 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                  selectedCategory === cat 
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                  : 'bg-white text-gray-400 border border-gray-100 hover:border-brand-primary/30 hover:text-brand-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GRILLE DE PRODUITS */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((product) => (
              <ShopCard 
                key={product.id} 
                product={product} 
                onAddToCart={() => addToCart(product)} 
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <Package size={40} className="text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Aucun résultat</h3>
            <p className="text-gray-500 max-w-xs mx-auto">
              Nous n'avons pas trouvé de produits correspondant à votre recherche. Essayez d'autres mots-clés.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function ShopCard({ product, onAddToCart }: { product: Product, onAddToCart: () => void }) {
  const [added, setAdded] = useState(false)
  
  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    onAddToCart()
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const isOutOfStock = (product.stock || 0) <= 0
  const discount = product.promo_price 
    ? Math.round(((product.price - product.promo_price) / product.price) * 100) 
    : null

  return (
    <div className="group bg-white rounded-[2rem] p-3 border border-transparent hover:border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 flex flex-col h-full">
      {/* IMAGE */}
      <Link to={`/product/${product.id}`} className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-gray-50 block">
        <img 
          src={product.images?.[0] || '/placeholder.png'} 
          alt={product.title}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'grayscale' : ''}`} 
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount && (
            <span className="bg-brand-primary text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-lg">
              -{discount}%
            </span>
          )}
          {product.is_featured && (
            <span className="bg-amber-400 text-white text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-lg">
              TOP <Star size={10} fill="currentColor" />
            </span>
          )}
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-gray-900 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-[0.2em]">Rupture</span>
          </div>
        )}
      </Link>

      {/* INFOS */}
      <div className="pt-5 pb-2 px-2 flex flex-col flex-grow">
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
          {product.category || 'Général'}
        </span>
        
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-3 line-clamp-2 group-hover:text-brand-primary transition-colors h-10">
            {product.title}
          </h3>
        </Link>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            {product.promo_price && (
              <span className="text-[11px] text-gray-400 line-through font-bold mb-0.5">
                {product.price.toLocaleString()} F
              </span>
            )}
            <span className="text-lg font-black text-brand-primary">
              {(product.promo_price || product.price).toLocaleString()} <small className="text-[10px]">FCFA</small>
            </span>
          </div>

          <button 
            disabled={isOutOfStock || added}
            onClick={handleAdd}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              added 
              ? 'bg-emerald-500 text-white' 
              : isOutOfStock 
                ? 'bg-gray-50 text-gray-200 cursor-not-allowed' 
                : 'bg-gray-900 text-white hover:bg-brand-primary shadow-lg shadow-gray-200'
            }`}
          >
            {added ? <Check size={20} /> : <Plus size={20} />}
          </button>
        </div>
      </div>
    </div>
  )
}