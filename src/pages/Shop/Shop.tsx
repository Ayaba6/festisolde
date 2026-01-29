import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Search, Plus, Star, SlidersHorizontal, Package, Check, Sparkles } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom' // Ajout de useSearchParams
import ProductCardSkeleton from './ProductCardSkeleton'

const CATEGORIES = ['Tous', 'Packeo', 'Électronique', 'Mode & Beauté', 'Maison & Déco', 'Alimentation', 'Santé', 'Sport', 'Autres']

interface Product {
  id: string; title: string; price: number; promo_price?: number;
  images: string[]; category: string; stock: number;
  is_featured?: boolean; shop_id: string; description?: string;
}

interface ShopProps {
  cart: any[]; setCart: React.Dispatch<React.SetStateAction<any[]>>
}

export default function Shop({ cart, setCart }: ShopProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  
  // 1. Récupération des paramètres de l'URL
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryFromUrl = searchParams.get('category')

  // 2. Initialisation de la catégorie (URL prioritaire sur 'Tous')
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'Tous')

  // 3. Effet pour synchroniser la catégorie si l'URL change (ex: clic sur logo/menu)
  useEffect(() => {
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl)
    }
  }, [categoryFromUrl])

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

  // Fonction pour changer de catégorie et mettre à jour l'URL proprement
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    if (cat === 'Tous') {
      setSearchParams({}) // On nettoie l'URL
    } else {
      setSearchParams({ category: cat }) // On met la catégorie dans l'URL
    }
  }

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      let newCart;
      if (existingItem) {
        newCart = prevCart.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      } else {
        newCart = [...prevCart, { ...product, quantity: 1 }]
      }
      localStorage.setItem('festi-cart', JSON.stringify(newCart))
      return newCart
    })
  }

  const filteredProducts = products.filter(p => 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="bg-white border-b border-gray-100 pt-10 pb-6">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-black text-gray-900 mb-2 uppercase italic tracking-tighter">Boutique</h1>
          <p className="text-gray-500 text-sm font-medium">
            {selectedCategory !== 'Tous' ? `Filtré par : ${selectedCategory}` : 'Découvrez les meilleures offres de Ouagadougou.'}
          </p>
        </div>
      </div>

      <div className="sticky top-[72px] z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Rechercher un article..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-2xl border border-transparent focus:border-brand-primary/20 focus:bg-white focus:ring-4 focus:ring-brand-primary/5 outline-none font-medium transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center bg-gray-50 rounded-2xl px-4 border border-transparent">
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

          <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-1 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`whitespace-nowrap px-5 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${
                  selectedCategory === cat 
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20 scale-105' 
                  : 'bg-white text-gray-400 border border-gray-100 hover:text-brand-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((product) => (
              <ShopCard key={product.id} product={product} onAddToCart={() => addToCart(product)} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Package size={40} className="text-gray-200 mb-6" />
            <h3 className="text-xl font-black text-gray-900 mb-2">Aucun article ici</h3>
            <button onClick={() => handleCategoryChange('Tous')} className="text-brand-primary font-bold text-sm underline">Voir tout le catalogue</button>
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
  const isPackeo = product.category === 'Packeo'
  const discount = product.promo_price 
    ? Math.round(((product.price - product.promo_price) / product.price) * 100) 
    : null

  return (
    <div className={`group bg-white rounded-[2rem] p-3 border-2 transition-all duration-500 flex flex-col h-full relative ${isPackeo ? 'border-brand-primary/10 shadow-xl shadow-brand-primary/5' : 'border-transparent hover:border-gray-100'}`}>
      {isPackeo && (
        <div className="absolute -top-2 -right-1 z-10 bg-brand-primary text-white text-[8px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 uppercase">
          <Sparkles size={10} fill="white" /> Pack Spécial
        </div>
      )}

      <Link to={`/product/${product.id}`} className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-gray-50 block">
        <img 
          src={product.images?.[0] || '/placeholder.png'} 
          alt={product.title}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'grayscale' : ''}`} 
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount && <span className="bg-brand-primary text-white text-[10px] font-black px-2.5 py-1 rounded-lg">-{discount}%</span>}
        </div>
      </Link>

      <div className="pt-5 pb-2 px-2 flex flex-col flex-grow">
        <span className={`text-[9px] font-black uppercase tracking-widest mb-2 block ${isPackeo ? 'text-brand-primary' : 'text-gray-400'}`}>
          {product.category}
        </span>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-3 line-clamp-2 group-hover:text-brand-primary transition-colors h-10">
            {product.title}
          </h3>
        </Link>
        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            {product.promo_price && <span className="text-[11px] text-gray-400 line-through font-bold">{product.price.toLocaleString()} F</span>}
            <span className="text-lg font-black text-gray-900">
              {(product.promo_price || product.price).toLocaleString()} <small className="text-[10px]">F</small>
            </span>
          </div>
          <button 
            disabled={isOutOfStock || added}
            onClick={handleAdd}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${added ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-white hover:bg-brand-primary'}`}
          >
            {added ? <Check size={20} /> : <Plus size={20} />}
          </button>
        </div>
      </div>
    </div>
  )
}