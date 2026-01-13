import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Search, Plus, Star, SlidersHorizontal, Package } from 'lucide-react'
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
  setCart: (cart: any[]) => void
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
      // Sauvegarde automatique pour éviter l'effacement à la fermeture du navigateur
      localStorage.setItem('festi-cart', JSON.stringify(newCart)) 
      return newCart
    })
  }

  const filteredProducts = products.filter(p => 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-white">
      {/* BARRE DE RECHERCHE ET FILTRES */}
      <div className="sticky top-[72px] z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-row items-center gap-3">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF5A5A] transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher un produit..."
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-[#FF5A5A]/20 focus:bg-white focus:ring-4 focus:ring-[#FF5A5A]/5 outline-none font-medium transition-all text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="relative flex items-center bg-gray-50 rounded-2xl px-3 border border-transparent focus-within:border-gray-200">
                <SlidersHorizontal size={16} className="text-gray-400" />
                <select 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent pl-2 pr-8 py-3 font-bold text-xs uppercase tracking-wider text-gray-700 outline-none appearance-none cursor-pointer"
                >
                  <option value="recent">Nouveautés</option>
                  <option value="price-asc">Prix bas</option>
                  <option value="price-desc">Prix haut</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-5 py-2 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all ${
                    selectedCategory === cat 
                    ? 'bg-[#FF5A5A] text-white shadow-lg shadow-rose-100' 
                    : 'bg-white text-gray-400 border border-gray-100 hover:text-[#FF5A5A]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GRILLE DE PRODUITS */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {loading ? (
            [...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ShopCard 
                key={product.id} 
                product={product} 
                onAddToCart={() => addToCart(product)} 
              />
            ))
          ) : (
            <div className="col-span-full text-center py-32">
              <div className="inline-flex p-8 bg-gray-50 rounded-full mb-4">
                <Package size={48} className="text-gray-200" />
              </div>
              <p className="text-gray-500 font-bold text-xl">Aucun produit trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ShopCard({ product, onAddToCart }: { product: Product, onAddToCart: () => void }) {
  if (!product) return null;

  const isOutOfStock = (product.stock || 0) <= 0
  const price = product.price || 0
  const promoPrice = product.promo_price
  
  const discount = promoPrice 
    ? Math.round(((price - promoPrice) / price) * 100) 
    : null

  return (
    <div className="group bg-white rounded-[1.5rem] flex flex-col relative transition-all duration-300">
      
      {/* ZONE IMAGE (Style premium festi12) */}
      <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-[#F9FAFB] block border border-gray-50">
        <img 
          src={product.images?.[0] || '/placeholder.png'} 
          alt={product.title}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? 'grayscale' : ''}`} 
        />
        
        {/* Badges promo et vedette */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount && (
            <div className="bg-[#FF5A5A] text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
              -{discount}%
            </div>
          )}
          {product.is_featured && (
            <div className="bg-[#FFB800] text-white text-[10px] font-black px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
               Védette <Star size={10} fill="currentColor" className="ml-0.5" />
            </div>
          )}
        </div>

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-gray-900 text-white px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest">Épuisé</span>
          </div>
        )}
      </Link>

      {/* DÉTAILS DU PRODUIT (Style épuré festi12) */}
      <div className="py-4 px-1 flex flex-col flex-grow text-left">
        <div className="mb-2">
          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 uppercase tracking-tight">
            {product.category || 'Général'}
          </span>
        </div>

        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-gray-900 text-[15px] leading-tight mb-3 line-clamp-1 group-hover:text-[#FF5A5A] transition-colors">
            {product.title}
          </h3>
        </Link>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {/* Prix formaté en FCFA */}
            <span className="text-[20px] font-black text-[#FF5A5A]">
              {(promoPrice || price).toLocaleString()} F
            </span>
            {promoPrice && (
              <span className="text-sm text-gray-300 line-through font-medium">
                {price.toLocaleString()} F
              </span>
            )}
          </div>

          <button 
            disabled={isOutOfStock}
            onClick={(e) => { 
              e.preventDefault(); 
              onAddToCart(); 
            }}
            className={`p-2 rounded-xl transition-all ${
              isOutOfStock 
              ? 'bg-gray-50 text-gray-200 cursor-not-allowed' 
              : 'text-gray-400 hover:text-[#FF5A5A] hover:bg-rose-50 active:scale-90 transition-transform'
            }`}
          >
            <Plus size={24} />
          </button>
        </div>
      </div>
    </div>
  )
}