import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Upload, Loader2, Plus, Sparkles, 
  ChevronDown, Tag, Trash2, Save 
} from 'lucide-react'
import { toast } from 'sonner'

const CATEGORIES = ["Packeo", "Électronique", "Mode & Beauté", "Maison & Déco", "Alimentation", "Santé", "Sport", "Services", "Autres"]

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  product?: any | null 
}

export default function AddProductModal({ isOpen, onClose, onSuccess, product }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [shopId, setShopId] = useState<string | null>(null)

  // Form State
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

  useEffect(() => {
    if (isOpen) loadShopAndProduct()
  }, [isOpen, product])

  const loadShopAndProduct = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
    if (shop) setShopId(shop.id)

    if (product) {
      setTitle(product.title)
      setDescription(product.description)
      setCategory(product.category || '')
      setPrice(product.price)
      setPromoPrice(product.promo_price || '')
      setStock(product.stock || '')
      setColors(product.colors || [])
      setSizes(product.sizes || [])
      setPreviews(product.images || [])
    } else {
      resetForm()
    }
  }

  const resetForm = () => {
    setTitle(''); setDescription(''); setCategory(''); setPrice(''); setPromoPrice('');
    setStock(''); setColors([]); setSizes([]); setImages([]); setPreviews([]);
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    if (previews.length + files.length > 4) return toast.error("Maximum 4 photos")
    
    setImages(prev => [...prev, ...files])
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setPreviews(prev => [...prev, ...newPreviews])
  }

  const removeImage = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index))
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const addVariant = (type: 'color' | 'size') => {
    if (type === 'color' && newColor.trim()) {
      setColors([...colors, newColor.trim()]); setNewColor('')
    } else if (type === 'size' && newSize.trim()) {
      setSizes([...sizes, newSize.trim()]); setNewSize('')
    }
  }

  const uploadImages = async () => {
    const uploadedUrls = [...previews.filter(p => p.startsWith('http'))]
    
    for (const file of images) {
      const ext = file.name.split('.').pop()
      const fileName = `${shopId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
      const { error } = await supabase.storage.from('products').upload(fileName, file)
      if (error) throw error
      const { data } = supabase.storage.from('products').getPublicUrl(fileName)
      uploadedUrls.push(data.publicUrl)
    }
    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (previews.length === 0) return toast.error("Ajoutez au moins une photo")
    setLoading(true)

    try {
      const imageUrls = await uploadImages()
      const productData = {
        shop_id: shopId,
        title, description, category,
        price: Number(price),
        promo_price: promoPrice !== '' ? Number(promoPrice) : null,
        stock: Number(stock),
        images: imageUrls,
        colors, sizes,
        is_featured: category === "Packeo"
      }

      const { error } = product 
        ? await supabase.from('products').update(productData).eq('id', product.id)
        : await supabase.from('products').insert([productData])

      if (error) throw error
      toast.success(product ? 'Mis à jour !' : 'Publié !')
      onSuccess(); onClose()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const labelStyle = "block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 ml-1"
  const inputStyle = "w-full bg-slate-50 border-2 border-slate-100 focus:border-brand-primary focus:bg-white rounded-2xl px-5 py-3 outline-none font-bold text-gray-900 transition-all text-sm"

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative"
      >
        {/* Banner Packeo */}
        <AnimatePresence>
          {category === "Packeo" && (
            <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="bg-brand-primary text-white py-2 px-8 flex items-center justify-center gap-3 font-black text-[9px] uppercase tracking-[0.3em]">
              <Sparkles size={12} fill="white" /> Pack Spécial Vedette Activé
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6 border-b flex justify-between items-center px-10">
          <h2 className="text-2xl font-black text-gray-900 italic uppercase tracking-tighter">
            {product ? 'Modifier' : 'Ajouter'} <span className="text-brand-primary">Article</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 overflow-y-auto space-y-8 custom-scrollbar">
          
          {/* Photos Section */}
          <div className="space-y-3">
            <label className={labelStyle}>Photos du produit ({previews.length}/4)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {previews.map((src, index) => (
                <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-100">
                  <img src={src} className="w-full h-full object-cover" alt="" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute inset-0 bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              {previews.length < 4 && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 hover:border-brand-primary text-gray-400 hover:text-brand-primary transition-all">
                  <Upload size={20} />
                  <span className="text-[8px] font-black uppercase mt-1">Ajouter</span>
                </button>
              )}
            </div>
            <input type="file" ref={fileInputRef} multiple className="hidden" onChange={handleImageChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelStyle}>Nom de l'article</label>
              <input type="text" className={inputStyle} value={title} onChange={e => setTitle(e.target.value)} required />
            </div>

            <div>
              <label className={labelStyle}>Catégorie</label>
              <div className="relative">
                <select className={`${inputStyle} appearance-none`} value={category} onChange={e => setCategory(e.target.value)} required>
                  <option value="">Sélectionner...</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={labelStyle}>Stock disponible</label>
              <input type="number" className={inputStyle} value={stock} onChange={e => setStock(e.target.value === '' ? '' : Number(e.target.value))} required />
            </div>
          </div>

          {/* Variants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Couleurs</label>
              <div className="flex gap-2 mb-2">
                <input type="text" className={`${inputStyle} !py-2`} value={newColor} onChange={e => setNewColor(e.target.value)} placeholder="Ex: Vert" />
                <button type="button" onClick={() => addVariant('color')} className="bg-gray-900 text-white px-3 rounded-xl hover:bg-brand-primary"><Plus size={18} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {colors.map((c, i) => <span key={i} className="bg-slate-100 px-2 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-2">{c} <X size={10} className="cursor-pointer text-rose-500" onClick={() => setColors(colors.filter((_, idx) => idx !== i))} /></span>)}
              </div>
            </div>
            <div>
              <label className={labelStyle}>Tailles</label>
              <div className="flex gap-2 mb-2">
                <input type="text" className={`${inputStyle} !py-2`} value={newSize} onChange={e => setNewSize(e.target.value)} placeholder="Ex: XL" />
                <button type="button" onClick={() => addVariant('size')} className="bg-gray-900 text-white px-3 rounded-xl hover:bg-brand-primary"><Plus size={18} /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s, i) => <span key={i} className="bg-brand-primary/10 text-brand-primary px-2 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-2">{s} <X size={10} className="cursor-pointer" onClick={() => setSizes(sizes.filter((_, idx) => idx !== i))} /></span>)}
              </div>
            </div>
          </div>

          {/* Pricing Box */}
          <div className={`p-6 rounded-[2rem] border-2 ${category === "Packeo" ? "bg-brand-primary/5 border-brand-primary/20" : "bg-slate-50 border-slate-50"}`}>
            <div className="flex items-center gap-2 mb-4 font-black uppercase text-[10px] italic"><Tag size={14} className="text-brand-primary" /> Tarification (XOF)</div>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="Prix normal" className={`${inputStyle} !bg-white`} value={price} onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))} required />
              <input type="number" placeholder="Prix promo" className={`${inputStyle} !bg-white border-brand-primary/20 text-brand-primary`} value={promoPrice} onChange={e => setPromoPrice(e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-primary transition-all shadow-xl flex items-center justify-center gap-3">
            {loading ? <Loader2 className="animate-spin" /> : (product ? <Save size={18} /> : <Plus size={18} />)}
            {loading ? "Synchronisation..." : (product ? "Enregistrer les modifications" : "Publier l'article")}
          </button>
        </form>
      </motion.div>
    </div>
  )
}