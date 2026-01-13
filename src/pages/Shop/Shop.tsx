import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Search, Plus, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProductCardSkeleton from './ProductCardSkeleton'

const CATEGORIES = ['Tous', 'Électronique', 'Mode & Beauté', 'Maison & Déco', 'Alimentation', 'Santé', 'Sport', 'Autres']

interface Product {
  id: string
  title: string
  price: number
  promo_price?: number
  images: string[]
  category: string
  stock: number
  is_featured?: boolean // Optionnel pour le badge "Vedette"
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
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prevCart, { ...product, quantity: 1 }]
    })
  }

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="bg-white border-b border-gray-100 pt-8 pb-4 sticky top-[116px] md:top-[128px] z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Rechercher un produit..."
                  className="w-full pl-12 pr-6 py-3.5 bg-gray-50 rounded-xl border border-gray-100 focus:border-indigo-500 focus:ring-0 font-medium transition-all outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select 
                onChange={(e) => setSortBy(e.target.value)}
                className="px-6 py-3.5 bg-white border border-gray-100 rounded-xl font-bold text-gray-600 outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="recent">Plus récents</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap px-5 py-2 rounded-lg font-semibold text-sm transition-all ${
                    selectedCategory === cat 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
            <div className="col-span-full text-center py-20 text-gray-400 font-medium">
              Aucun produit ne correspond à votre recherche.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ShopCard({ product, onAddToCart }: { product: Product, onAddToCart: () => void }) {
  const isOutOfStock = product.stock <= 0
  
  // Calcul du pourcentage de réduction si promo_price existe
  const discount = product.promo_price 
    ? Math.round(((product.price - product.promo_price) / product.price) * 100) 
    : null

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col relative">
      
      {/* SECTION IMAGE AVEC BADGES */}
      <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-gray-50 block">
        <img 
          src={product.images?.[0] || '/placeholder.png'} 
          alt={product.title}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'grayscale' : ''}`} 
        />
        
        {/* Badge Promo (%) */}
        {discount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-[11px] font-black px-2 py-1 rounded-md shadow-lg">
            -{discount}%
          </div>
        )}

        {/* Badge Vedette (Optionnel) */}
        {(product.is_featured || product.stock < 5) && !isOutOfStock && (
          <div className="absolute top-3 right-3 bg-amber-400 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-lg animate-pulse">
            <Star size={10} fill="white" /> Vedette
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-gray-900 text-white px-4 py-1.5 rounded-lg font-bold text-xs uppercase tracking-widest">Épuisé</span>
          </div>
        )}
      </Link>

      {/* CONTENU TEXTE */}
      <div className="p-5 flex flex-col flex-grow bg-white">
        {/* Catégorie discrète */}
        <div className="mb-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-100 px-2 py-0.5 rounded-md">
            {product.category}
          </span>
        </div>

        {/* Titre */}
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-gray-800 text-[15px] leading-tight line-clamp-2 mb-3 hover:text-indigo-600 transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Prix et Action */}
        <div className="mt-auto flex items-end justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-red-500">
                {(product.promo_price || product.price).toLocaleString()} <small className="text-xs uppercase">F</small>
              </span>
              {product.promo_price && (
                <span className="text-sm text-gray-300 line-through font-medium">
                  {product.price.toLocaleString()} F
                </span>
              )}
            </div>
          </div>

          <button 
            disabled={isOutOfStock}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onAddToCart();
            }}
            className={`p-2.5 rounded-xl transition-all shadow-md ${
              isOutOfStock 
              ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
              : 'bg-white text-indigo-600 border border-indigo-50 hover:bg-indigo-600 hover:text-white active:scale-90 shadow-indigo-100'
            }`}
          >
            <Plus size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}