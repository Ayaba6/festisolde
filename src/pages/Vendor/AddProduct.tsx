import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Upload, X, Package, Tag, Info, Image as ImageIcon, CheckCircle2, AlertCircle, ListFilter } from 'lucide-react'

// Liste des catégories (tu peux les adapter à ton marché)
const CATEGORIES = [
  "Électronique", "Mode & Beauté", "Maison & Déco", 
  "Alimentation", "Santé", "Sport", "Services", "Autres"
]

export default function AddProduct() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [shopId, setShopId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('') // Nouvel état pour la catégorie
  const [price, setPrice] = useState<number | ''>('')
  const [promoPrice, setPromoPrice] = useState<number | ''>('')
  const [stock, setStock] = useState<number | ''>('')
  
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadShop = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: shop, error } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (error || !shop) {
        navigate('/vendor/create-shop')
        return
      }
      setShopId(shop.id)
    }
    loadShop()
  }, [navigate])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
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
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, file)

      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('products').getPublicUrl(fileName)
      uploadedUrls.push(data.publicUrl)
    }
    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (images.length === 0) return setError("Veuillez ajouter au moins une image.")
    if (!category) return setError("Veuillez choisir une catégorie.")
    
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      if (!shopId) throw new Error('Boutique introuvable')
      const imageUrls = await uploadImages()

      const { error } = await supabase.from('products').insert({
        shop_id: shopId,
        title,
        description,
        category, // Ajout de la catégorie dans l'insert
        price: Number(price),
        promo_price: promoPrice ? Number(promoPrice) : null,
        stock: Number(stock),
        images: imageUrls,
      })

      if (error) throw error

      setMessage('Produit ajouté avec succès 🎉')
      setTitle(''); setDescription(''); setCategory(''); setPrice(''); setPromoPrice(''); setStock(''); setImages([]); setPreviews([]);
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!shopId) return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
            <Package size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Nouveau produit</h1>
            <p className="text-gray-500 font-medium text-sm">Remplissez les détails pour vendre votre article</p>
          </div>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl flex items-center gap-3">
            <CheckCircle2 size={20} /> <span className="font-bold">{message}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3">
            <AlertCircle size={20} /> <span className="font-bold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Titre */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                <Tag size={14} /> Titre du produit
              </label>
              <input
                type="text"
                placeholder="Ex: Chaussures de sport Nike"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-6 py-4 outline-none font-bold transition-all"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
                <ListFilter size={14} /> Catégorie
              </label>
              <select
                className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-6 py-4 outline-none font-bold transition-all appearance-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Sélectionner...</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* Stock */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Stock disponible</label>
              <input
                type="number"
                placeholder="Quantité"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-6 py-4 outline-none font-bold transition-all"
                value={stock}
                onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                min={0}
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">
              <Info size={14} /> Description
            </label>
            <textarea
              placeholder="Détails du produit..."
              className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-6 py-4 outline-none font-medium transition-all resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          {/* Prix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Prix Standard (XOF)</label>
              <input
                type="number"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-6 py-4 outline-none font-bold transition-all"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                min={0} required
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2 ml-1">Prix Promo (Optionnel)</label>
              <input
                type="number"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl px-6 py-4 outline-none font-bold transition-all text-indigo-600"
                value={promoPrice}
                onChange={(e) => setPromoPrice(e.target.value === '' ? '' : Number(e.target.value))}
                min={0}
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 mb-4 ml-1">
              <ImageIcon size={14} /> Photos ({images.length})
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {previews.map((src, index) => (
                <div key={src} className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-100">
                  <img src={src} alt="preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50 transition-all">
                <Upload size={24} />
                <span className="text-[10px] font-black uppercase tracking-tighter">Ajouter</span>
              </button>
            </div>
            <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-5 rounded-[1.5rem] font-black text-lg transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <> <Package size={20} /> Publier le produit </>}
          </button>
        </form>
      </div>
    </div>
  )
}