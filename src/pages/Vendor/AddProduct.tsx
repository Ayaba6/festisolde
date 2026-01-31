import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Upload, X, ArrowLeft, Sparkles, 
  ChevronDown, Tag, Plus 
} from 'lucide-react'
import { toast } from 'sonner'

// Catégories alignées sur ta stratégie
const CATEGORIES = [
  "Pack FestiSolde", // Catégorie Premium / Featured
  "Mode & Beauté", "Électronique", "Maison & Déco", 
  "Alimentation", "Santé", "Sport", "Services", "Autres"
]

export default function AddProduct() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [shopId, setShopId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  const [promoPrice, setPromoPrice] = useState<number | ''>('')
  const [stock, setStock] = useState<number | ''>('')
  
  const [colors, setColors] = useState<string[]>([])
  const [sizes, setSizes] = useState<string[]>([])
  const [newColor, setNewColor] = useState('')
  const [newSize, setNewSize] = useState('')

  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadShop = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

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
    }
    loadShop()
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

  const addVariant = (type: 'color' | 'size') => {
    if (type === 'color' && newColor.trim()) {
      setColors([...colors, newColor.trim()])
      setNewColor('')
    } else if (type === 'size' && newSize.trim()) {
      setSizes([...sizes, newSize.trim()])
      setNewSize('')
    }
  }

  const uploadImages = async () => {
    if (!shopId) return []
    const uploadedUrls: string[] = []
    
    for (const file of images) {
      const ext = file.name.split('.').pop()
      const fileName = `${shopId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file)

      if (uploadError) throw new Error("Échec de l'envoi des images")
      
      const { data } = supabase.storage.from('products').getPublicUrl(fileName)
      uploadedUrls.push(data.publicUrl)
    }
    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (images.length === 0) return toast.error("Ajoutez au moins une photo")
    if (!category) return toast.error("Choisissez une catégorie")
    
    // Validation de prix logique pour éviter les erreurs de saisie
    if (promoPrice !== '' && Number(promoPrice) >= Number(price)) {
      return toast.error("Le prix promo doit être inférieur au prix normal")
    }
    
    setLoading(true)
    try {
      const imageUrls = await uploadImages()
      
      const productData = {
        shop_id: shopId,
        title: title, 
        description: description,
        category: category,
        price: Number(price), 
        promo_price: promoPrice !== '' ? Number(promoPrice) : null,
        stock: Number(stock),
        images: imageUrls,
        colors: colors,
        sizes: sizes,
        is_featured: category === "Pack FestiSolde"
      }

      const { error } = await supabase
        .from('products')
        .insert([productData])

      if (error) throw error

      toast.success('Félicitations ! Votre article est en ligne.')
      navigate('/vendor/dashboard')
    } catch (err: any) {
      console.error("Erreur complète:", err)
      toast.error(err.message || "Erreur de publication")
    } finally {
      setLoading(false)
    }
  }

  const labelStyle = "block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-1"
  const inputStyle = "w-full bg-slate-50 border-2 border-slate-100 focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/5 rounded-2xl px-6 py-4 outline-none font-bold text-gray-900 transition-all placeholder:text-gray-300"

  if (!shopId) return (
    <div className="h-screen flex items-center justify-center bg-white italic font-black uppercase tracking-widest text-brand-primary">
      Préparation de votre rayon...
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors font-black text-[10px] uppercase tracking-widest">
            <ArrowLeft size={16} /> Annuler et quitter
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/50 p-8 md:p-14 border border-white relative overflow-hidden"
        >
          <AnimatePresence>
            {category === "Pack FestiSolde" && (
              <motion.div 
                initial={{ y: -100 }} animate={{ y: 0 }} exit={{ y: -100 }}
                className="absolute top-0 left-0 right-0 bg-brand-primary text-white py-3 px-8 flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-[0.3em]"
              >
                <Sparkles size={14} fill="white" /> Option visibilité maximum activée
              </motion.div>
            )}
          </AnimatePresence>

          <header className={`mb-12 ${category === "Pack FestiSolde" ? "mt-8" : ""}`}>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter italic uppercase leading-none">
              Nouvel <span className="text-brand-primary">Article</span>
            </h1>
          </header>

          <form onSubmit={handleSubmit} className="space-y-10">
            {/* PHOTOS */}
            <div className="space-y-4">
              <label className={labelStyle}>Photos du produit (Format carré recommandé)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {previews.map((src, index) => (
                  <div key={src} className="relative aspect-square rounded-[1.5rem] overflow-hidden shadow-md group">
                    <img src={src} className="w-full h-full object-cover" alt="" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute inset-0 bg-rose-600/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <X size={24} strokeWidth={3} />
                    </button>
                  </div>
                ))}
                {images.length < 4 && (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-[1.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 hover:bg-white hover:border-brand-primary hover:text-brand-primary transition-all group">
                    <Upload size={20} className="group-hover:-translate-y-1 transition-transform" />
                    <span className="text-[9px] font-black uppercase mt-2">Ajouter</span>
                  </button>
                )}
              </div>
              <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <label className={labelStyle}>Titre de l'annonce</label>
                <input type="text" placeholder="Ex: Montre de luxe - Solde Flash" className={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div>
                <label className={labelStyle}>Rayon / Catégorie</label>
                <div className="relative">
                  <select className={`${inputStyle} appearance-none`} value={category} onChange={(e) => setCategory(e.target.value)} required>
                    <option value="">Sélectionner...</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className={labelStyle}>Quantité disponible</label>
                <input type="number" placeholder="Stock" className={inputStyle} value={stock} onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className={labelStyle}>Variantes : Couleurs</label>
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text" placeholder="Ex: Rouge" className={`${inputStyle} !py-3 !text-xs`} 
                    value={newColor} onChange={(e) => setNewColor(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addVariant('color'); }}}
                  />
                  <button type="button" onClick={() => addVariant('color')} className="bg-gray-900 text-white px-4 rounded-xl hover:bg-brand-primary transition-colors"><Plus size={18} /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c, i) => (
                    <span key={i} className="bg-slate-100 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-2">
                      {c} <X size={12} className="cursor-pointer text-rose-500" onClick={() => setColors(colors.filter((_, idx) => idx !== i))} />
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelStyle}>Variantes : Tailles</label>
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text" placeholder="Ex: 44 ou XL" className={`${inputStyle} !py-3 !text-xs`} 
                    value={newSize} onChange={(e) => setNewSize(e.target.value)}
                    onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); addVariant('size'); }}}
                  />
                  <button type="button" onClick={() => addVariant('size')} className="bg-gray-900 text-white px-4 rounded-xl hover:bg-brand-primary transition-colors"><Plus size={18} /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s, i) => (
                    <span key={i} className="bg-brand-primary/10 text-brand-primary px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-2">
                      {s} <X size={12} className="cursor-pointer" onClick={() => setSizes(sizes.filter((_, idx) => idx !== i))} />
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className={labelStyle}>Présentation (Description)</label>
              <textarea placeholder="Donnez envie aux clients de Ouaga..." className={`${inputStyle} min-h-[120px] resize-none`} value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>

            <div className={`p-8 rounded-[2.5rem] border-2 ${category === "Pack FestiSolde" ? "bg-brand-primary/5 border-brand-primary/10 shadow-inner" : "bg-slate-50 border-slate-100"}`}>
              <div className="flex items-center gap-2 mb-6 font-black uppercase text-xs italic">
                <Tag size={16} className="text-brand-primary" /> Configuration des Prix (FCFA)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Prix habituel (Barré)</label>
                  <input type="number" className={`${inputStyle} !bg-white`} value={price} onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))} required />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-brand-primary mb-2 uppercase tracking-widest">Prix FestiSolde (Promo)</label>
                  <input type="number" className={`${inputStyle} !bg-white border-brand-primary/30 text-brand-primary`} value={promoPrice} onChange={(e) => setPromoPrice(e.target.value === '' ? '' : Number(e.target.value))} required />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className={`w-full py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 ${category === "Pack FestiSolde" ? "bg-brand-primary text-white shadow-xl shadow-brand-primary/30" : "bg-gray-900 text-white hover:bg-brand-primary"}`}>
              {loading ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : "Mettre en vente maintenant"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}