import { useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Star, Edit, Trash2, Plus, Loader2, Package, LayoutGrid, X } from 'lucide-react'
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
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // CHARGEMENT DES PRODUITS
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setProducts(data || [])
    } catch (error: any) {
      console.error("Erreur fetch:", error.message)
      toast.error("Erreur de chargement")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // FILTRAGE VEDETTES (Calculé dynamiquement)
  const featuredProducts = useMemo(() => 
    products.filter(p => p.is_featured === true), 
  [products])

  // FONCTION DE SAUVEGARDE (CORRIGÉE)
  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;

    // 1. Mise à jour visuelle immédiate
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, is_featured: nextStatus } : p
    ));

    try {
      // 2. Envoi à Supabase
      const { data, error, status } = await supabase
        .from('products')
        .update({ is_featured: nextStatus })
        .eq('id', id)
        .select(); // Important pour vérifier que la ligne a bien été modifiée

      if (error) throw error;

      // 3. Vérification si une ligne a réellement été touchée
      if (!data || data.length === 0) {
        throw new Error("Aucune ligne modifiée. Vérifiez vos permissions RLS ou l'ID.");
      }

      toast.success(nextStatus ? "Produit mis en vedette" : "Retiré des vedettes");
      console.log("Succès Supabase, status:", status, "Data:", data);

    } catch (err: any) {
      // 4. Rollback en cas d'échec
      setProducts(prev => prev.map(p => 
        p.id === id ? { ...p, is_featured: currentStatus } : p
      ));
      
      console.error("DÉTAIL ERREUR SUPABASE:", err.message);
      toast.error(`Erreur: ${err.message}`);
    }
  }

  const deleteProduct = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      setProducts(prev => prev.filter(p => p.id !== id))
      toast.success("Produit supprimé")
    } catch (error: any) {
      toast.error("Erreur de suppression")
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-gray-900 text-white rounded-2xl shadow-lg">
            <Package size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 italic tracking-tighter uppercase">Gestion <span className="text-brand-primary">Stocks</span></h1>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">{products.length} Articles</p>
          </div>
        </div>
        <button 
          onClick={() => { setSelectedProduct(null); setIsModalOpen(true); }}
          className="bg-brand-primary text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:scale-105 transition-all"
        >
          <Plus size={20} /> NOUVEAU PRODUIT
        </button>
      </div>

      {/* SECTION VEDETTES (Aperçu) */}
      {featuredProducts.length > 0 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 px-2">
            <Star size={18} className="text-amber-500 fill-amber-500" />
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 italic">En Vedette sur le site</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {featuredProducts.map(p => (
              <div key={p.id} className="group relative bg-white p-2 rounded-[2rem] border-2 border-amber-100 shadow-sm overflow-hidden">
                <div className="aspect-square rounded-[1.5rem] overflow-hidden mb-2">
                  <img src={p.images?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                </div>
                <button 
                  onClick={() => toggleFeatured(p.id, true)}
                  className="absolute top-3 right-3 p-1.5 bg-white rounded-full text-rose-500 shadow-md hover:bg-rose-500 hover:text-white transition-all"
                >
                  <X size={12} strokeWidth={3} />
                </button>
                <p className="px-2 font-black text-[9px] text-gray-900 truncate uppercase tracking-tight">{p.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TABLEAU PRINCIPAL */}
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center gap-2">
            <LayoutGrid size={18} className="text-gray-400"/>
            <h3 className="font-black text-gray-400 text-xs uppercase tracking-widest">Liste Globale</h3>
        </div>

        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-brand-primary" size={40} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Produit</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">Prix</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black uppercase text-gray-400 tracking-widest">Statut Vedette</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black uppercase text-gray-400 tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100"><img src={p.images?.[0]} className="w-full h-full object-cover" /></div>
                        <span className="font-bold text-gray-900">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-black text-brand-primary">{p.promo_price.toLocaleString()} F</td>
                    <td className="px-8 py-5 text-center">
                      <button 
                        onClick={() => toggleFeatured(p.id, p.is_featured)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-black text-[9px] uppercase transition-all ${
                          p.is_featured ? 'bg-amber-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        <Star size={12} fill={p.is_featured ? "white" : "none"} />
                        {p.is_featured ? "EN VEDETTE" : "METTRE EN VEDETTE"}
                      </button>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setSelectedProduct(p); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600"><Edit size={18} /></button>
                        <button onClick={() => deleteProduct(p.id)} className="p-2 text-gray-400 hover:text-rose-600"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddProductModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedProduct(null); }} 
        onSuccess={fetchProducts}
        product={selectedProduct}
      />
    </div>
  )
}