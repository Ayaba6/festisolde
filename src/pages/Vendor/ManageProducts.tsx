import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
  Plus, Trash2, Edit3, Loader2, Package, ChevronLeft 
} from 'lucide-react';
import AddProductModal from './AddProductModal';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [storeId, setStoreId] = useState(null);
  const navigate = useNavigate();

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
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProducts(sId = storeId) {
    if (!sId) return;
    const { data } = await supabase.from('products')
      .select('*')
      .eq('store_id', sId)
      .order('created_at', { ascending: false });
    setProducts(data || []);
  }

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

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#FDFDFD]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-orange-500" size={32} />
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Inventaire en cours...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8 pb-32">
      
      {/* BARRE DE NAVIGATION / RETOUR */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all hover:shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventaire</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {products.length} articles publiés
            </p>
          </div>
        </div>
        
        <button 
          onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
          className="bg-slate-950 hover:bg-slate-800 text-white px-6 py-4 rounded-2xl font-bold text-xs tracking-wide flex items-center justify-center gap-2 shadow-xl shadow-slate-200 transition-all active:scale-95"
        >
          <Plus size={18} /> 
          AJOUTER UN ARTICLE
        </button>
      </div>

      {/* ÉTAT VIDE */}
      {products.length === 0 ? (
        <div className="py-24 text-center flex flex-col items-center gap-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200">
             <Package size={40} />
          </div>
          <div className="space-y-1">
            <p className="text-slate-900 font-bold text-lg">Votre stock est vide</p>
            <p className="text-slate-400 text-sm">Commencez à vendre en ajoutant votre premier produit.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-orange-500 font-bold text-xs uppercase tracking-widest hover:text-orange-600 transition-colors"
          >
            + Créer un produit
          </button>
        </div>
      ) : (
        <>
          {/* VERSION MOBILE */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {products.map((p) => (
              <div key={p.id} className="bg-white border border-slate-100 rounded-[2rem] p-4 shadow-sm flex items-center gap-4">
                <img src={p.image_url} className="w-20 h-20 rounded-2xl object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] text-orange-500 font-bold uppercase tracking-widest mb-0.5">{p.category}</p>
                  <h3 className="text-sm font-bold text-slate-900 truncate uppercase">{p.name}</h3>
                  <p className="text-slate-900 font-bold text-sm mt-1">{p.price.toLocaleString()} CFA</p>
                  <div className={`inline-block mt-2 px-2 py-0.5 rounded-lg text-[8px] font-bold ${p.stock_quantity > 0 ? 'bg-slate-50 text-slate-500' : 'bg-red-50 text-red-500'}`}>
                    STOCK : {p.stock_quantity}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-3 text-slate-400 hover:text-slate-900 bg-slate-50 rounded-xl transition-colors"><Edit3 size={16} /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-3 text-slate-400 hover:text-red-500 bg-slate-50 rounded-xl transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* VERSION DESKTOP */}
          <div className="hidden md:block bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Produit</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Prix</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Stock</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-4 flex items-center gap-4">
                      <img src={p.image_url} className="w-14 h-14 rounded-xl object-cover shadow-sm border border-slate-100" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 uppercase">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{p.category}</p>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-center font-bold text-slate-900">
                      {p.price.toLocaleString()} <span className="text-[10px] text-slate-400">CFA</span>
                    </td>
                    <td className="px-8 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-tight ${p.stock_quantity > 0 ? 'bg-slate-100 text-slate-600' : 'bg-red-50 text-red-500'}`}>
                        {p.stock_quantity} UNITÉS
                      </span>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"><Edit3 size={18} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <AddProductModal 
          storeId={storeId}
          productToEdit={editingProduct} 
          onClose={() => { setIsModalOpen(false); setEditingProduct(null); }}
          onRefresh={() => fetchProducts()}
        />
      )}
    </div>
  );
}