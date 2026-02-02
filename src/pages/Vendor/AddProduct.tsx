import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, X, ArrowLeft, Sparkles, 
  ChevronDown, Tag, Plus, Layers 
} from 'lucide-react'
import { toast } from 'sonner'

export default function AddProduct() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [shopId, setShopId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  
  // États pour les catégories dynamiques
  const [dbCategories, setDbCategories] = useState<{id: string, name: string}[]>([])
  const [categoryId, setCategoryId] = useState('') // Stockera l'UUID
  
  const [price, setPrice] = useState<number | ''>('')
  const [promoPrice, setPromoPrice] = useState<number | ''>('')
  const [stock, setStock] = useState<number | ''>('')
  
  const [isCustomizable, setIsCustomizable] = useState(false)
  
  const [colors, setColors] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>([])
  const [newColor, setNewColor] = useState('')
  const [newSize, setNewSize] = useState('')

  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // 1. Charger le Shop et les Catégories de la DB
  useEffect(() => {
    const initializeData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Charger le shop
      const { data: shop } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (!shop) {
        navigate('/vendor/setup')
        return
      }
      setShopId(shop.id)

      // Charger les catégories réelles
      const { data: cats, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name', { ascending: true })
      
      if (!error && cats) {
        setDbCategories(cats)
      }
    }
    initializeData()
  }, [navigate])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (images.length + files.length > 4) {
      toast.error("Maximum 4 photos autorisées")
      return
    }
    setImages((prev) => [...prev, ...files])
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setPreviews((prev) => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setPreviews(previews.filter((_, i) => i !== index))
  }

  const uploadImages = async () => {
    if (!shopId) return []
    const uploadedUrls: string[] = []
    for (const file of images) {
      const ext = file.name.split('.').pop()
      const fileName = `${shopId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file)
      if (uploadError) throw new Error("Échec de l'envoi des images")
      const { data } = supabase.storage.from('products').getPublicUrl(fileName)
      uploadedUrls.push(data.publicUrl)
    }
    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (images.length === 0) return toast.error("Ajoutez au moins une photo")
    if (!categoryId) return toast.error("Choisissez une catégorie")
    if (promoPrice !== '' && Number(promoPrice) >= Number(price)) {
      return toast.error("Le prix promo doit être inférieur au prix normal")
    }
    
    setLoading(true)
    try {
      const imageUrls = await uploadImages()
      
      const selectedCategoryName = dbCategories.find(c => c.id === categoryId)?.name

      const productData = {
        shop_id: shopId,
        title: title, 
        description: description,
        category_id: categoryId, // Utilisation de la clé étrangère SQL
        price: Number(price), 
        promo_price: promoPrice !== '' ? Number(promoPrice) : null,
        stock: Number(stock),
        images: imageUrls,
        colors: colors,
        sizes: sizes,
        is_featured: selectedCategoryName === "Pack FestiSolde",
        allow_custom_pack: isCustomizable 
      }

      const { error } = await supabase.from('products').insert([productData])
      if (error) throw error

      toast.success('Article prêt pour la vente et les packs !')
      navigate('/vendor/dashboard')
    } catch (err: any) {
      toast.error(err.message || "Erreur de publication")
    } finally {
      setLoading(false)
    }
  }

  const labelStyle = "block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-1"
  const inputStyle = "w-full bg-slate-50 border-2 border-slate-100 focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/5 rounded-2xl px-6 py-4 outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300"

  if (!shopId) return <div className="h-screen flex items-center justify-center bg-white italic font-black uppercase tracking-widest text-brand-primary">Chargement du profil vendeur...</div>

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors font-black text-[10px] uppercase tracking-widest">
            <ArrowLeft size={16} /> Annuler
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[3rem] shadow-xl p-8 md:p-14 border border-white relative overflow-hidden">
          <header className="mb-12">
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter italic uppercase leading-none">
              Nouvel <span className="text-brand-primary">Article</span>
            </h1>
          </header>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* PHOTOS SECTION */}
            <div className="space-y-4">
              <label className={labelStyle}>Photos du produit (Max 4)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {previews.map((src, index) => (
                  <div key={src} className="relative aspect-square rounded-[1.5rem] overflow-hidden shadow-md group">
                    <img src={src} className="w-full h-full object-cover" alt="" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute inset-0 bg-rose-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><X size={24} /></button>
                  </div>
                ))}
                {images.length < 4 && (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-[1.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 hover:bg-white hover:border-brand-primary hover:text-brand-primary transition-all">
                    <Upload size={20} />
                    <span className="text-[9px] font-black uppercase mt-2">Ajouter</span>
                  </button>
                )}
              </div>
              <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            {/* INFOS DE BASE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className={labelStyle}>Titre de l'annonce</label>
                <input type="text" placeholder="Ex: Chemise Slim Fit Coton" className={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <label className={labelStyle}>Catégorie (Base de données)</label>
                <div className="relative">
                  <select 
                    className={`${inputStyle} appearance-none cursor-pointer`} 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)} 
                    required
                  >
                    <option value="">Sélectionner une catégorie...</option>
                    {dbCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelStyle}>Stock Disponible</label>
                <input type="number" placeholder="Quantité" className={inputStyle} value={stock} onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))} required />
              </div>
            </div>

            {/* PRIX SECTION */}
            <div className="p-8 rounded-[2.5rem] border-2 bg-slate-50 border-slate-100">
              <div className="flex items-center gap-2 mb-6 font-black uppercase text-xs italic text-gray-600">
                <Tag size={16} className="text-brand-primary" /> Tarification (FCFA)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Prix habituel</label>
                  <input type="number" className={`${inputStyle} !bg-white`} value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} required />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-brand-primary mb-2 uppercase tracking-widest">Prix FestiSolde 🔥</label>
                  <input type="number" className={`${inputStyle} !bg-white border-brand-primary/30 text-brand-primary`} value={promoPrice} onChange={(e) => setPromoPrice(e.target.value === '' ? '' : Number(e.target.value))} required />
                </div>
              </div>
            </div>

            {/* TOGGLE CUSTOM PACK */}
            <div 
              onClick={() => setIsCustomizable(!isCustomizable)}
              className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between ${
                isCustomizable ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-white border-slate-100 text-gray-400 hover:border-brand-primary/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${isCustomizable ? 'bg-white/20' : 'bg-slate-100'}`}>
                  <Plus size={20} className={isCustomizable ? 'text-white' : 'text-gray-400'} />
                </div>
                <div>
                  <p className={`font-black uppercase italic text-xs leading-none mb-1 ${isCustomizable ? 'text-white' : 'text-gray-900'}`}>
                    Éligible au Pack Personnalisé
                  </p>
                  <p className={`text-[10px] font-bold uppercase italic opacity-70`}>
                    Permet au client d'inclure cet article dans un look composé
                  </p>
                </div>
              </div>
              <div className={`w-12 h-6 rounded-full relative transition-colors ${isCustomizable ? 'bg-white/30' : 'bg-slate-200'}`}>
                <motion.div 
                  animate={{ x: isCustomizable ? 24 : 4 }}
                  className="w-4 h-4 rounded-full bg-white absolute top-1" 
                />
              </div>
            </div>

            <div>
              <label className={labelStyle}>Description détaillée</label>
              <textarea placeholder="Matière, coupe, entretien..." className={`${inputStyle} min-h-[120px] resize-none`} value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>

            <button type="submit" disabled={loading} className="w-full py-6 rounded-2xl bg-gray-900 text-white font-black text-xs uppercase tracking-[0.3em] transition-all hover:bg-brand-primary hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50">
              {loading ? "Traitement en cours..." : "Mettre en vente l'article"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}