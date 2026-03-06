import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { 
  Plus, Trash2, Edit3, ShoppingCart, Loader2, Package 
} from 'lucide-react';
import AddProductModal from './AddProductModal';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [storeId, setStoreId] = useState(null);

  // 1. Chargement initial
  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: store } = await supabase.from('stores')
          .select('id')
          .eq('owner_id', user.id)
          .single();
        
        if (store) {
          setStoreId(store.id);
          await fetchProducts(store.id);
        }
      }
    } catch (error) {
      console.error("Erreur chargement initial:", error);
    } finally {
      setLoading(false);
    }
  }

  // 2. Récupérer la liste des produits
  async function fetchProducts(sId = storeId) {
    if (!sId) return;
    const { data } = await supabase.from('products')
      .select('*')
      .eq('store_id', sId)
      .order('created_at', { ascending: false });
    setProducts(data || []);
  }

  // 3. Suppression
  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cet article définitivement ?")) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
        setProducts(products.filter(p => p.id !== id));
      } catch (err) { 
        alert("Erreur lors de la suppression"); 
      }
    }
  };

  // 4. Gestion du Modal
  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#F8F9FB]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-orange-600" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Chargement du stock...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 font-sans antialiased">
      
      {/* HEADER DE LA PAGE */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase italic tracking-tight">
            Gestion <span className="text-orange-600">Stock</span>
          </h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
            {products.length} Articles en ligne
          </p>
        </div>
        
        <button 
          onClick={openAddModal}
          className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-3 md:px-6 md:py-4 rounded-2xl font-black text-[10px] md:text-xs tracking-widest flex items-center gap-2 shadow-xl shadow-orange-100 transition-transform active:scale-95"
        >
          <Plus size={18} strokeWidth={3} /> 
          <span className="hidden sm:inline">NOUVEL ARTICLE</span>
          <span className="sm:hidden">AJOUTER</span>
        </button>
      </div>

      {/* CONTENU PRINCIPAL */}
      {products.length === 0 ? (
        <div className="p-20 text-center flex flex-col items-center gap-4 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
             <Package size={40} />
          </div>
          <div className="space-y-1">
            <p className="text-gray-900 font-black uppercase text-sm italic">Votre stock est vide</p>
            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Commencez par ajouter votre premier produit</p>
          </div>
          <button onClick={openAddModal} className="mt-4 text-orange-600 font-black text-[10px] uppercase underline underline-offset-4">Ajouter maintenant</button>
        </div>
      ) : (
        <>
          {/* VERSION MOBILE : CARDS ÉLÉGANTES */}
          <div className="grid grid-cols-1 gap-4 md:hidden pb-20">
            {products.map((p) => (
              <div key={p.id} className="bg-white border border-gray-100 rounded-[2rem] p-4 shadow-sm flex items-center gap-4 relative">
                <img src={p.image_url} className="w-20 h-20 rounded-2xl object-cover border border-gray-50" />
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] text-orange-600 font-black uppercase tracking-widest mb-1">{p.category}</p>
                  <h3 className="text-sm font-black uppercase text-gray-900 truncate leading-tight">{p.name}</h3>
                  <p className="text-gray-900 font-black text-sm mt-1">{p.price.toLocaleString()} CFA</p>
                  <div className={`inline-block mt-2 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase ${p.stock_quantity > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {p.stock_quantity > 0 ? `${p.stock_quantity} EN STOCK` : 'RUPTURE'}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => openEditModal(p)} className="p-3 text-gray-400 hover:text-orange-600 bg-gray-50 rounded-2xl transition-colors"><Edit3 size={18} /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-3 text-gray-400 hover:text-red-600 bg-gray-50 rounded-2xl transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* VERSION DESKTOP : TABLEAU PRO */}
          <div className="hidden md:block bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Article</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Prix</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Stock</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-5 flex items-center gap-4">
                      <img src={p.image_url} className="w-16 h-16 rounded-2xl object-cover border border-gray-100 shadow-sm" />
                      <div>
                        <p className="text-sm font-black uppercase text-gray-900 leading-tight">{p.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase mt-1">{p.category}</p>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center font-black text-sm text-gray-900 italic">
                      {p.price.toLocaleString()} <span className="text-[10px]">CFA</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase ${p.stock_quantity > 0 ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                        {p.stock_quantity} EN STOCK
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-3">
                        <button onClick={() => openEditModal(p)} className="p-2.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"><Edit3 size={18} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* MODAL EXTRACTÉ (AJOUT & MODIF) */}
      {isModalOpen && (
        <AddProductModal 
          storeId={storeId}
          productToEdit={editingProduct} 
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
          onRefresh={() => fetchProducts()}
        />
      )}
    </div>
  );
}