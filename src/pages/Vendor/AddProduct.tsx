import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { Upload, X, Package, Tag, Info, Image as ImageIcon, ListFilter, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

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
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  const [promoPrice, setPromoPrice] = useState<number | ''>('')
  const [stock, setStock] = useState<number | ''>('')
  
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
      const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('products').getPublicUrl(fileName)
      uploadedUrls.push(data.publicUrl)
    }
    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (images.length === 0) return toast.error("Ajoutez au moins une photo")
    if (!category) return toast.error("Choisissez une catégorie")
    setLoading(true)
    try {
      const imageUrls = await uploadImages()
      const { error } = await supabase.from('products').insert({
        shop_id: shopId, title, description, category,
        price: Number(price), promo_price: promoPrice ? Number(promoPrice) : null,
        stock: Number(stock), images: imageUrls,
      })
      if (error) throw error
      toast.success('Produit publié !')
      navigate('/vendor/dashboard')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!shopId) return <div className="h-screen flex items-center justify-center font-bold">Chargement...</div>

  // Style commun pour tous les champs pour assurer la visibilité
  const inputStyle = "w-full bg-white border-2 border-gray-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-[1.2rem] px-6 py-5 outline-none font-bold text-gray-900 transition-all shadow-sm placeholder:text-gray-400"

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-black text-xs uppercase tracking-widest mb-6">
          <ArrowLeft size={18} /> Retour
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-gray-200">
          
          <header className="mb-10">
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2 text-center md:text-left">Nouveau Produit</h1>
            <p className="text-gray-500 font-bold text-center md:text-left">Remplissez les champs ci-dessous pour vendre.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* PHOTOS */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-widest text-gray-700 ml-1">Photos du produit</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {previews.map((src, index) => (
                  <div key={src} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-200">
                    <img src={src} className="w-full h-full object-cover" alt="" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-lg shadow-lg">
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {images.length < 4 && (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 hover:bg-indigo-50 hover:border-indigo-400 transition-all text-gray-400">
                    <Upload size={24} />
                    <span className="text-[10px] font-black uppercase mt-1">Ajouter</span>
                  </button>
                )}
              </div>
              <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            {/* TITRE */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-700 mb-2 ml-1">Nom du produit</label>
              <input
                type="text"
                placeholder="Entrez le nom de l'article"
                className={inputStyle}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CATEGORIE */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-700 mb-2 ml-1">Catégorie</label>
                <div className="relative">
                  <select className={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)} required>
                    <option value="">Choisir...</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <ListFilter size={20} className="absolute right-6 top-5.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* STOCK */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-700 mb-2 ml-1">Quantité Stock</label>
                <input
                  type="number"
                  placeholder="Ex: 10"
                  className={inputStyle}
                  value={stock}
                  onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
                  min={1} required
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-700 mb-2 ml-1">Description</label>
              <textarea
                placeholder="Décrivez votre article..."
                className={`${inputStyle} min-h-[120px] resize-none font-medium`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* PRIX (ZONE GRISE POUR BIEN SEPARER) */}
            <div className="p-6 bg-gray-50 rounded-3xl border-2 border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-600 mb-2">Prix de vente (F CFA)</label>
                <input
                  type="number"
                  className={`${inputStyle} text-2xl`}
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-indigo-600 mb-2">Prix Promotionnel (Optionnel)</label>
                <input
                  type="number"
                  className={`${inputStyle} text-2xl text-indigo-600 border-indigo-200`}
                  value={promoPrice}
                  onChange={(e) => setPromoPrice(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-[1.5rem] font-black text-lg uppercase tracking-widest transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95"
            >
              {loading ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : "Mettre en ligne"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}