import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Upload, Loader2, Plus, Sparkles, 
  ChevronDown, Tag, Trash2, Save 
} from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  product?: any | null 
}

interface DbCategory {
  id: string
  name: string
  parent_id: string | null
}

export default function AddProductModal({ isOpen, onClose, onSuccess, product }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [shopId, setShopId] = useState<string | null>(null)

  // États des catégories
  const [allCategories, setAllCategories] = useState<DbCategory[]>([])
  const [parentCategoryId, setParentCategoryId] = useState('') // Pour le premier select
  const [subCategories, setSubCategories] = useState<DbCategory[]>([]) // Liste filtrée
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState('') // La valeur finale (ID)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
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

  useEffect(() => {
    if (isOpen) initializeData()
  }, [isOpen, product])

  // Logique de cascade : quand la catégorie parente change
  useEffect(() => {
    if (parentCategoryId) {
      const children = allCategories.filter(c => c.parent_id === parentCategoryId)
      setSubCategories(children)
      // Si on n'est pas en mode édition, on reset la sous-catégorie
      if (!product || parentCategoryId !== product.parent_category_id) {
        setSelectedSubCategoryId('')
      }
    } else {
      setSubCategories([])
    }
  }, [parentCategoryId, allCategories])

  const initializeData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: shop } = await supabase.from('shops').select('id').eq('owner_id', user.id).single()
    if (shop) setShopId(shop.id)

    // On récupère toutes les catégories (Parents et Enfants)
    const { data: cats } = await supabase.from('categories').select('id, name, parent_id').order('name')
    if (cats) setAllCategories(cats)

    if (product) {
      setTitle(product.title)
      setDescription(product.description || '')
      setPrice(product.price)
      setPromoPrice(product.promo_price || '')
      setStock(product.stock || '')
      setColors(product.colors || [])
      setSizes(product.sizes || [])
      setPreviews(product.images || [])
      setIsCustomizable(product.allow_custom_pack || false)
      
      // Gestion de la hiérarchie en édition
      if (product.category_id) {
        const currentCat = cats?.find(c => c.id === product.category_id)
        if (currentCat?.parent_id) {
            setParentCategoryId(currentCat.parent_id)
            setSelectedSubCategoryId(currentCat.id)
        } else {
            setParentCategoryId(product.category_id)
        }
      }
    } else {
      resetForm()
    }
  }

  const resetForm = () => {
    setTitle(''); setDescription(''); setParentCategoryId(''); setSelectedSubCategoryId(''); 
    setPrice(''); setPromoPrice(''); setStock(''); setColors([]); setSizes([]); 
    setImages([]); setPreviews([]); setIsCustomizable(false)
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
      if (colors.includes(newColor.trim())) return toast.error("Déjà ajouté")
      setColors([...colors, newColor.trim()]); setNewColor('')
    } else if (type === 'size' && newSize.trim()) {
      if (sizes.includes(newSize.trim())) return toast.error("Déjà ajouté")
      setSizes([...sizes, newSize.trim()]); setNewSize('')
    }
  }

  const removeVariant = (type: 'color' | 'size', value: string) => {
    if (type === 'color') setColors(colors.filter(c => c !== value))
    else setSizes(sizes.filter(s => s !== value))
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
    if (!parentCategoryId) return toast.error("Choisissez une catégorie")
    setLoading(true)

    try {
      const imageUrls = await uploadImages()
      
      // On prend l'ID de la sous-catégorie si elle existe, sinon le parent
      const finalCategoryId = selectedSubCategoryId || parentCategoryId
      const finalCategoryName = allCategories.find(c => c.id === finalCategoryId)?.name

      const productData = {
        shop_id: shopId,
        title, description,
        category_id: finalCategoryId,
        category: finalCategoryName,
        price: Number(price),
        promo_price: promoPrice !== '' ? Number(promoPrice) : null,
        stock: Number(stock),
        images: imageUrls,
        colors, sizes,
        is_featured: finalCategoryName === "Packeo" || finalCategoryName === "Pack FestiSolde",
        allow_custom_pack: isCustomizable
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

  const labelStyle = "block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3 ml-1"
  const inputStyle = "w-full bg-slate-50 border-2 border-slate-100 focus:border-brand-primary focus:bg-white rounded-2xl px-6 py-4 outline-none font-bold text-gray-900 transition-all text-sm"
  const variantBadge = "flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col relative"
      >
        <div className="p-8 border-b flex justify-between items-center px-10">
          <h2 className="text-3xl font-black text-gray-900 italic uppercase tracking-tighter">
            {product ? 'Modifier' : 'Ajouter'} <span className="text-brand-primary">Article</span>
          </h2>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 overflow-y-auto space-y-10 custom-scrollbar">
          
          {/* PHOTOS */}
          <div className="space-y-4">
            <label className={labelStyle}>Photos ({previews.length}/4)</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {previews.map((src, index) => (
                <div key={index} className="relative aspect-square rounded-[1.5rem] overflow-hidden group border border-slate-100 shadow-sm">
                  <img src={src} className="w-full h-full object-cover" alt="" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute inset-0 bg-rose-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <Trash2 size={24} />
                  </button>
                </div>
              ))}
              {previews.length < 4 && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-[1.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 hover:border-brand-primary text-gray-400 hover:text-brand-primary transition-all">
                  <Upload size={20} />
                  <span className="text-[9px] font-black uppercase mt-2">Ajouter</span>
                </button>
              )}
            </div>
            <input type="file" ref={fileInputRef} multiple className="hidden" onChange={handleImageChange} />
          </div>

          {/* INFOS GÉNÉRALES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2">
              <label className={labelStyle}>Nom de l'article</label>
              <input type="text" className={inputStyle} value={title} onChange={e => setTitle(e.target.value)} required />
            </div>

            {/* SÉLECTION CATÉGORIE PARENTE */}
            <div>
              <label className={labelStyle}>Catégorie Principale</label>
              <div className="relative">
                <select 
                  className={`${inputStyle} appearance-none cursor-pointer`} 
                  value={parentCategoryId} 
                  onChange={e => setParentCategoryId(e.target.value)} 
                  required
                >
                  <option value="">Sélectionner...</option>
                  {allCategories.filter(c => !c.parent_id).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* SÉLECTION SOUS-CATÉGORIE (Sandales, Claquettes, etc.) */}
            <div className={!parentCategoryId ? 'opacity-40 pointer-events-none' : ''}>
              <label className={labelStyle}>Sous-Catégorie (Optionnel)</label>
              <div className="relative">
                <select 
                  className={`${inputStyle} appearance-none cursor-pointer`} 
                  value={selectedSubCategoryId} 
                  onChange={e => setSelectedSubCategoryId(e.target.value)}
                >
                  <option value="">Tous {allCategories.find(c => c.id === parentCategoryId)?.name}</option>
                  {subCategories.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
                <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className={labelStyle}>Stock disponible</label>
              <input type="number" className={inputStyle} value={stock} onChange={e => setStock(e.target.value === '' ? '' : Number(e.target.value))} required />
            </div>
          </div>

          {/* VARIANTES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className={labelStyle}>Couleurs</label>
              <div className="flex gap-2">
                <input type="text" placeholder="Noir, Rouge..." className={inputStyle} value={newColor} onChange={e => setNewColor(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addVariant('color'))} />
                <button type="button" onClick={() => addVariant('color')} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-brand-primary"><Plus size={20} /></button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {colors.map(color => (
                  <span key={color} className={variantBadge}>{color}<button type="button" onClick={() => removeVariant('color', color)}><X size={12} /></button></span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className={labelStyle}>Tailles / Pointures</label>
              <div className="flex gap-2">
                <input type="text" placeholder="XL, 42..." className={inputStyle} value={newSize} onChange={e => setNewSize(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addVariant('size'))} />
                <button type="button" onClick={() => addVariant('size')} className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-brand-primary"><Plus size={20} /></button>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {sizes.map(size => (
                  <span key={size} className={variantBadge}>{size}<button type="button" onClick={() => removeVariant('size', size)}><X size={12} /></button></span>
                ))}
              </div>
            </div>
          </div>

          {/* PRICING */}
          <div className="p-8 rounded-[2.5rem] border-2 bg-slate-50 border-slate-100">
            <div className="flex items-center gap-2 mb-6 font-black uppercase text-xs italic text-gray-600">
              <Tag size={16} className="text-brand-primary" /> Tarification (FCFA)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <input type="number" placeholder="Prix habituel" className={`${inputStyle} !bg-white`} value={price} onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))} required />
              <input type="number" placeholder="Prix FestiSolde 🔥" className={`${inputStyle} !bg-white border-brand-primary/30 text-brand-primary`} value={promoPrice} onChange={e => setPromoPrice(e.target.value === '' ? '' : Number(e.target.value))} required />
            </div>
          </div>

          {/* TOGGLE PACK */}
          <div 
            onClick={() => setIsCustomizable(!isCustomizable)}
            className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex items-center justify-between ${
              isCustomizable ? 'bg-brand-primary border-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-white border-slate-100 text-gray-400'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${isCustomizable ? 'bg-white/20' : 'bg-slate-100'}`}><Plus size={20} /></div>
              <div>
                <p className={`font-black uppercase italic text-xs leading-none mb-1 ${isCustomizable ? 'text-white' : 'text-gray-900'}`}>Éligible au Pack Personnalisé</p>
                <p className="text-[10px] font-bold uppercase italic opacity-70">Permet au client d'inclure cet article dans un look composé</p>
              </div>
            </div>
            <div className={`w-12 h-6 rounded-full relative transition-colors ${isCustomizable ? 'bg-white/30' : 'bg-slate-200'}`}>
              <motion.div animate={{ x: isCustomizable ? 24 : 4 }} className="w-4 h-4 rounded-full bg-white absolute top-1" />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className={labelStyle}>Description détaillée</label>
            <textarea className={`${inputStyle} min-h-[120px] resize-none`} value={description} onChange={e => setDescription(e.target.value)} required />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-brand-primary transition-all shadow-xl flex items-center justify-center gap-3">
            {loading ? <Loader2 className="animate-spin" /> : (product ? <Save size={18} /> : <Plus size={18} />)}
            {loading ? "Synchronisation..." : (product ? "Mettre à jour" : "Publier l'article")}
          </button>
        </form>
      </motion.div>
    </div>
  )
}