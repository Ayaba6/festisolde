import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Star, Edit, Trash2, Plus, Loader2, Package } from 'lucide-react'
import { toast } from 'sonner'
import AddProductModal from './AddProductModal'

interface Product {
  id: string
  title: string
  images: string[]
  promo_price: number
  price: number
  is_featured: boolean
  description?: string
  created_at?: string
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Utilisation de useCallback pour stabiliser la fonction
  const fetchProducts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error(error)
      toast.error("Erreur de synchronisation")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setIsModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  // Basculer l'état "Vedette" directement depuis la liste
  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_featured: !currentStatus })
        .eq('id', id)

      if (error) throw error
      
      // Mise à jour locale immédiate de l'UI
      setProducts(prev => prev.map(p => 
        p.id === id ? { ...p, is_featured: !currentStatus } : p
      ))
      
      toast.success(!currentStatus ? "Mis en vedette !" : "Retiré des vedettes")
    } catch (err) {
      toast.error("Erreur de mise à jour")
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce produit ?")) return
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      setProducts(prev => prev.filter(p => p.id !== id))
      toast.success("Produit supprimé")
    } catch (error) {
      toast.error("Erreur de suppression")
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
              <Package size={24} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight italic">
              Inventaire <span className="text-brand-primary">Produits</span>
            </h1>
          </div>
          <p className="text-gray-500 font-medium">
            Vous gérez <span className="text-brand-dark font-bold">{products.length}</span> articles.
          </p>
        </div>
        <button 
          onClick={handleAddProduct}
          className="w-full md:w-auto bg-gray-900 text-white px-8 py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl hover:bg-brand-primary transition-all active:scale-95"
        >
          <Plus size={20} /> Ajouter un produit
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-32 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-brand-primary" size={48} />
            <span className="font-black uppercase tracking-[0.3em] text-[10px] text-gray-400">Chargement des données...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-[0.2em] text-left">Détails Produit</th>
                  <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-[0.2em] text-left">Tarification</th>
                  <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-[0.2em] text-center">Vedette</th>
                  <th className="px-8 py-6 font-black text-gray-400 uppercase text-[10px] tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.length === 0 ? (
                  <tr><td colSpan={4} className="p-20 text-center text-gray-300 font-black uppercase italic tracking-widest">Aucun article trouvé</td></tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-all duration-200 group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
                            <img 
                              src={(p.images && p.images.length > 0) ? p.images[0] : 'https://via.placeholder.com/150'} 
                              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
                              alt={p.title}
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-gray-900 text-lg truncate">{p.title || 'Sans nom'}</span>
                            <span className="font-mono text-[10px] text-gray-400 bg-gray-100 w-fit px-2 py-0.5 rounded">ID: {p.id.slice(0, 8).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-xl font-black text-gray-900">{p.promo_price.toLocaleString()} FCFA</span>
                          {p.price > p.promo_price && (
                            <span className="text-xs text-red-400 line-through font-bold">{p.price.toLocaleString()} FCFA</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <button 
                          onClick={() => toggleFeatured(p.id, p.is_featured)}
                          className={`p-3 rounded-2xl transition-all ${
                            p.is_featured 
                            ? 'bg-amber-50 text-amber-500 shadow-inner' 
                            : 'bg-gray-50 text-gray-200 hover:text-gray-400'
                          }`}
                        >
                          <Star size={22} fill={p.is_featured ? "currentColor" : "none"} />
                        </button>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleEditProduct(p)}
                            className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          >
                            <Edit size={20} />
                          </button>
                          <button 
                            onClick={() => deleteProduct(p.id)}
                            className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddProductModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSuccess={fetchProducts} // Recharge la liste après modification
        product={selectedProduct}
      />
    </div>
  )
}