import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useNavigate, useParams } from 'react-router-dom'
import { Upload, X, Save, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

const CATEGORIES = ["Électronique", "Mode & Beauté", "Maison & Déco", "Alimentation", "Santé", "Sport", "Services", "Autres"]

export default function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  
  // États initialisés avec des valeurs par défaut pour éviter les erreurs undefined
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  const [promoPrice, setPromoPrice] = useState<number | ''>('')
  const [stock, setStock] = useState<number | ''>('')
  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()

        if (error || !data) {
          toast.error("Produit introuvable")
          navigate('/vendor/dashboard')
          return
        }

        // On remplit les états avec les données reçues
        setTitle(data.title || '')
        setDescription(data.description || '')
        setCategory(data.category || '')
        setPrice(data.price || '')
        setPromoPrice(data.promo_price || '')
        setStock(data.stock || 0)
        setExistingImages(data.images || [])
      } catch (err) {
        console.error(err)
        toast.error("Erreur de chargement")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id, navigate])

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : []
    setNewImages((prev) => [...prev, ...files])
    const previews = files.map((file) => URL.createObjectURL(file))
    setNewPreviews((prev) => [...prev, ...previews])
  }

  const removeExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(img => img !== url))
  }

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
    setNewPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)

    try {
      let finalImages = [...existingImages]

      // Upload des nouvelles images
      for (const file of newImages) {
        const ext = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`
        const { error: upError } = await supabase.storage.from('products').upload(fileName, file)
        if (upError) throw upError
        const { data } = supabase.storage.from('products').getPublicUrl(fileName)
        finalImages.push(data.publicUrl)
      }

      const { error } = await supabase
        .from('products')
        .update({
          title, description, category,
          price: Number(price),
          promo_price: promoPrice ? Number(promoPrice) : null,
          stock: Number(stock),
          images: finalImages
        })
        .eq('id', id)

      if (error) throw error
      toast.success("Produit mis à jour !")
      navigate('/vendor/dashboard')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setUpdating(false)
    }
  }

  // ÉCRAN DE CHARGEMENT POUR ÉVITER LES ERREURS DE RENDU
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-xs uppercase tracking-[0.2em] text-indigo-600">Chargement des données...</p>
        </div>
      </div>
    )
  }

  const inputStyle = "w-full bg-white border-2 border-gray-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 rounded-[1.2rem] px-6 py-5 outline-none font-bold text-gray-900 transition-all shadow-sm"

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-black text-xs uppercase tracking-widest mb-8 transition-all">
          <ArrowLeft size={18} /> Retour au dashboard
        </button>

        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* PHOTOS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {existingImages.map((url) => (
                <div key={url} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 shadow-inner">
                  <img src={url} className="w-full h-full object-cover" alt="" />
                  <button type="button" onClick={() => removeExistingImage(url)} className="absolute top-1 right-1 p-1.5 bg-red-600 text-white rounded-lg"><X size={14} /></button>
                </div>
              ))}
              {newPreviews.map((src, i) => (
                <div key={src} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-indigo-400">
                  <img src={src} className="w-full h-full object-cover" alt="" />
                  <button type="button" onClick={() => removeNewImage(i)} className="absolute top-1 right-1 p-1.5 bg-gray-900 text-white rounded-lg"><X size={14} /></button>
                </div>
              ))}
              {(existingImages.length + newImages.length) < 4 && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 text-gray-400 hover:bg-indigo-50 transition-all">
                  <Upload size={24} />
                  <span className="text-[10px] font-black uppercase mt-1">Ajouter</span>
                </button>
              )}
            </div>
            <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={handleNewImageChange} />

            {/* TITRE */}
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Nom de l'article</label>
              <input type="text" className={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Catégorie</label>
                <select className={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)} required>
                  <option value="">Choisir...</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Quantité en stock</label>
                <input type="number" className={inputStyle} value={stock} onChange={(e) => setStock(Number(e.target.value))} required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Description</label>
              <textarea className={`${inputStyle} min-h-[120px]`} value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>

            <div className="p-6 bg-gray-50 rounded-3xl border-2 border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-gray-600 mb-2">Prix (F CFA)</label>
                <input type="number" className={inputStyle} value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
              </div>
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-indigo-600 mb-2">Prix Promo</label>
                <input type="number" className={`${inputStyle} text-indigo-600 border-indigo-200`} value={promoPrice} onChange={(e) => setPromoPrice(e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
            </div>

            <button disabled={updating} type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6 rounded-3xl font-black text-lg uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-4">
              {updating ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={20} /> Enregistrer</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}