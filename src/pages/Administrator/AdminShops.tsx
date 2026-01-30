import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { 
  Store, ShieldCheck, ShieldAlert, 
  Calendar, Search, AlertCircle, User 
} from 'lucide-react'
import { toast } from 'sonner'

export default function AdminShops() {
  const [shops, setShops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // 1. RÉCUPÉRATION DES DONNÉES (Version corrigée sans la colonne email)
  const fetchShops = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('shops')
        .select(`
          *,
          profiles (
            full_name
          )
        `) 
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setShops(data || [])
    } catch (error: any) {
      console.error("Erreur Supabase:", error.message)
      toast.error("Erreur de synchronisation")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShops()
  }, [])

  // 2. ACTION DE MISE À JOUR DU STATUT
  const handleToggleStatus = async (shopId: string, currentStatus: string) => {
    const newStatus = (currentStatus === 'suspended') ? 'active' : 'suspended'
    
    const { error } = await supabase
      .from('shops')
      .update({ status: newStatus })
      .eq('id', shopId)

    if (error) {
      toast.error("Impossible de modifier le statut")
    } else {
      toast.success(`Boutique ${newStatus === 'active' ? 'activée' : 'suspendue'}`)
      fetchShops()
    }
  }

  // 3. LOGIQUE DE RECHERCHE
  const filteredShops = shops.filter(shop => {
    const term = search.toLowerCase()
    return (
      shop.name?.toLowerCase().includes(term) || 
      shop.profiles?.full_name?.toLowerCase().includes(term)
    )
  })

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black italic text-gray-400 uppercase tracking-widest text-[10px]">Chargement des vendeurs...</p>
    </div>
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* BARRE DE RECHERCHE */}
      <div className="relative max-w-md group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={18} />
        <input 
          type="text"
          placeholder="Rechercher une boutique ou un vendeur..."
          className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-purple-500/5 transition-all font-medium text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* GRILLE DES VENDEURS */}
      {filteredShops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredShops.map((shop) => (
            <div key={shop.id} className="bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-[1.2rem] flex items-center justify-center font-black italic text-2xl uppercase shadow-inner group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                    {shop.name?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 uppercase italic tracking-tighter text-lg leading-none mb-1">
                      {shop.name}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1.5 tracking-wider">
                      <Calendar size={12} /> {new Date(shop.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] ${
                  shop.status === 'suspended' ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-emerald-50 text-emerald-500 border border-emerald-100'
                }`}>
                  {shop.status || 'active'}
                </span>
              </div>

              <div className="bg-gray-50 p-5 rounded-2xl mb-8 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-gray-400 shadow-sm">
                    <User size={14} />
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Propriétaire</p>
                    <p className="text-xs font-bold text-gray-700">{shop.profiles?.full_name || 'Non renseigné'}</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleToggleStatus(shop.id, shop.status || 'active')}
                className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${
                  shop.status === 'suspended' 
                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white shadow-lg shadow-emerald-100' 
                  : 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white shadow-lg shadow-rose-100'
                }`}
              >
                {shop.status === 'suspended' ? <ShieldCheck size={16}/> : <ShieldAlert size={16}/>}
                {shop.status === 'suspended' ? 'Réactiver le vendeur' : 'Suspendre le vendeur'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 bg-white rounded-[3rem] text-center border-2 border-dashed border-gray-100">
           <AlertCircle className="mx-auto text-gray-200 mb-4" size={50} />
           <h3 className="text-lg font-black text-gray-900 uppercase italic">Aucun vendeur trouvé</h3>
           <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2">La base de données est vide ou la recherche est infructueuse</p>
        </div>
      )}
    </div>
  )
}